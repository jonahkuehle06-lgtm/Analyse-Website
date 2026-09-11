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
      className="mb-10 rounded-xl border border-[rgba(232,198,75,0.32)] bg-[rgba(232,198,75,0.06)] px-6 py-5"
      role="note"
    >
      <p className="text-sm font-semibold text-[#E8C64B]">
        Entwurf — noch nicht rechtlich geprüft
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-mist-2)]">
        Dieser Text ist eine Vorlage und keine Rechtsberatung. Er muss vor dem Livegang
        durch eine Rechtsanwältin oder einen Rechtsanwalt geprüft und an den tatsächlichen
        Geschäftsbetrieb angepasst werden — insbesondere hinsichtlich der Pflichten für
        entgeltliche Anlageempfehlungen (§ 85 WpHG, Art. 20 MAR, Delegierte Verordnung
        (EU) 2016/958) sowie einer etwaigen Erlaubnispflicht nach KWG/WpIG.
      </p>
      <p className="mt-3 text-xs text-[#8d939c]">
        Nach der Prüfung <code className="text-[var(--color-mist-2)]">NEXT_PUBLIC_LEGAL_REVIEWED=true</code>{" "}
        setzen, um diesen Kasten auszublenden.
      </p>
    </aside>
  );
}
