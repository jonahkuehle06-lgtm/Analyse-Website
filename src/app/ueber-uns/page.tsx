import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { brotkrumen, kanonisch } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Portrait from "@/components/Portrait";
import { COMPANY, VERANTWORTLICH, siteUrl } from "@/lib/config";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "Wer hinter PAX Solutions steht: Jonah Kühle und sein Value-Ansatz bei Aktienanalysen – mit dem Ziel, finanzielle Bildung für jeden zugänglich zu machen.",
  ...kanonisch("/ueber-uns", "Über uns"),
};

/**
 * Die Texte dieser Seite. Jeder Eintrag in `absaetze` wird ein eigener
 * Absatz.
 */
const TITEL = "Finanzielle Freiheit ist für jeden.";

const EINLEITUNG =
  "Wir bei PAX Solutions haben es uns zur Aufgabe gemacht, hohe Renditen und finanzielle Bildung für jeden zugänglich zu machen. Denn jeder Mensch sollte die Möglichkeit haben, ein finanziell freies und somit selbstbestimmtes Leben zu führen. Die richtigen Investmententscheidungen lassen sich nur mit den richtigen Informationen treffen. Wir bereiten diese Informationen so auf, dass fundierte Entscheidungen in kurzer Zeit getroffen werden können.";

const ABSCHNITTE: { titel: string; absaetze: string[] }[] = [
  {
    titel: "Jonah Kühle",
    absaetze: [
      "Bereits als Kind hatte ich großes Interesse an allem, was mit Geld zu tun hat. Später kamen die ersten konkreten Pläne hinzu. ETFs, Aktien und Kryptowährungen – insbesondere mit Letzteren musste ich zunächst erhebliche Verluste hinnehmen.",
      "Mein Interesse an den Finanzmärkten verstärkte und vertiefte sich während meiner Ausbildung zum Kaufmann für Versicherungen und Finanzanlagen nochmals. Durch unzählige Stunden mit Bilanzen, Charts, Bewertungsmethoden und Fachbüchern konnte ich meine Kenntnisse stetig erweitern und erfolgreiche Aktieninvestments tätigen. Die Methoden, mit denen ich analysiere, möchte ich heute mit anderen teilen.",
    ],
  },
  {
    titel: "PAX Solutions",
    absaetze: [
      "Wir bei PAX Solutions setzen auf langfristige Investments, häufig in Unternehmen, die wir im Idealfall niemals wieder verkaufen müssen.",
      "Wir analysieren Bilanzen und bewerten, ob ein Unternehmen vom Markt angemessen bewertet ist. Dabei beziehen wir auch technische Indikatoren ein. Zur Einschätzung möglicher künftiger Kursentwicklungen nutzen wir Bewertungsmodelle sowie Elliott-Wellen.",
      "Unser Augenmerk liegt stets auf dem Value eines Unternehmens und dem wirtschaftlichen Mehrwert, den es bietet. Eine große Inspiration sind dabei die Methoden von Warren Buffett und Benjamin Graham, deren Ansätze wir teilweise bis heute verfolgen.",
      "Wir sind uns der Verantwortung, die mit finanziellen Entscheidungen einhergeht, mehr als bewusst und gehen entsprechend sorgfältig damit um.",
      "Unser Ziel ist es, die Erwartungen unserer Kunden ebenso wie unsere eigenen stets zu übertreffen.",
      "Darüber hinaus berücksichtigen wir das Verhalten der Marktteilnehmer sowie politische Entwicklungen in den jeweiligen Ländern. Die wirtschaftliche Lage betrachten wir stets im Kontext der jeweiligen Branche. Durch Maßnahmen wie Diversifikation und die Berücksichtigung von Sicherheitsmargen beugen wir Risiken vor.",
    ],
  },
];

const SCHLUSS = "Viel Spaß beim Investieren!";

/** Kurzprofil neben dem Foto - nur Angaben, die auch im Text oder Impressum stehen. */
const PROFIL: [string, string][] = [
  ["Rolle", "Inhaber und Analyst"],
  ["Ausbildung", "Kaufmann für Versicherungen und Finanzanlagen"],
  ["Ansatz", "Langfristiger Value-Ansatz, ergänzt um Charttechnik"],
];

