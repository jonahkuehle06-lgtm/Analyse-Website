import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { kanonisch } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "Finanzielle Freiheit ist für jeden. Analysen und Research zu Aktien.",
  ...kanonisch("/ueber-uns"),
};

/**
 * Die Texte dieser Seite. Jeder Eintrag in `absaetze` wird ein eigener
 * Absatz.
 */
const TITEL = "Finanzielle Freiheit ist für jeden.";

const EINLEITUNG =
  "Wir bei Pax Solutions haben es uns zur Aufgabe gemacht, hohe Renditen und finanzielle Bildung für jeden zugänglich zu machen. Denn jeder Mensch sollte die Möglichkeit haben, ein finanziell freies und somit selbstbestimmtes Leben zu führen. Die richtigen Investmententscheidungen lassen sich nur mit den richtigen Informationen treffen. Wir bereiten diese Informationen so auf, dass fundierte Entscheidungen in kurzer Zeit getroffen werden können.";

const ABSCHNITTE: { titel: string; absaetze: string[] }[] = [
  {
    titel: "Jonah Kühle",
    absaetze: [
      "Bereits als Kind hatte ich großes Interesse an allem, was mit Geld zu tun hat. Später kamen die ersten konkreten Pläne hinzu. ETFs, Aktien und Kryptowährungen – insbesondere mit Letzteren musste ich zunächst erhebliche Verluste hinnehmen.",
      "Mein Interesse an den Finanzmärkten verstärkte und vertiefte sich während meiner Ausbildung zum Kaufmann für Versicherungen und Finanzanlagen nochmals. Durch unzählige Stunden mit Bilanzen, Charts, Bewertungsmethoden und Fachbüchern konnte ich meine Kenntnisse stetig erweitern und erfolgreiche Aktieninvestments tätigen. Die Methoden, mit denen ich analysiere, möchte ich heute mit anderen teilen.",
    ],
  },
  {
    titel: "Pax Solutions",
    absaetze: [
      "Wir bei Pax setzen auf langfristige Investments, häufig in Unternehmen, die wir im Idealfall niemals wieder verkaufen müssen.",
      "Wir analysieren Bilanzen und bewerten, ob ein Unternehmen vom Markt angemessen bewertet ist. Dabei beziehen wir auch technische Indikatoren ein. Zur Einschätzung möglicher künftiger Kursentwicklungen nutzen wir Bewertungsmodelle sowie Elliott-Wellen.",
      "Unser Augenmerk liegt stets auf dem Value eines Unternehmens und dem wirtschaftlichen Mehrwert, den es bietet. Eine große Inspiration sind dabei die Methoden von Warren Buffett und Benjamin Graham, deren Ansätze wir teilweise bis heute verfolgen.",
      "Wir sind uns der Verantwortung, die mit finanziellen Entscheidungen einhergeht, mehr als bewusst und gehen entsprechend sorgfältig damit um.",
      "Unser Ziel ist es, die Erwartungen unserer Kunden ebenso wie unsere eigenen stets zu übertreffen.",
      "Darüber hinaus berücksichtigen wir das Verhalten der Marktteilnehmer sowie politische Entwicklungen in den jeweiligen Ländern. Die wirtschaftliche Lage betrachten wir stets im Kontext der jeweiligen Branche. Durch Maßnahmen wie Diversifikation und die Berücksichtigung von Sicherheitsmargen beugen wir Risiken vor.",
    ],
  },
];

const SCHLUSS = "Viel Spaß beim Investieren!";

export default function UeberUnsPage() {
  return (
    <div className="frame">
      <div className="py-14 sm:py-20">
        <PageHeader label="Über uns" title={TITEL} lead={EINLEITUNG} />

        {/* Abschnitte untereinander: links der Titel, rechts der Text.
            Am Telefon steht der Titel ueber dem Text. */}
        <div className="border-b border-[var(--color-line)]">
          {ABSCHNITTE.map((a) => (
            <section
              key={a.titel}
              className="grid gap-4 border-t border-[var(--color-line)] py-10 first:border-t-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-12 sm:py-14"
            >
              <h2 className="display text-[length:var(--step-h3)] font-normal leading-tight text-[var(--color-platinum)]">
                {a.titel}
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-[var(--color-mist)]">
                {a.absaetze.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="display mt-12 text-[length:var(--step-h3)] text-[var(--color-platinum)]">
          {SCHLUSS}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
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
