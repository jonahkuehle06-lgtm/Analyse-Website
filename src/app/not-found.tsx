import Link from "next/link";
import PlusPattern from "@/components/PlusPattern";

export const metadata = {
  title: "Seite nicht gefunden",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="relative border-b border-[var(--color-line)]">
      <PlusPattern />
      <div className="frame frame-lines bg-[var(--color-ink)]">
        <div className="flex min-h-[68vh] flex-col justify-center py-20">
          <span className="tag self-start">Fehler 404</span>
          <h1 className="display mt-6 text-[length:var(--step-h1)] text-[var(--color-platinum)]">
            Seite nicht <em>gefunden</em>
          </h1>
          <p className="lead mt-5 max-w-[44ch]">
            Die aufgerufene Seite existiert nicht oder wurde verschoben.
          </p>
          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <Link href="/" className="btn-platinum w-full sm:w-auto">
              Zur Startseite
              <span className="pfeil" aria-hidden="true">→</span>
            </Link>
            <Link href="/analysen" className="btn-link self-start sm:self-auto">
              Zu den Analysen
              <span className="pfeil" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