function initialen(name: string): string {
  return name
    .split(/\s+/)
    .map((teil) => teil[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Für Suchmaschinen: die Person hinter der Seite. */
function profilDaten() {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      "@id": `${url}/ueber-uns#person`,
      name: VERANTWORTLICH,
      jobTitle: "Inhaber und Analyst",
      url: `${url}/ueber-uns`,
      worksFor: { "@id": `${url}/#organisation` },
    },
  };
}

export default function UeberUnsPage() {
  return (
    <div className="frame">
      <JsonLd daten={brotkrumen("Über uns", "/ueber-uns")} />
      <JsonLd daten={profilDaten()} />
      <div className="py-14 sm:py-20">
        <PageHeader label="Über uns" title={TITEL} lead={EINLEITUNG} />

        {/* Abschnitte untereinander: links der Titel, rechts der Text.
            Am Telefon steht der Titel ueber dem Text. */}
        <div className="border-b border-[var(--color-line)]">
          {ABSCHNITTE.map((a, i) => (
            <section
              key={a.titel}
              className="grid gap-4 border-t border-[var(--color-line)] py-10 first:border-t-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-12 sm:py-14"
            >
              <div>
                <h2 className="display text-[length:var(--step-h3)] font-normal leading-tight text-[var(--color-platinum)]">
                  {a.titel}
                </h2>
                {/* Foto und Kurzprofil stehen bei der Person, nicht bei der Firma */}
                {i === 0 && (
                  <Portrait
                    name="portrait"
                    alt={`Porträt von ${a.titel}`}
                    monogramm={initialen(a.titel)}
                    className="mt-7 max-w-[22rem]"
                  />
                )}
              </div>
              <div className="space-y-4 text-base leading-relaxed text-[var(--color-mist)]">
                {a.absaetze.map((text, j) => (
                  <p key={j}>{text}</p>
                ))}
                {i === 0 && (
                  <dl className="!mt-8 grid border-y border-[var(--color-line)] sm:grid-cols-2 sm:gap-x-10">
                    {PROFIL.map(([label, wert]) => (
                      <div
                        key={label}
                        className="border-b border-[var(--color-line)] py-3.5 sm:[&:nth-last-child(-n+2)]:border-b-0"
                      >
                        <dt className="mono-label">{label}</dt>
                        <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-[var(--color-mist-2)]">
                          {wert}
                        </dd>
                      </div>
                    ))}
                    <div className="py-3.5">
                      <dt className="mono-label">Kontakt</dt>
                      <dd className="mt-1.5 text-[0.9375rem]">
                        <a
                          href={`mailto:${COMPANY.email}`}
                          className="text-link"
                        >
                          {COMPANY.email}
                        </a>
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
            </section>
          ))}
        </div>

        <Portrait
          name="arbeitsplatz"
          alt={`Arbeitsplatz von ${ABSCHNITTE[0].titel}`}
          format="quer"
          className="mt-12"
        />

        <section className="grid gap-4 border-b border-[var(--color-line)] py-10 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-12 sm:py-14">
          <h2 className="display text-[length:var(--step-h3)] leading-tight font-normal text-[var(--color-platinum)]">
            Eigene Positionen
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-[var(--color-mist)]">
            <p>
              {ABSCHNITTE[0].titel} kann Anteile an besprochenen Unternehmen
              halten. Ob das bei einer Analyse der Fall ist, steht dort unter
              „Ersteller und Offenlegung“.
            </p>
            <p>
              <Link href="/so-arbeiten-wir" className="text-link">
                So arbeiten wir
              </Link>
            </p>
          </div>
        </section>

        <p className="display mt-12 text-[length:var(--step-h3)] text-[var(--color-platinum)]">
          {SCHLUSS}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link href="/methodik" className="btn-ghost">
            Zur Methodik
          </Link>
          <Link href="/preise" className="btn-link">
            Pakete ansehen
            <span className="pfeil" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
