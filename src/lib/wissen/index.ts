import type { WissenArtikel } from "./typen";
import { szenarioanalyseAktie } from "./artikel/szenarioanalyse-aktie";
import { dcfVerfahren } from "./artikel/dcf-verfahren";
import { fairerWertSicherheitsmarge } from "./artikel/fairer-wert-sicherheitsmarge";
import { longUndShort } from "./artikel/long-und-short";
import { roic } from "./artikel/roic";
import { freeCashflow } from "./artikel/free-cashflow";
import { evEbitda } from "./artikel/ev-ebitda";
import { kuv } from "./artikel/kuv";
import { dividendenrendite } from "./artikel/dividendenrendite";
import { kgv } from "./artikel/kgv";

/**
 * Alle Wissensartikel. Jeder ist ein Entwurf (`freigegeben: false`), bis der
 * Inhaber ihn einzeln freigibt.
 */
export const WISSEN: WissenArtikel[] = [
  szenarioanalyseAktie,
  dcfVerfahren,
  fairerWertSicherheitsmarge,
  longUndShort,
  roic,
  freeCashflow,
  evEbitda,
  kuv,
  dividendenrendite,
  kgv,
];

export function findeArtikel(slug: string): WissenArtikel | undefined {
  return WISSEN.find((a) => a.slug === slug);
}

/** Ohne Admin nur freigegebene Artikel. */
export function sichtbareArtikel(admin: boolean): WissenArtikel[] {
  return admin ? WISSEN : WISSEN.filter((a) => a.freigegeben);
}
