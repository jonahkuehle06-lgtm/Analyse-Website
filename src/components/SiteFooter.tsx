import Link from "next/link";
import Wordmark from "./Wordmark";
import { BRAND, COMPANY } from "@/lib/config";

const LEGAL = [
  { href: "/impressum", label: "Impressum" },
  { href: "/haftungsausschluss", label: "Haftungsausschluss" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
  { href: "/widerruf", label: "Widerruf" },
];

const PRODUCT = [
  { href: "/analysen", label: "Analysen" },
  { href: "/preise", label: "Pakete" },
  { href: "/methodik", label: "Methodik" },
  { href: "/konto", label: "Mein Konto" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-void)]">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Wordmark />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-[var(--color-mist)]">
              {BRAND.claim} Entgeltliche Anlageempfehlungen im Sinne des § 85 WpHG
              i.V.m. Art. 20 MAR.
            </p>
          </div>

          <div>
            <p className="mono-label">Angebot</p>
            <ul className="mt-5 space-y-3">
              {PRODUCT.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[var(--color-mist)] transition-colors hover:text-[var(--color-platinum)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mono-label">Rechtliches</p>
            <ul className="mt-5 space-y-3">
              {LEGAL.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[var(--color-mist)] transition-colors hover:text-[var(--color-platinum)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-[var(--color-line)] pt-8">
          <p className="text-xs leading-relaxed text-[#6b7179]">
            <strong className="font-semibold text-[var(--color-mist)]">
              Risikohinweis:
            </strong>{" "}
            Wertpapiergeschäfte sind mit Risiken bis hin zum Totalverlust des
            eingesetzten Kapitals verbunden. Vergangene Wertentwicklungen sind kein
            verlässlicher Indikator für künftige Ergebnisse. Die auf dieser Seite
            veröffentlichten Analysen stellen keine individuelle Anlageberatung dar und
            berücksichtigen weder persönliche Verhältnisse noch Anlageziele einzelner
            Nutzer. Ausführliche Hinweise im{" "}
            <Link href="/haftungsausschluss" className="underline underline-offset-2">
              Haftungsausschluss
            </Link>
            .
          </p>
          <div className="mt-6 flex flex-col gap-2 text-xs text-[#6b7179] sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {new Date().getFullYear()} {COMPANY.name}. Alle Rechte vorbehalten.
            </span>
            <span>{COMPANY.street}, {COMPANY.city}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
