/** Ein Rechenbeispiel mit einem ausdrücklich erfundenen Unternehmen. */
export interface WissenBeispiel {
  titel: string;
  zeilen: { label: string; wert: string }[];
  ergebnis: string;
}

export interface WissenAbschnitt {
  titel: string;
  absaetze: string[];
  liste?: string[];
  /** Formel in Worten, wird im Kasten dargestellt. */
  formel?: string;
  beispiel?: WissenBeispiel;
}

export interface WissenQuelle {
  titel: string;
  url: string;
  /** Abrufdatum, z. B. "10.11.2026" */
  abgerufen: string;
}

export interface WissenArtikel {
  slug: string;
  art: "leitartikel" | "kennzahl";
  titel: string;
  /** Beschreibung für Suchmaschinen, höchstens 155 Zeichen */
  beschreibung: string;
  /** „Kurz gesagt“: zwei bis drei Sätze */
  kurz: string;
  /** Stand als ISO-Datum */
  stand: string;
  /** Erst nach Freigabe durch den Inhaber öffentlich sichtbar */
  freigegeben: boolean;
  abschnitte: WissenAbschnitt[];
  quellen: WissenQuelle[];
  /** Slugs verwandter Artikel */
  verwandt: string[];
  rechner?: { href: string; text: string };
}
