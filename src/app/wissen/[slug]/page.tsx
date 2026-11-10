import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import ArtikelAnsicht from "@/components/wissen/ArtikelAnsicht";
import { isAdmin } from "@/lib/auth";
import { artikelDaten, brotkrumen, kanonisch } from "@/lib/seo";
import { findeArtikel } from "@/lib/wissen";

// Entwürfe sehen nur Administratoren, die Seite darf nicht zwischengespeichert werden.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artikel = findeArtikel(slug);
  if (!artikel || (!artikel.freigegeben && !(await isAdmin()))) return {};
  const pfad = `/wissen/${artikel.slug}`;
  return {
    title: artikel.titel,
    description: artikel.beschreibung,
    ...kanonisch(pfad),
    ...(artikel.freigegeben ? {} : { robots: { index: false, follow: false } }),
  };
}

export default async function WissenArtikelPage({ params }: Props) {
  const { slug } = await params;
  const artikel = findeArtikel(slug);
  const admin = await isAdmin();
  if (!artikel || (!artikel.freigegeben && !admin)) notFound();

  const pfad = `/wissen/${artikel.slug}`;
  return (
    <div className="frame">
      {artikel.freigegeben && (
        <>
          <JsonLd
            daten={artikelDaten({
              titel: artikel.titel,
              beschreibung: artikel.beschreibung,
              pfad,
              veroeffentlicht: artikel.stand,
            })}
          />
          <JsonLd daten={brotkrumen(artikel.titel, pfad, { name: "Wissen", pfad: "/wissen" })} />
        </>
      )}
      <div className="py-14 sm:py-20">
        <header className="border-b border-[var(--color-line)] pb-10">
          <span className="tag fade-up">{artikel.art === "leitartikel" ? "Leitartikel" : "Kennzahl"}</span>
          <h1 className="display rise fade-up-2 mt-6 max-w-[24ch] text-[length:var(--step-h1)] text-[var(--color-platinum)]">
            {artikel.titel}
          </h1>
          <p className="lead rise fade-up-3 mt-5 max-w-[56ch]">{artikel.beschreibung}</p>
        </header>
        <ArtikelAnsicht artikel={artikel} admin={admin} />
      </div>
    </div>
  );
}
