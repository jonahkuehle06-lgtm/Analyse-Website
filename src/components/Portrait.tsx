import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import DoveMark from "@/components/DoveMark";

/**
 * Fläche für ein Foto. Liegt die Datei unter public/bilder/, erscheint das
 * Bild; solange sie fehlt, steht dort eine ruhige Kachel mit Monogramm -
 * die Seite sieht nie unfertig aus.
 *
 * Erwartete Dateien (jpg, webp oder png):
 *   public/bilder/portrait.*      Hochformat 4:5, Brustbild
 *   public/bilder/arbeitsplatz.*  Querformat 3:2
 */
const ENDUNGEN = ["webp", "jpg", "jpeg", "png"];

export function bildPfad(name: string): string | null {
  for (const endung of ENDUNGEN) {
    const datei = path.join(process.cwd(), "public", "bilder", `${name}.${endung}`);
    if (fs.existsSync(datei)) return `/bilder/${name}.${endung}`;
  }
  return null;
}

export default function Portrait({
  name,
  alt,
  monogramm,
  format = "hoch",
  className = "",
}: {
  /** Dateiname ohne Endung, z. B. "portrait" */
  name: string;
  alt: string;
  /** Initialen für die Kachel ohne Foto; ohne Angabe bleibt die Fläche leer (rendert nichts) */
  monogramm?: string;
  format?: "hoch" | "quer";
  className?: string;
}) {
  const src = bildPfad(name);
  if (!src && !monogramm) return null;
  const seiten = format === "hoch" ? "aspect-[4/5]" : "aspect-[3/2]";

  return (
    <div
      className={`relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-anthracite)] ${seiten} ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 28rem, 100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" role="img" aria-label={alt}>
          <DoveMark solid className="absolute -right-[12%] -bottom-[10%] w-[78%] text-[rgba(239,234,225,0.12)]" />
          <span className="display relative text-[clamp(3.5rem,9vw,6rem)] leading-none text-[var(--color-platinum)]">
            {monogramm}
          </span>
        </div>
      )}
    </div>
  );
}
