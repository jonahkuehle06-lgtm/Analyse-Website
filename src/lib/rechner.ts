/**
 * Reine Rechenfunktionen für die Rechner unter /rechner.
 * Ohne React, ohne Browser-Zugriff - gut testbar.
 */

/** Liest eine Zahl mit Komma oder Punkt als Dezimalzeichen. Leer oder ungültig: null. */
export function parseZahl(text: string): number | null {
  let t = text.replace(/[\s ]/g, "").replace(/[−–]/g, "-");
  if (t === "" || t === "-" || t === "+") return null;
  if (t.includes(",")) {
    // Komma ist das Dezimalzeichen, Punkte sind Tausendertrenner
    t = t.replace(/\./g, "").replace(",", ".");
  } else if ((t.match(/\./g) ?? []).length > 1) {
    t = t.replace(/\./g, "");
  }
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Zahl für Eingabefelder: deutsch, ohne Tausendertrenner. */
export function feldText(v: number): string {
  return String(v).replace(".", ",");
}

/** Deutsche Zahl, Minus als „−“. */
export function zahl(v: number, stellen = 2): string {
  const s = new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: stellen,
    maximumFractionDigits: stellen,
  }).format(Math.abs(v));
  const null_ = Number(s.replace(/\./g, "").replace(",", ".")) === 0;
  return v < 0 && !null_ ? `−${s}` : s;
}

/** Prozentwert mit Vorzeichen, z. B. „+12,5 %“ oder „−3,0 %“. */
export function prozentMitVorzeichen(v: number, stellen = 1): string {
  const s = zahl(v, stellen);
  return v > 0 && !s.startsWith("−") && Number(s.replace(/\./g, "").replace(",", ".")) !== 0
    ? `+${s} %`
    : `${s} %`;
}

export function prozent(v: number, stellen = 1): string {
  return `${zahl(v, stellen)} %`;
}

/* ------------------------------- Szenarien ------------------------------- */

export type SzenarioEingabe = { ziel: number; wahrscheinlichkeit: number };

export type SzenarioErgebnis = {
  /** Summe der Wahrscheinlichkeiten in Prozent */
  summe: number;
  /** Erwartungswert = Summe(Kursziel × Wahrscheinlichkeit) / 100, ohne Normierung */
  erwartungswert: number;
  /** Abstand des Erwartungswerts zum aktuellen Kurs in Prozent */
  abstandErwartung: number;
  /** Abstand jedes Szenarios zum aktuellen Kurs in Prozent */
  abstaende: number[];
  /** true, wenn die Summe von 100 abweicht */
  summeAbweichend: boolean;
};

/** Kurs muss größer 0 sein. Der Erwartungswert wird nicht normiert. */
export function szenarioRechnen(kurs: number, szenarien: SzenarioEingabe[]): SzenarioErgebnis | null {
  if (!(kurs > 0)) return null;
  const summe = szenarien.reduce((a, s) => a + s.wahrscheinlichkeit, 0);
  const erwartungswert = szenarien.reduce((a, s) => a + (s.ziel * s.wahrscheinlichkeit) / 100, 0);
  return {
    summe,
    erwartungswert,
    abstandErwartung: ((erwartungswert - kurs) / kurs) * 100,
    abstaende: szenarien.map((s) => ((s.ziel - kurs) / kurs) * 100),
    summeAbweichend: Math.abs(summe - 100) > 1e-9,
  };
}

/* ---------------------------------- DCF ---------------------------------- */

export type DcfEingabe = {
  fcf: number; // Mio., aktuelles Jahr
  wachstum1: number; // % Jahre 1-5
  wachstum2: number; // % Jahre 6-10
  ewig: number; // % ewiges Wachstum
  zins: number; // % Abzinsungssatz
  schulden: number; // Mio., Nettoverschuldung (negativ = Nettoliquidität)
  aktien: number; // Mio.
};

export type DcfErgebnis = {
  barwertJahre: number;
  barwertEndwert: number;
  unternehmenswert: number;
  eigenkapital: number;
  jeAktie: number;
  endwertAnteil: number | null; // %, null wenn Unternehmenswert 0
};

export type DcfFehler = "zins" | "aktien";

/**
 * Zehn Jahre Cashflow (Jahr 1-5 mit wachstum1, Jahr 6-10 mit wachstum2),
 * Endwert nach Gordon: FCF10 × (1 + g) / (r − g), abgezinst über 10 Jahre.
 */
export function dcfRechnen(e: DcfEingabe): DcfErgebnis | { fehler: DcfFehler } {
  if (!(e.aktien > 0)) return { fehler: "aktien" };
  const r = e.zins / 100;
  const g = e.ewig / 100;
  if (!(r > g) || r <= -1) return { fehler: "zins" };

  let cf = e.fcf;
  let barwertJahre = 0;
  for (let jahr = 1; jahr <= 10; jahr++) {
    cf *= 1 + (jahr <= 5 ? e.wachstum1 : e.wachstum2) / 100;
    barwertJahre += cf / Math.pow(1 + r, jahr);
  }
  const endwert = (cf * (1 + g)) / (r - g);
  const barwertEndwert = endwert / Math.pow(1 + r, 10);
  const unternehmenswert = barwertJahre + barwertEndwert;
  const eigenkapital = unternehmenswert - e.schulden;
  return {
    barwertJahre,
    barwertEndwert,
    unternehmenswert,
    eigenkapital,
    jeAktie: eigenkapital / e.aktien,
    endwertAnteil: unternehmenswert !== 0 ? (barwertEndwert / unternehmenswert) * 100 : null,
  };
}

/** Wert je Aktie oder null, wenn die Rechnung nicht möglich ist. */
export function dcfJeAktie(e: DcfEingabe): number | null {
  const r = dcfRechnen(e);
  return "fehler" in r ? null : r.jeAktie;
}

/* ------------------------- Fairer Wert, Sicherheitsmarge ------------------------- */

export type FairerWertErgebnis = {
  /** (fairer Wert − Kurs) / fairer Wert in Prozent */
  aktuelleMarge: number;
  /** fairer Wert × (1 − gewünschte Marge) */
  kaufkurs: number;
  /** Abstand des Kurses zum fairen Wert in Prozent, bezogen auf den fairen Wert */
  abstandKurs: number;
};

/** Fairer Wert muss größer 0 sein, Kurs nicht negativ, Marge unter 100 Prozent. */
export function fairerWertRechnen(fair: number, kurs: number, wunschMarge: number): FairerWertErgebnis | null {
  if (!(fair > 0) || kurs < 0 || !(wunschMarge < 100)) return null;
  const aktuelleMarge = ((fair - kurs) / fair) * 100;
  return {
    aktuelleMarge,
    kaufkurs: fair * (1 - wunschMarge / 100),
    abstandKurs: ((kurs - fair) / fair) * 100,
  };
}
