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
        className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-[#14171b] shadow-[0_10px_40px_rgba(0,0,0,0.6)] transition-transform hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6"
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
          className="surface fixed inset-x-3 bottom-24 z-[69] flex max-h-[min(70vh,560px)] flex-col overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.7)] sm:inset-x-auto sm:right-6 sm:w-[400px]"
          style={{ borderRadius: "var(--radius-card)" }}
        >
          <header className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-platinum)]">Assistent</p>
              <p className="mt-0.5 text-[0.6875rem] text-[#6b7179]">
                Fragen zu Paketen und Funktionen
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Schließen"
              className="text-[var(--color-mist)] transition-colors hover:text-[var(--color-platinum)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <p className="text-sm leading-relaxed text-[var(--color-mist-2)]">{GREETING}</p>

            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-[var(--color-line)] px-3.5 py-1.5 text-left text-[0.8125rem] text-[var(--color-mist)] transition-colors hover:border-[var(--color-line-strong)] hover:text-[var(--color-platinum)]"
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
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-[rgba(255,255,255,0.08)] px-3.5 py-2.5 text-sm text-[var(--color-platinum)]"
                      : "text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-mist-2)]"
                  }
                >
                  {m.content || (busy && i === messages.length - 1 ? "…" : "")}
                </div>
              </div>
            ))}

            {busy && messages[messages.length - 1]?.role === "user" && (
              <p className="text-sm text-[#6b7179]">…</p>
            )}

            {error && (
              <p className="text-sm text-[#F08B8B]" role="alert">
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
                className="field max-h-28 min-h-[42px] flex-1 resize-none !py-2.5"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Senden"
                className="btn-platinum !h-[42px] !w-[42px] !p-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12h13M12 5l7 7-7 7"
                    stroke="#07080a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-[0.6875rem] leading-relaxed text-[#6b7179]">
              Automatisierte Antworten zum Angebot. Keine Anlageberatung, keine Auskunft zu
              einzelnen Wertpapieren.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
