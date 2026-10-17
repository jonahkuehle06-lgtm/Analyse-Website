// Erzeugt data/seed.json mit Beispielanalysen (nur Demodaten).
import { randomUUID } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const AUTHOR = "Max Mustermann (Geschäftsführer)";
const NONE = "Der Ersteller hält zum Zeitpunkt der Veröffentlichung keine Position in diesem Wert.";
const OWNS = "Der Ersteller hält zum Zeitpunkt der Veröffentlichung eine Position in diesem Wert.";

const rows = [
  ["Siemens AG","SIE",186.4,"EUR",228,1,"6–12 Monate","Der Auftragsbestand liegt auf Rekordniveau und das Margenziel wurde angehoben, während die Bewertung weiterhin unter dem Schnitt der europäischen Industriewerte notiert.",NONE],
  ["SAP SE","SAP",241.8,"EUR",285,1,"6–12 Monate","Der Cloud-Auftragsbestand wächst zweistellig und die Umstellung auf wiederkehrende Erlöse ist weitgehend abgeschlossen, was die Ergebnisqualität deutlich erhöht.",OWNS],
  ["Allianz SE","ALV",312.5,"EUR",350,2,"6–12 Monate","Solide Kapitalquote und eine gut gedeckte Dividende stützen den Kurs; das Wachstum im Schaden- und Unfallgeschäft bleibt der wesentliche Treiber.",NONE],
  ["Deutsche Telekom AG","DTE",33.9,"EUR",38.5,2,"12 Monate","Das US-Geschäft liefert weiterhin überdurchschnittliches Wachstum, während der freie Cashflow die angekündigten Rückkäufe komfortabel deckt.",NONE],
  ["Münchener Rück AG","MUV2",528,"EUR",580,2,"6–12 Monate","Die Rückversicherungspreise geben nur moderat nach und liegen weiterhin deutlich über dem Niveau der Vorjahre.",NONE],
  ["ASML Holding N.V.","ASML",702,"EUR",820,1,"12–18 Monate","Die technologische Alleinstellung in der EUV-Lithografie bleibt unangetastet und der Auftragseingang signalisiert eine Erholung des Speichermarkts.",NONE],
  ["BASF SE","BAS",44.2,"EUR",46,3,"6 Monate","Die Erholung der Chemienachfrage verläuft schleppend; Kostensenkungen stützen das Ergebnis, ein Wachstumsimpuls fehlt jedoch bislang.",NONE],
  ["Bayer AG","BAYN",26.1,"EUR",27,3,"6–12 Monate","Die Prozessrisiken im Glyphosat-Komplex sind weiterhin nicht abschließend quantifizierbar, dem steht eine niedrige Bewertung der Pharmasparte gegenüber.",NONE],
  ["Volkswagen AG Vz.","VOW3",92.4,"EUR",95,3,"6 Monate","Hohe Investitionen in die Elektrifizierung treffen auf einen schwächeren China-Absatz; die Bewertung preist bereits viel Skepsis ein.",NONE],
  ["Adidas AG","ADS",214.7,"EUR",205,4,"3–6 Monate","Nach der starken Kurserholung ist die Bewertung anspruchsvoll, während sich das Wachstum in Nordamerika zuletzt spürbar abgeflacht hat.",NONE],
  ["Zalando SE","ZAL",28.3,"EUR",25,4,"3–6 Monate","Der Wettbewerbsdruck durch asiatische Plattformen belastet Marge und Kundenwachstum stärker als vom Markt bislang unterstellt.",NONE],
  ["Porsche Automobil Holding SE","PAH3",34.8,"EUR",31,4,"6 Monate","Der Abschlag auf den Nettoinventarwert bleibt bestehen, zusätzlich belasten die schwachen Ergebnisbeiträge der Beteiligungen.",NONE],
  ["Nikola Corporation","NKLA",1.42,"USD",0.8,5,"3 Monate","Die Liquiditätsreichweite ist knapp bemessen und weitere verwässernde Kapitalmaßnahmen erscheinen kurzfristig wahrscheinlich.",NONE],
  ["Lufthansa AG","LHA",6.12,"EUR",5.2,5,"3–6 Monate","Steigende Personal- und Kerosinkosten treffen auf eine nachlassende Preissetzungsmacht im europäischen Kurzstreckenverkehr.",NONE],
  ["Infineon Technologies AG","IFX",33.6,"EUR",41,2,"12 Monate","Die Lagerkorrektur im Automobilsegment nähert sich dem Ende, während der Bereich Leistungshalbleiter strukturell wächst.",NONE],
  ["Rheinmetall AG","RHM",512,"EUR",600,1,"12–18 Monate","Die Rahmenverträge im Munitionsgeschäft sichern die Auslastung über Jahre und die Kapazitätserweiterungen laufen planmäßig an.",OWNS],
  ["Deutsche Bank AG","DBK",16.4,"EUR",18.5,2,"12 Monate","Die Erträge im Investmentbanking stabilisieren sich und die Kapitalausschüttung steigt planmäßig.",NONE],
  ["Fresenius SE & Co. KGaA","FRE",33.1,"EUR",34,3,"6 Monate","Der Konzernumbau zeigt erste Erfolge, die Verschuldung bleibt jedoch der begrenzende Faktor.",NONE],
  ["Nestlé S.A.","NESN",78.4,"CHF",85,2,"12 Monate","Die Preissetzungsmacht bleibt intakt und das Volumenwachstum kehrt in den Kernkategorien zurück.",NONE],
  ["Novo Nordisk A/S","NOVO B",412,"EUR",470,1,"12 Monate","Die Kapazitätserweiterungen in der Adipositas-Sparte greifen und die Nachfrage übersteigt weiterhin das Angebot.",NONE],
];

