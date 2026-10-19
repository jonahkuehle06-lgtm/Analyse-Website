import type { LegalBlock, LegalDoc } from "./types";

/**
 * Geschuetzte Leerzeichen an den ueblichen Stellen, damit "§ 6" oder
 * "z. B." nie ueber einen Zeilenumbruch auseinandergerissen werden -
 * auf der Website wie im PDF. Am Wortlaut aendert sich nichts.
 */
const NBSP = " ";

const REGELN: [RegExp, string][] = [
  [/§§ /g, `§§${NBSP}`],
  [/§ /g, `§${NBSP}`],
  [/\b(Abs|Nr|Art)\. /g, `$1.${NBSP}`],
  [/ (BGB|EGBGB)\b/g, `${NBSP}$1`],
  [/\bz\. B\./g, `z.${NBSP}B.`],
  [/\b(\d+) ff\./g, `$1${NBSP}ff.`],
];

export function typografie(text: string): string {
  return REGELN.reduce((t, [muster, ersatz]) => t.replace(muster, ersatz), text);
}

function block(b: LegalBlock): LegalBlock {
  switch (b.type) {
    case "p":
      return { ...b, text: typografie(b.text) };
    case "form":
      return { ...b, lines: b.lines.map(typografie) };
    default:
      return { ...b, items: b.items.map(typografie) };
  }
}

export function typografischesDokument(doc: LegalDoc): LegalDoc {
  return {
    ...doc,
    sections: doc.sections.map((s) => ({
      ...s,
      heading: typografie(s.heading),
      blocks: s.blocks.map(block),
    })),
  };
}
