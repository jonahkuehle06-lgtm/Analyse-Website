import Link from "next/link";
import Portrait from "@/components/Portrait";
import { VERANTWORTLICH } from "@/lib/config";

function initialen(name: string): string {
  return name
    .split(/\s+/)
    .map((teil) => teil[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** „Wer dahintersteht“ - die Person hinter den Analysen, mit Fläche für das Porträt. */
export default function Dahinter() {
  return (
    <section className="cv-auto border-b border-[var(--color-line)]">
      <div className="frame section">
        <div data-reveal className="grid items-center gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20">
          <Portrait
            name="portrait"
            alt={`Porträt von ${VERANTWORTLICH}`}
            monogramm={initialen(VERANTWORTLICH)}
            className="w-full max-w-[22rem]"
          />
          <div>
            <span className="tag">Wer dahintersteht</span>
            <h2 className="display mt-6 text-[length:var(--step-h2)] text-[var(--color-platinum)]">
              {VERANTWORTLICH}
            </h2>
            <p className="lead mt-5 max-w-[52ch]">
              Inhaber und Analyst von PAX Solutions. Die Analysen entstehen mit den Methoden,
              mit denen er auch selbst investiert.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href="/ueber-uns" className="btn-ghost">
                Mehr über {VERANTWORTLICH.split(/\s+/)[0]}
              </Link>
              <Link href="/so-arbeiten-wir" className="btn-link">
                So arbeiten wir
                <span className="pfeil" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