// Szenarien: erfundene Demowerte fuer die ersten drei Beispiele, damit auf der
// Detailseite beide Faelle sichtbar sind - mit Szenario-Diagramm und ohne.
// Je Fall: [Kursziel, Eintrittswahrscheinlichkeit in Prozent, Begruendung].
const SZENARIEN = {
  SIE: {
    horizon: "12 Monate",
    best: [252, 25, "Digital Industries kehrt früher als erwartet zum Wachstum zurück und die angekündigte Portfoliobereinigung hebt die Bewertung in Richtung vergleichbarer US-Industriewerte."],
    base: [228, 55, "Der Rekordauftragsbestand wird planmäßig abgearbeitet, die Marge bleibt im oberen Zielkorridor und der Bewertungsabschlag zum europäischen Sektor schließt sich teilweise."],
    worst: [158, 20, "Eine längere Investitionszurückhaltung in der Automatisierung verzögert den Lagerabbau und drückt die Marge an das untere Ende der Zielspanne."],
  },
  SAP: {
    horizon: "12 Monate",
    best: [320, 30, "Die Cloud-Marge steigt schneller als geplant und zusätzlich gebuchte KI-Module erhöhen den Umsatz je Bestandskunde spürbar."],
    base: [285, 50, "Der Cloud-Auftragsbestand wächst weiter zweistellig, die Transformation bleibt im Zeitplan und das Margenziel für das Folgejahr wird bestätigt."],
    worst: [205, 20, "Ein längerer Investitionsstopp bei Großkunden verlangsamt die Migration, womit die hohe Bewertung ihre wesentliche Stütze verliert."],
  },
  ALV: {
    horizon: "12 Monate",
    best: [385, 25, "Ein weiterhin festes Preisumfeld in der Industrieversicherung und ein zusätzliches Rückkaufprogramm heben Ergebnis und Ausschüttung über die Planung."],
    base: [350, 55, "Das Schaden- und Unfallgeschäft wächst im mittleren einstelligen Bereich, die Solvenzquote bleibt komfortabel und die Dividende steigt planmäßig."],
    worst: [268, 20, "Eine Häufung von Naturkatastrophenschäden trifft auf fallende Zinsen und belastet das versicherungstechnische Ergebnis wie auch das Kapitalanlageergebnis."],
  },
};

const OHNE_SZENARIO = {
  scenarioHorizon: "",
  scenarioBestPrice: null,
  scenarioBestProbability: null,
  scenarioBestNote: "",
  scenarioBasePrice: null,
  scenarioBaseProbability: null,
  scenarioBaseNote: "",
  scenarioWorstPrice: null,
  scenarioWorstProbability: null,
  scenarioWorstNote: "",
};

function szenarioFelder(ticker) {
  const s = SZENARIEN[ticker];
  if (!s) return OHNE_SZENARIO;
  return {
    scenarioHorizon: s.horizon,
    scenarioBestPrice: s.best[0],
    scenarioBestProbability: s.best[1],
    scenarioBestNote: s.best[2],
    scenarioBasePrice: s.base[0],
    scenarioBaseProbability: s.base[1],
    scenarioBaseNote: s.base[2],
    scenarioWorstPrice: s.worst[0],
    scenarioWorstProbability: s.worst[1],
    scenarioWorstNote: s.worst[2],
  };
}

const analyses = rows.map(
  ([title, ticker, price, currency, targetPrice, signal, horizon, reason, conflict], i) => {
    const date = new Date(Date.UTC(2026, 7, 28 - i, 12));
    const iso = date.toISOString();
    // Kurszonen nur bei den ersten drei Beispielen, damit beide Faelle
    // sichtbar sind: mit Balken in der Detailansicht und ohne.
    const zonen =
      i < 3 && price
        ? {
            zoneStrongEntryTo: +(price * 0.8).toFixed(2),
            zoneEntryTo: +(price * 0.95).toFixed(2),
            zoneNeutralTo: +(price * 1.1).toFixed(2),
            zoneExitTo: +(price * 1.25).toFixed(2),
          }
        : {
            zoneStrongEntryTo: null,
            zoneEntryTo: null,
            zoneNeutralTo: null,
            zoneExitTo: null,
          };

    return {
      id: randomUUID(),
      title,
      ticker,
      price,
      currency,
      targetPrice,
      ...zonen,
      ...szenarioFelder(ticker),
      reason,
      signal,
      horizon,
      author: AUTHOR,
      conflictDisclosure: conflict,
      publishedAt: iso,
      createdAt: iso,
      updatedAt: iso,
    };
  },
);

mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
writeFileSync(
  path.join(process.cwd(), "data", "seed.json"),
  JSON.stringify({ analyses, users: [] }, null, 2),
  "utf8",
);
console.log(`data/seed.json geschrieben (${analyses.length} Analysen).`);
