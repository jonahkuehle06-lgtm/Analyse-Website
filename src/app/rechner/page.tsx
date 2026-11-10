import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import JsonLd from "@/components/JsonLd";
import { RECHNER_HINWEIS } from "@/components/rechner/teile";
import { brotkrumen, kanonisch } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Rechner",
  description:
    "Drei Rechner für deine eigenen Annahmen: Szenarien mit Wahrscheinlichkeiten, DCF-Bewertung, fairer Wert und Sicherheitsmarge. Alles rechnet in deinem Browser.",
  ...kanonisch("/rechner"),
};

const RECHNER = [
  {
    href: "/rechner/szenario",
    titel: "Szenario-Rechner",
    text: "Drei Kursziele mit Wahrscheinlichkeiten ergeben den Erwartungswert und den Abstand zum aktuellen Kurs.",
  },
  {
    href: "/rechner/dcf",
    titel: "DCF-Rechner",
    text: "Aus Free Cashflow, Wachstum und Abzinsungssatz wird ein Wert je Aktie, samt Empfindlichkeitstabelle.",
  },
  {
    href: "/rechner/fairer-wert",
    titel: "Fairer Wert und Sicherheitsmarge",
    text: "Vergleiche deinen fairen Wert mit dem Kurs und sieh, welcher Kurs zu deiner gewünschten Marge passt.",
  },
];

export default function RechnerPage() {
  return (
    <div className="frame">
      <JsonLd daten={brotkrumen("Rechner", "/rechner")} />
      <div className="py-14 sm:py-20">
        <PageHeader
          label="Rechner"
          title="Rechner"
          lead="Drei Werkzeuge, mit denen du eigene Annahmen durchrechnest. Alles läuft in deinem Browser, nichts wird gesendet."
        />
        <ul className="grid gap-6 py-12 md:grid-cols-3">
          {RECHNER.map((r) => (
            <li key={r.href}>
              <Link href={r.href} className="surface surface-hover flex h-full flex-col gap-4 p-6 sm:p-8">
                <h2 className="display text-[length:var(--step-h4)] font-normal text-[var(--color-platinum)]">
                  {r.titel}
                </h2>
                <p className="text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">{r.text}</p>
                <span className="btn-link mt-auto self-start">
                  Rechner öffnen
                  <span className="pfeil" aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="max-w-[62ch] border-t border-[var(--color-line)] pt-8 text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
          {RECHNER_HINWEIS}
        </p>
      </div>
    </div>
  );
}
