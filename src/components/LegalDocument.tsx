import Link from "next/link";
import { siteUrl } from "@/lib/config";
import type { LegalBlock, LegalDoc } from "@/lib/legal/types";
import { LegalSection } from "./LegalPage";

/* URLs und E-Mail-Adressen im Fliesstext klickbar machen. Satzzeichen am
   Ende (etwa der Punkt nach einer URL) gehoeren nicht zum Link. */
const LINK = /(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

function Text({ text }: { text: string }) {
  const teile = text.split(LINK);
  const basis = siteUrl();

  return (
    <>
      {teile.map((teil, i) => {
        if (i % 2 === 0) return teil;
        const rest = teil.match(/[.,;:!?]+$/)?.[0] ?? "";
        const ziel = rest ? teil.slice(0, -rest.length) : teil;

        let link: React.ReactNode;
        if (ziel.includes("@") && !ziel.startsWith("http")) {
          link = (
            <a href={`mailto:${ziel}`} className="text-link break-all">
              {ziel}
            </a>
          );
        } else if (ziel.startsWith(basis)) {
          link = (
            <Link href={ziel.slice(basis.length) || "/"} className="text-link break-all">
              {ziel}
            </Link>
          );
        } else {
          link = (
            <a href={ziel} className="text-link break-all" rel="noopener noreferrer">
              {ziel}
            </a>
          );
        }

        return (
          <span key={i}>
            {link}
            {rest}
          </span>
        );
      })}
    </>
  );
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case "p":
      return (
        <p>
          <Text text={block.text} />
        </p>
      );
    case "clauses":
      return (
        <ol className="space-y-3">
          {block.items.map((item, i) => (
            <li key={i} className="grid grid-cols-[2.25rem_minmax(0,1fr)]">
              <span className="tabular text-[var(--color-mist)]">({(block.start ?? 1) + i})</span>
              <span>
                <Text text={item} />
              </span>
            </li>
          ))}
        </ol>
      );
    case "ol":
      return (
        <ol className="ml-5 list-decimal space-y-1.5 marker:text-[var(--color-mist)]">
          {block.items.map((item, i) => (
            <li key={i} className="pl-1">
              <Text text={item} />
            </li>
          ))}
        </ol>
      );
    case "ul":
      return (
        <ul className="ml-[2.25rem] list-disc space-y-1.5 marker:text-[var(--color-mist)]">
          {block.items.map((item, i) => (
            <li key={i} className="pl-1">
              <Text text={item} />
            </li>
          ))}
        </ul>
      );
    case "form":
      return (
        <div className="space-y-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-anthracite)] p-6 text-sm sm:p-7">
          {block.lines.map((line, i) => (
            <p key={i}>
              <Text text={line} />
            </p>
          ))}
        </div>
      );
  }
}

/** Rendert einen Rechtstext aus src/lib/legal in die Abschnitte einer LegalPage. */
export default function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <>
      {doc.sections.map((section) => (
        <LegalSection key={section.heading} title={section.heading}>
          {section.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </LegalSection>
      ))}
    </>
  );
}
