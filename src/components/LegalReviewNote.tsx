/**
 * Hinweis für den Betreiber: Die Rechtstexte dieser Seite sind Entwürfe.
 * Sie ersetzen keine Rechtsberatung und müssen vor dem Livegang anwaltlich
 * geprüft und an den tatsächlichen Geschäftsbetrieb angepasst werden.
 *
 * Nach der Prüfung genügt es, die Umgebungsvariable
 *   NEXT_PUBLIC_LEGAL_REVIEWED=true
 * zu setzen — dann verschwindet dieser Kasten auf allen Rechtsseiten.
 */
export default function LegalReviewNote() {
  if (process.env.NEXT_PUBLIC_LEGAL_REVIEWED === "true") return null;

  return (
    <aside
      className="mb-10 border border-[rgba(232,198,75,0.32)] border-l-2 border-l-[var(--color-warning)] bg-[rgba(232,198,75,0.05)] px-6 py-5"
      role="note"
    >
      <p className="text-sm font-semibold text-[var(--color-warning)]">
        Entwurf — noch nicht rechtlich geprüft
      </p>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--color-mist-2)]">
        Dieser Text ist eine Vorlage und keine Rechtsberatung. Er muss vor dem Livegang
        durch eine Rechtsanwältin oder einen Rechtsanwalt geprüft und an den tatsächlichen
        Geschäftsbetrieb angepasst werden.
      </p>
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        Nach der Prüfung <code className="font-sans font-semibold break-all text-[var(--color-mist-2)]">NEXT_PUBLIC_LEGAL_REVIEWED=true</code>{" "}
        setzen, um diesen Kasten auszublenden.
      </p>
    </aside>
  );
}
