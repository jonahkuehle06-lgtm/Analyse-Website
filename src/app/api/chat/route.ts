import Anthropic from "@anthropic-ai/sdk";
import { listAnalyses } from "@/lib/db";
import { buildSystemPrompt, CHAT_LIMITS, type ChatMessage } from "@/lib/chat-knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Voreinstellung; ueber ANTHROPIC_MODEL aenderbar. */
const DEFAULT_MODEL = "claude-opus-5-5";

export function chatConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/* -------------------------------------------------------------------------- */
/* Einfache Drosselung je IP                                                   */
/*                                                                            */
/* Haelt nur innerhalb einer Serverinstanz. Auf serverlosen Hostern laufen     */
/* mehrere Instanzen parallel, die Grenze wirkt dort also weicher als          */
/* angegeben. Fuer den Zweck - Missbrauch und Kostenausreisser begrenzen -     */
/* reicht das; fuer harte Garantien braeuchte es einen gemeinsamen Speicher.   */
/* -------------------------------------------------------------------------- */

const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - CHAT_LIMITS.windowMs;
  const recent = (hits.get(ip) ?? []).filter((t) => t > cutoff);

  if (recent.length >= CHAT_LIMITS.requestsPerWindow) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);

  // Gelegentlich aufraeumen, damit die Map nicht unbegrenzt waechst.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => t <= cutoff)) hits.delete(key);
    }
  }
  return false;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unbekannt";
}

/* -------------------------------------------------------------------------- */

function sanitize(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw)) return null;

  const messages: ChatMessage[] = [];
  for (const item of raw.slice(-CHAT_LIMITS.maxHistory)) {
    if (!item || typeof item !== "object") return null;
    const { role, content } = item as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    const text = content.trim().slice(0, CHAT_LIMITS.maxMessageChars);
    if (text) messages.push({ role, content: text });
  }

  if (messages.length === 0) return null;
  // Die Konversation muss mit einer Nutzernachricht beginnen und enden.
  if (messages[0].role !== "user") return null;
  if (messages[messages.length - 1].role !== "user") return null;
  return messages;
}

export async function POST(request: Request) {
  if (!chatConfigured()) {
    return Response.json(
      { error: "Der Assistent ist derzeit nicht verfügbar." },
      { status: 503 },
    );
  }

  if (rateLimited(clientIp(request))) {
    return Response.json(
      {
        error:
          "Du hast in kurzer Zeit viele Fragen gestellt. Bitte versuche es in ein paar Minuten noch einmal.",
      },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const messages = sanitize((body as { messages?: unknown })?.messages);
  if (!messages) {
    return Response.json({ error: "Ungültiger Gesprächsverlauf." }, { status: 400 });
  }

  const analyses = await listAnalyses();
  const client = new Anthropic();

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const run = client.messages.stream({
          model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
          max_tokens: 1024,
          // Support-Antworten sollen knapp und schnell sein.
          output_config: { effort: "low" },
          system: [
            {
              type: "text",
              text: buildSystemPrompt(analyses.length),
              // Der Systemtext aendert sich selten - zwischenspeichern spart Kosten.
              cache_control: { type: "ephemeral" },
            },
          ],
          messages,
        });

        for await (const event of run) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta" &&
            event.delta.text
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        const final = await run.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode(
              "Diese Frage kann ich leider nicht beantworten. Bei Fragen zum Angebot helfe ich gern weiter.",
            ),
          );
        }
      } catch (error) {
        console.error("Chat-Fehler:", error);
        controller.enqueue(
          encoder.encode(
            "Entschuldige, da ist gerade etwas schiefgelaufen. Bitte versuche es noch einmal.",
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
