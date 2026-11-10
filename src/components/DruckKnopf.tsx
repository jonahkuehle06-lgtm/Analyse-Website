"use client";

/** Öffnet den Druckdialog - dort lässt sich die Analyse auch als PDF sichern. */
export default function DruckKnopf() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-ghost w-full sm:w-auto">
      Drucken oder als PDF sichern
    </button>
  );
}
