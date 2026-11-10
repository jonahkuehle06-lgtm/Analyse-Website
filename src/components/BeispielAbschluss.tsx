import Link from "next/link";

/** Abschluss unter jeder Beispielanalyse: der Weg zu den Paketen. */
export default function BeispielAbschluss() {
  return (
    <section className="section-paper print:hidden">
      <div className="frame section">
        <h2 className="display max-w-[20ch] text-[length:var(--step-h2)]">
          So ist jede Analyse aufgebaut
        </h2>
        <p className="lead mt-5 max-w-[56ch]">
          Signalstärke, Begründung, Kursziel und Szenarien in drei Zeiträumen. Mit einem
          Paket liest du die aktuellsten Analysen im Kundenbereich.
        </p>
        <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <Link href="/preise" className="btn-platinum w-full sm:w-auto">
            Pakete ansehen
            <span className="pfeil" aria-hidden="true">→</span>
          </Link>
          <Link href="/methodik" className="btn-link self-start sm:self-auto">
            Methodik ansehen
            <span className="pfeil" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
