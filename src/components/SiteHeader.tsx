"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Wordmark from "./Wordmark";

const NAV = [
  { href: "/analysen", label: "Analysen" },
  { href: "/preise", label: "Pakete" },
  { href: "/methodik", label: "Methodik" },
  { href: "/ueber-uns", label: "Über uns" },
];

export default function SiteHeader({ loggedIn = false }: { loggedIn?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (pathname?.startsWith("/admin")) return null;

  const aktiv = (href: string) => pathname === href || pathname?.startsWith(href + "/");
  const mobileItems = [
    ...NAV,
    loggedIn
      ? { href: "/konto", label: "Mein Konto" }
      : { href: "/login", label: "Anmelden" },
  ];

  return (
    <header
      // Wichtig: Bei offenem Menue keine Unschaerfe. backdrop-filter macht die
      // Kopfzeile zum Bezugsrahmen fuer "fixed" - das Menue darunter waere
      // dann nur so hoch wie die Kopfzeile selbst.
      // Auf Handy und Tablet immer deckend schwarz: Die Flaeche um die Dynamic
      // Island (.kopfzeile::before) geht so nahtlos in die Kopfzeile ueber.
      className={`kopfzeile sticky top-0 z-50 print:hidden pt-[env(safe-area-inset-top)] border-b border-[var(--color-line)] bg-[var(--color-ink)] transition-colors duration-300 ${
        scrolled && !open ? "lg:bg-[rgba(7,7,7,0.88)] lg:backdrop-blur-xl" : ""
      }`}
    >
      <div className="frame flex h-16 items-center justify-between gap-6 lg:h-[76px]">
        <Link href="/" aria-label="Zur Startseite" className="shrink-0">
          <Wordmark />
        </Link>

        {/* Volle Navigation erst ab 1024 px - auf Tablets passt sie nicht in eine Zeile */}
        <nav aria-label="Hauptnavigation" className="hidden items-center gap-9 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={aktiv(item.href) ? "page" : undefined}
              className={`relative py-2 text-[0.9375rem] transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:bg-[var(--color-platinum)] after:transition-transform after:duration-300 ${
                aktiv(item.href)
                  ? "text-[var(--color-platinum)] after:scale-x-100"
                  : "text-[var(--color-mist)] after:scale-x-0 hover:text-[var(--color-platinum)] hover:after:scale-x-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          {loggedIn ? (
            <>
              <Link
                href="/konto"
                className="text-[0.9375rem] text-[var(--color-mist)] transition-colors hover:text-[var(--color-platinum)]"
              >
                Mein Konto
              </Link>
              <Link href="/analysen" className="btn-platinum !min-h-0 !px-4 !py-2.5 !text-[0.875rem]">
                Zu den Analysen
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[0.9375rem] text-[var(--color-mist)] transition-colors hover:text-[var(--color-platinum)]"
              >
                Anmelden
              </Link>
              <Link href="/preise" className="btn-platinum !min-h-0 !px-4 !py-2.5 !text-[0.875rem]">
                Zugang sichern
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
        >
          <span className="relative block h-3 w-6">
            <span
              className={`absolute left-0 block h-px w-6 bg-[var(--color-platinum)] transition-all duration-300 ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 block h-px bg-[var(--color-platinum)] transition-all duration-300 ${
                open ? "top-1.5 w-6 -rotate-45" : "top-3 w-4"
              }`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] bottom-0 z-40 flex flex-col overflow-y-auto border-t border-[var(--color-line)] bg-[var(--color-ink)] pr-[max(var(--gutter),env(safe-area-inset-right))] pb-[calc(2rem+env(safe-area-inset-bottom))] pl-[max(var(--gutter),env(safe-area-inset-left))] lg:hidden"
        >
          <nav aria-label="Hauptnavigation" className="mt-4 flex flex-col">
            {mobileItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktiv(item.href) ? "page" : undefined}
                className="group flex items-baseline gap-4 border-b border-[var(--color-line)] py-5"
              >
                <span className="mono-label w-6 tabular">{String(i + 1).padStart(2, "0")}</span>
                <span
                  className={`display text-[2.125rem] leading-none ${
                    aktiv(item.href) ? "italic text-[var(--color-platinum)]" : "text-[var(--color-platinum)]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
          <Link
            href={loggedIn ? "/analysen" : "/preise"}
            className="btn-platinum mt-8 w-full"
          >
            {loggedIn ? "Zu den Analysen" : "Zugang sichern"}
            <span className="pfeil" aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </header>
  );
}
