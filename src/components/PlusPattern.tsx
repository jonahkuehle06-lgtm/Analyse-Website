/**
 * Das feine Pluszeichen-Raster als eingebettete Grafik.
 *
 * Als CSS-Hintergrundbild (url) wertet der Browser das Raster als groesstes
 * Bild der Seite und misst die Ladezeit daran. Als Inline-SVG ist es reine
 * Dekoration - als Hauptinhalt zaehlt dann die Ueberschrift.
 *
 * Erwartet ein Elternelement mit position: relative.
 */
export default function PlusPattern({ id = "plus-raster" }: { id?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-0 h-full w-full text-[var(--color-platinum)]"
    >
      <defs>
        <pattern id={id} width="48" height="48" patternUnits="userSpaceOnUse" x="50%">
          <path d="M24 19v10M19 24h10" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
