import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AnalyseAnsicht from "@/components/AnalyseAnsicht";
import BeispielAbschluss from "@/components/BeispielAbschluss";
import JsonLd from "@/components/JsonLd";
import { beispielPfad, findBeispiel, listBeispiele } from "@/lib/beispiele";
import { artikelDaten, brotkrumen, kanonisch } from "@/lib/seo";

export const dynamic = "force-dynamic";

function beschreibung(titel: string): string {
  return `Vollständige Beispielanalyse zu ${titel}: Signalstärke, Begründung, Kursziel und Szenarien in drei Zeiträumen – frei lesbar.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await findBeispiel(slug);
  if (!a) return { title: "Beispielanalyse" };
  return {
    title: `${a.title} – Beispielanalyse`,
    description: beschreibung(a.title),
    ...kanonisch(beispielPfad(a), a.title),
  };
}

/** Eine öffentliche Beispielanalyse - für jeden lesbar und im Suchindex. */
export default async function BeispielDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [analysis, alle] = await Promise.all([findBeispiel(slug), listBeispiele()]);
  if (!analysis) notFound();

  const pfad = beispielPfad(analysis);
  const weitere = alle.filter((a) => a.id !== analysis.id);

  return (
    <>
      <JsonLd
        daten={brotkrumen(analysis.title, pfad, { name: "Beispielanalyse", pfad: "/beispielanalyse" })}
      />
      <JsonLd
        daten={artikelDaten({
          titel: `${analysis.title} – Beispielanalyse`,
          beschreibung: beschreibung(analysis.title),
          pfad,
          veroeffentlicht: analysis.publishedAt,
          geaendert: analysis.changelog[0]?.date,
        })}
      />
      <AnalyseAnsicht
        analysis={analysis}
        zurueck={{ href: "/analysen", text: "Alle Analysen" }}
        hinweis="Frei lesbare Beispielanalyse"
      />

      {weitere.length > 0 && (
        <section className="border-t border-[var(--color-line)] print:hidden">
          <div className="frame py-12">
            <h2 className="mono-label">Weitere Beispielanalysen</h2>
            <ul className="mt-5 flex flex-wrap gap-3">
              {weitere.map((a) => (
                <li key={a.id}>
                  <Link href={beispielPfad(a)} className="btn-ghost">
                    {a.title}
                    <span className="pfeil" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <BeispielAbschluss />
    </>
  );
}
