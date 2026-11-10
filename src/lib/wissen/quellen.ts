import type { WissenQuelle } from "./typen";

const ABGERUFEN = "10.11.2026";
const q = (titel: string, url: string): WissenQuelle => ({ titel, url, abgerufen: ABGERUFEN });

/** Geprüfte Quellen: jede Seite wurde am Abrufdatum aufgerufen und inhaltlich gelesen. */
export const QUELLEN = {
  cfaFcf: q(
    "CFA Institute: Free Cash Flow Valuation (Refresher Reading 2026)",
    "https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/free-cash-flow-valuation",
  ),
  cfaGrundlagen: q(
    "CFA Institute: Equity Valuation: Concepts and Basic Tools (Refresher Reading 2026)",
    "https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/equity-valuation-concepts-basic-tools",
  ),
  cfaMultiplikatoren: q(
    "CFA Institute: Market-Based Valuation: Price and Enterprise Value Multiples (Refresher Reading 2026)",
    "https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/market-based-valuation-price-enterprise-value-multiples",
  ),
  cfaDividenden: q(
    "CFA Institute: Discounted Dividend Valuation (Refresher Reading 2026)",
    "https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/discounted-dividend-valuation",
  ),
  cfaMarkt: q(
    "CFA Institute: Market Organization and Structure (Refresher Reading 2026)",
    "https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/market-organization-structure",
  ),
  damodaranKgv: q(
    "Aswath Damodaran (NYU Stern): Price Earnings Ratios by Sector",
    "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/pedata.html",
  ),
  damodaranEv: q(
    "Aswath Damodaran (NYU Stern): Enterprise Value Multiples by Sector",
    "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/vebitda.html",
  ),
  damodaranKuv: q(
    "Aswath Damodaran (NYU Stern): Price to Sales Ratios, Revenue Multiples by Sector",
    "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/psdata.html",
  ),
  damodaranRoic: q(
    "Aswath Damodaran (NYU Stern): Return on Capital by Sector",
    "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/roc.html",
  ),
  damodaranDividenden: q(
    "Aswath Damodaran (NYU Stern): Dividend Fundamentals by Sector",
    "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/divfund.html",
  ),
  damodaranTabellen: q(
    "Aswath Damodaran (NYU Stern): Spreadsheet programs (DCF-Bewertungsmodelle)",
    "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/spreadsh.htm",
  ),
  damodaranSicherheitsmarge: q(
    "Aswath Damodaran (NYU Stern): Value Investing: Where is the beef? (Vorlesungsfolien, Abschnitt zur Margin of Safety)",
    "https://pages.stern.nyu.edu/~adamodar/pptfiles/invphiloh/websessions2019/PDF%20versions/Session%2016-%20Value%20Investing-%20Where%20is%20the%20beef.pdf",
  ),
  bundesbankBewertung: q(
    "Deutsche Bundesbank, Monatsbericht April 2016: Bewertungsniveau am Aktienmarkt",
    "https://www.bundesbank.de/resource/blob/693348/7bd17a62913d1780966b36c11a4988a2/mL/2016-04-bewertungsniveau-aktienmarkt-data.pdf",
  ),
};
