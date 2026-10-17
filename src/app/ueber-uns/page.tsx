import type { Metadata } from "next";
import Link from "next/link";

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
  return <span className="text-[#6b7179]">Text folgt.</span>;
}

export default function UeberUnsPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="mono-label">Wer wir sind</p>
      <h1 className="display mt-4 text-4xl sm:text-5xl">
        <span className="platinum-text">Über uns</span>
      </h1>
      <p className="mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
        {EINLEITUNG || <Platzhalter />}
      </p>

      {/* Vier Abschnitte untereinander: links Nummer und Titel, rechts der
          Text. Am Telefon steht der Titel ueber dem Text. */}
      <div className="mt-14 border-t border-[var(--color-line)]">
        {ABSCHNITTE.map((a) => (
          <section
            key={a.nr}
            className="grid gap-4 border-b border-[var(--color-line)] py-10 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-12 sm:py-14"
          >
            <div>
              <span className="mono-label !text-[0.6875rem] tabular-nums">{a.nr}</span>
              <h2 className="display mt-3 text-2xl leading-snug text-[var(--color-platinum)] sm:text-3xl">
                {a.titel}
              </h2>
            </div>
            <div className="space-y-4 text-[0.9375rem] leading-relaxed text-[var(--color-mist)] sm:pt-7">
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

      <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4">
        <Link href="/methodik" className="btn-ghost">
          Zur Methodik
        </Link>
        <Link
          href="/preise"
          className="text-sm text-[var(--color-platinum)] underline underline-offset-4"
        >
          Pakete ansehen
        </Link>
      </div>
    </div>
  );
}
