/**
 * Lade-Platzhalter in der Form der Inhalte - so springt die Seite nicht,
 * wenn die Daten da sind. Rein dekorativ; Screenreader hören "Lädt".
 */

export function KartenPlatzhalter({ anzahl = 6 }: { anzahl?: number }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: anzahl }, (_, i) => (
        <div key={i} className="surface flex h-[21rem] flex-col p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <span className="platzhalter block h-2.5 w-12" />
              <span className="platzhalter block h-5 w-40" />
            </div>
            <span className="platzhalter block h-4 w-16" />
          </div>
          <div className="mt-8 flex gap-1">
            {[0, 1, 2, 3, 4].map((s) => (
              <span key={s} className="platzhalter h-1.5 flex-1" />
            ))}
          </div>
          <div className="mt-7 space-y-2.5">
            <span className="platzhalter block h-2.5 w-full" />
            <span className="platzhalter block h-2.5 w-[86%]" />
            <span className="platzhalter block h-2.5 w-[64%]" />
          </div>
          <div className="mt-auto flex justify-between border-t border-[var(--color-line)] pt-5">
            <span className="platzhalter block h-3 w-24" />
            <span className="platzhalter block h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SeitenkopfPlatzhalter() {
  return (
    <div className="border-b border-[var(--color-line)] pb-10" aria-hidden="true">
      <span className="platzhalter block h-7 w-24" />
      <span className="platzhalter mt-7 block h-12 w-72 max-w-full" />
      <span className="platzhalter mt-6 block h-4 w-96 max-w-full" />
    </div>
  );
}
