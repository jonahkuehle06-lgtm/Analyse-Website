"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Wordmark from "./Wordmark";

const NAV = [
  { href: "/analysen", label: "Analysen" },
  { href: "/preise", label: "Pakete" },
  { href: "/methodik", label: "Methodik" },
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

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-[var(--color-line)] bg-[rgba(5,5,6,0.82)] backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="Zur Startseite" className="shrink-0">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition-colors ${
                pathname === item.href
                  ? "text-[var(--color-platinum)]"
                  : "text-[var(--color-mist)] hover:text-[var(--color-platinum)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loggedIn ? (
            <>
              <Link
                href="/konto"
                className="text-sm text-[var(--color-mist)] transition-colors hover:text-[var(--color-platinum)]"
              >
                Mein Konto
              </Link>
              <Link href="/analysen" className="btn-platinum !px-5 !py-2.5 !text-sm">
                Zu den Analysen
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-[var(--color-mist)] transition-colors hover:text-[var(--color-platinum)]"
              >
                Anmelden
              </Link>
              <Link href="/preise" className="btn-platinum !px-5 !py-2.5 !text-sm">
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
          className="flex h-10 w-10 items-center justify-center md:hidden"
        >
          <span className="relative block h-4 w-6">
            <span
              className={`absolute left-0 block h-px w-6 bg-[var(--color-platinum)] transition-all duration-300 ${
                open ? "top-2 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-2 block h-px w-6 bg-[var(--color-platinum)] transition-opacity duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-px w-6 bg-[var(--color-platinum)] transition-all duration-300 ${
                open ? "top-2 -rotate-45" : "top-4"
              }`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-x-0 top-[68px] bottom-0 z-40 border-t border-[var(--color-line)] bg-[var(--color-ink)] px-5 pt-8 md:hidden">
          <nav className="flex flex-col gap-1">
            {[
              ...NAV,
              loggedIn
                ? { href: "/konto", label: "Mein Konto" }
                : { href: "/login", label: "Anmelden" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="display border-b border-[var(--color-line)] py-5 text-3xl text-[var(--color-platinum)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href={loggedIn ? "/analysen" : "/preise"}
            className="btn-platinum mt-8 w-full"
          >
            {loggedIn ? "Zu den Analysen" : "Zugang sichern"}
          </Link>
        </div>
      )}
    </header>
  );
}
