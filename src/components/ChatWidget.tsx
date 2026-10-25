"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/config";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Was ist in den Paketen enthalten?",
  "Wie funktionieren die Signalstufen?",
  "Wie kann ich kündigen?",
];

const GREETING =
  `Hallo! Ich beantworte Fragen zu den Paketen, Preisen und zur Funktionsweise von ${BRAND.name} ${BRAND.suffix}. Eine Anlageberatung darf ich nicht geben.`;

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;

    setError(null);
    setInput("");
    const next: Message[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Der Assistent ist gerade nicht erreichbar.");
      }

      setMessages([...next, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: answer }]);
      }
    } catch (e) {
      setMessages(next);
      setError(e instanceof Error ? e.message : "Unbekannter Fehler.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Öffner */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Assistent schließen" : "Assistent öffnen"}
        aria-expanded={open}
        className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[70] flex print:hidden h-14 w-14 items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-[var(--color-anthracite-2)] shadow-[var(--shadow-overlay)] transition-colors duration-200 hover:border-[var(--color-platinum)] hover:bg-[var(--color-anthracite-3)] sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="var(--color-platinum)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-4 4v-4H5.5A1.5 1.5 0 0 1 4 14.5v-9Z"
              stroke="var(--color-platinum)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Fenster */}
      {open && (
        <div
          role="dialog"
          aria-label="Assistent"
          className="surface fixed right-[max(0.75rem,env(safe-area-inset-right))] bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-[max(0.75rem,env(safe-area-inset-left))] z-[69] flex print:hidden max-h-[min(72vh,580px)] flex-col overflow-hidden shadow-[var(--shadow-overlay)] sm:left-auto sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:bottom-[calc(6rem+env(safe-area-inset-bottom))] sm:w-[410px]"
        >
          <header className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
            <div>
              <p className="display text-lg font-normal text-[var(--color-platinum)]">Assistent</p>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                Fragen zu Paketen und Funktionen
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Schließen"
              className="-mr-2 flex h-10 w-10 items-center justify-center text-[var(--color-mist)] transition-colors hover:text-[var(--color-platinum)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <p className="text-[0.9375rem] leading-relaxed text-[var(--color-mist-2)]">{GREETING}</p>

            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="min-h-10 rounded-full border border-[var(--color-line-strong)] px-4 py-2 text-left text-sm text-[var(--color-mist)] transition-colors hover:border-[var(--color-platinum)] hover:text-[var(--color-platinum)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-[var(--radius-field)] bg-[var(--color-anthracite-3)] px-4 py-2.5 text-[0.9375rem] text-[var(--color-platinum)]"
                      : "text-[0.9375rem] leading-relaxed whitespace-pre-wrap text-[var(--color-mist-2)]"
                  }
                >
                  {m.content || (busy && i === messages.length - 1 ? "…" : "")}
                </div>
              </div>
            ))}

            {busy && messages[messages.length - 1]?.role === "user" && (
              <p className="text-sm text-[var(--color-muted)]">…</p>
            )}

            {error && (
              <p className="text-sm text-[var(--color-danger)]" role="alert">
                {error}
              </p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-[var(--color-line)] px-4 py-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                maxLength={1200}
                placeholder="Frage zum Angebot …"
                className="field max-h-28 !min-h-[46px] flex-1 resize-none !py-2.5"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Senden"
                className="btn-platinum !min-h-0 !h-[46px] !w-[46px] !p-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12h13M12 5l7 7-7 7"
                    stroke="var(--color-ink)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted)]">
              Automatisierte Antworten zum Angebot. Keine Anlageberatung, keine Auskunft zu
              einzelnen Wertpapieren.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
