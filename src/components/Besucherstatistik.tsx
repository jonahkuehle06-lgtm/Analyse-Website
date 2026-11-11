/**
 * Besucherstatistik ohne Cookies (z. B. Plausible oder Pirsch) - vorbereitet,
 * aber aus: Das Skript wird nur geladen, wenn beide Angaben in den
 * Umgebungsvariablen stehen.
 *
 *   NEXT_PUBLIC_STATISTIK_SRC      Adresse des Skripts beim Anbieter
 *   NEXT_PUBLIC_STATISTIK_KENNUNG  Domain (Plausible) bzw. Kennung (Pirsch)
 *
 * Der Trichter Preise -> Bestellung -> Kauf ergibt sich aus den Seitenaufrufen
 * /preise, /bestellen und /willkommen. Vor dem Einschalten: Datenschutzerklärung
 * ergänzen und rechtlich prüfen lassen, ob eine Einwilligung nötig ist.
 */
export default function Besucherstatistik() {
  const src = process.env.NEXT_PUBLIC_STATISTIK_SRC;
  const kennung = process.env.NEXT_PUBLIC_STATISTIK_KENNUNG;
  if (!src || !kennung || !/^https:\/\//.test(src)) return null;
  // data-domain liest Plausible, data-code liest Pirsch
  return <script defer src={src} data-domain={kennung} data-code={kennung} />;
}
