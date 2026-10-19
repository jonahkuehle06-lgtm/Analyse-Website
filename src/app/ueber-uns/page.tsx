import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "Wer hinter PAX Solutions steht: Vision, Geschichte, Erfahrung und worauf sich Vertrauen gründet.",
};

/**
 * Die Texte dieser Seite. Jeder Eintrag in `absaetze` wird ein eigener
 * Absatz. Bleibt die Liste leer, steht dort vorerst "Text folgt."
 */
const EINLEITUNG = "";

const ABSCHNITTE: { nr: string; titel: string; absaetze: string[] }[] = [
  { nr: "01", titel: "Vision", absaetze: [] },
  { nr: "02", titel: "Unsere Geschichte", absaetze: [] },
  { nr: "03", titel: "Erfahrung", absaetze: [] },
  { nr: "04", titel: "Vertrauenswürdigkeit", absaetze: [] },
];

function Platzhalter() {
  return <span className="text-[var(--color-muted)]">Text folgt.</span>;
}

export default function UeberUnsPage() {
  return (
    <div className="frame">
      <div className="py-14 sm:py-20">
        <PageHeader label="Wer wir sind" title="Über uns" lead={EINLEITUNG || <Platzhalter />} />

        {/* Vier Abschnitte untereinander: links Nummer und Titel, rechts der
            Text. Am Telefon steht der Titel ueber dem Text. */}
        <div className="border-b border-[var(--color-line)]">
          {ABSCHNITTE.map((a) => (
            <section
              key={a.nr}
              className="grid gap-4 border-t border-[var(--color-line)] py-10 first:border-t-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-12 sm:py-14"
            >
              <div>
                <span className="mono-label tabular">{a.nr}</span>
                <h2 className="display mt-3 text-[length:var(--step-h3)] font-normal leading-tight text-[var(--color-platinum)]">
                  {a.titel}
                </h2>
              </div>
              <div className="space-y-4 text-base leading-relaxed text-[var(--color-mist)] sm:pt-8">
                {a.absaetze.length > 0 ? (
                  a.absaetze.map((text, i) => <p key={i}>{text}</p>)
                ) : (
                  <p>
                    <Platzhalter />
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link href="/methodik" className="btn-ghost">
            Zur Methodik
          </Link>
          <Link href="/preise" className="btn-link">
            Pakete ansehen
            <span className="pfeil" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
