import Link from "next/link";
import Wordmark from "./Wordmark";
import DoveMark from "./DoveMark";
import ConsentSettingsLink from "./ConsentSettingsLink";
import { gtmId } from "./GoogleTagManager";
import { BRAND, COMPANY } from "@/lib/config";

const LEGAL = [
  { href: "/impressum", label: "Impressum" },
  { href: "/haftungsausschluss", label: "Haftungsausschluss" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/cookies", label: "Cookies" },
  { href: "/agb", label: "AGB" },
  { href: "/widerruf", label: "Widerruf" },
];

const PRODUCT = [
  { href: "/analysen", label: "Analysen" },
  { href: "/preise", label: "Pakete" },
  { href: "/methodik", label: "Methodik" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/konto", label: "Mein Konto" },
];

const linkClass =
  "text-[0.9375rem] text-[var(--color-mist)] underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-[var(--color-platinum)] hover:decoration-[var(--color-line-strong)]";

export default function SiteFooter() {
  return (
    <footer className="cv-auto print:hidden relative overflow-hidden border-t border-[var(--color-line)] bg-[var(--color-void)]">
      <div className="frame">
        <div className="grid gap-12 pt-16 pb-12 md:grid-cols-[1.6fr_1fr_1fr] md:pt-20">
          <div>
            <Wordmark />
            <p className="mt-6 max-w-[30ch] text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
              {BRAND.claim}
            </p>
          </div>

          <div>
            <p className="mono-label">Angebot</p>
            <ul className="mt-5 space-y-3">
              {PRODUCT.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
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
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
              {/* Nur sinnvoll, wenn es ueberhaupt etwas einzuwilligen gibt. */}
              {gtmId() && (
                <li>
                  <ConsentSettingsLink />
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Gesetzliche Schaltflächen auf jeder Seite: Kündigung (§ 312k BGB)
            und elektronischer Widerruf - beide ohne Anmeldung nutzbar */}
        <div className="flex flex-col gap-3 border-t border-[var(--color-line)] py-6 sm:flex-row sm:items-center">
          <Link href="/kuendigen" className="btn-ghost">
            Verträge hier kündigen
          </Link>
          <Link href="/widerrufen" className="btn-ghost">
            Vertrag hier widerrufen
          </Link>
        </div>

        <div className="border-t border-[var(--color-line)] py-8">
          <p className="max-w-4xl text-xs leading-relaxed text-[var(--color-muted)]">
            <strong className="font-semibold text-[var(--color-mist)]">
              Risikohinweis:
            </strong>{" "}
            Wertpapiergeschäfte sind mit Risiken bis hin zum Totalverlust des
            eingesetzten Kapitals verbunden. Vergangene Wertentwicklungen sind kein
            verlässlicher Indikator für künftige Ergebnisse. Die auf dieser Seite
            veröffentlichten Analysen stellen keine individuelle Anlageberatung dar und
            berücksichtigen weder persönliche Verhältnisse noch Anlageziele einzelner
            Nutzer. {COMPANY.name} und ihre Mitarbeiter können Anteile an besprochenen
            Unternehmen halten. Ausführliche Hinweise im{" "}
            <Link href="/haftungsausschluss" className="text-link">
              Haftungsausschluss
            </Link>
            .
          </p>
          <div className="mt-6 flex flex-col gap-2 text-xs text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {new Date().getFullYear()} {COMPANY.name}. Alle Rechte vorbehalten.
            </span>
            <span>{COMPANY.street}, {COMPANY.city}</span>
          </div>
        </div>

        {/* Die Taube als grosses Wasserzeichen: Kopf und Fluegel bleiben
            sichtbar, nach unten laeuft sie weich aus */}
        <div
          aria-hidden="true"
          className="wasserzeichen relative h-[calc(min(600px,88vw)*0.66)] overflow-hidden"
        >
          <DoveMark
            solid
            className="absolute top-4 left-1/2 w-[min(600px,88vw)] -translate-x-1/2 text-[var(--color-platinum)] opacity-[0.14]"
          />
        </div>
      </div>
    </footer>
  );
}
