import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import JsonLd from "@/components/JsonLd";
import { isAdmin } from "@/lib/auth";
import { brotkrumen, kanonisch } from "@/lib/seo";
import { sichtbareArtikel } from "@/lib/wissen";
import type { WissenArtikel } from "@/lib/wissen/typen";

// Sichtbarkeit hängt vom Admin-Cookie ab, die Seite darf nicht zwischengespeichert werden.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const admin = await isAdmin();
  const sichtbar = sichtbareArtikel(admin).length > 0;
  return {
    title: "Wissen",
    description:
      "Methoden und Kennzahlen der Aktienbewertung verständlich erklärt: Szenarioanalyse, DCF, fairer Wert, Long und Short, ROIC, KGV und weitere.",
    ...kanonisch("/wissen"),
    ...(sichtbar && !admin ? {} : { robots: { index: false, follow: false } }),
  };
}

function Entwurf({ a }: { a: WissenArtikel }) {
  return a.freigegeben ? null : <span className="tag">Entwurf – nicht öffentlich</span>;
}

export default async function WissenPage() {
  const admin = await isAdmin();
  const artikel = sichtbareArtikel(admin);
  if (artikel.length === 0 && !admin) notFound();

  const leit = artikel.filter((a) => a.art === "leitartikel");
  const kenn = artikel.filter((a) => a.art === "kennzahl");
  const oeffentlich = artikel.some((a) => a.freigegeben);

  return (
    <div className="frame">
      {oeffentlich && <JsonLd daten={brotkrumen("Wissen", "/wissen")} />}
      <div className="py-14 sm:py-20">
        <PageHeader
          label="Wissen"
          title="Bewertung verständlich erklärt"
          lead="Methoden und Kennzahlen, mit denen sich Aktien einordnen lassen. Mit Rechenbeispiel, Formel in Worten und den Grenzen jeder Methode."
        />

        {leit.length > 0 && (
          <section className="border-b border-[var(--color-line)] py-12">
            <h2 className="mono-label">Leitartikel</h2>
            <ul className="mt-6 grid gap-5 md:grid-cols-2">
              {leit.map((a) => (
                <li key={a.slug} className="min-w-0">
                  <Link href={`/wissen/${a.slug}`} className="surface surface-hover block h-full p-6 sm:p-8">
                    <Entwurf a={a} />
                    <h3 className="display mt-3 text-[length:var(--step-h4)] leading-tight font-normal break-words text-[var(--color-platinum)]">
                      {a.titel}
                    </h3>
                    <p className="mt-3 max-w-[60ch] text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
                      {a.beschreibung}
                    </p>
                    <span className="btn-link mt-5 text-[0.9375rem]">
                      Artikel lesen
                      <span className="pfeil" aria-hidden="true">→</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {kenn.length > 0 && (
          <section className="py-12">
            <h2 className="mono-label">Kennzahlen</h2>
            <ul className="mt-6 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
              {kenn.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/wissen/${a.slug}`}
                    className="group grid gap-2 py-5 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-10"
                  >
                    <span className="min-w-0">
                      <span className="block text-base font-medium break-words text-[var(--color-platinum)]">
                        {a.titel}
                      </span>
                      <span className="mt-2 block empty:hidden">
                        <Entwurf a={a} />
                      </span>
                    </span>
                    <span className="min-w-0 text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
                      {a.beschreibung}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
