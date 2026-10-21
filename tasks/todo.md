# Vertragsmails, Rechtstexte, Kündigungs- und Widerrufsbutton

Auftrag (19.10.2026): Eingangs- und Vertragsbestätigung per E-Mail mit AGB und
Widerrufsbelehrung als PDF; automatische Widerrufs- und Kündigungsbestätigung;
alle Texte nach deutschem Recht. Entscheidungen des Nutzers: Jahresabo nach
12 Monaten jährlich weiter, monatlich kündbar mit anteiliger Erstattung;
Pflicht-Häkchen zum sofortigen Beginn (Widerrufsrecht erlischt).

## Plan
- [x] Rechtstexte als gemeinsame Quelle (`src/lib/legal/`): AGB, Widerrufsbelehrung (Muster Anlage 1/2 EGBGB, digitale Inhalte)
- [x] PDF-Satz mit Markenschriften (`src/lib/pdf/`), Download unter `/agb/pdf`, `/widerruf/pdf`
- [x] SMTP-Versand und E-Mail-Vorlagen (`src/lib/mail/`)
- [x] Bestellübersicht `/bestellen` mit Button-Lösung und Zustimmung; `/api/checkout` entfernt
- [x] `/kuendigen` (§ 312k BGB) und `/widerrufen` ohne Anmeldung, Links in Footer und Konto
- [x] Webhook: Vertragsbestätigung, Portal-Kündigungen, anteilige Erstattung (`src/lib/abo.ts`)
- [x] Preiskarten, FAQ, Chat-Wissen, Impressum (OS-Plattform), README, `.env.example`

## Review
- Getestet: Fristberechnung (Monatsende, Schaltjahr, Zeitumstellung), alle Mail-Vorlagen
  gerendert (Desktop/Handy, `.eml` mit PDF-Anhängen), PDFs per pdftoppm geprüft,
  Bestellung/Kündigung/Widerruf im Browser (Desktop/Handy), Druckansicht, Paywall-Tests.
- Nicht getestet: echte Stripe-Aufrufe (keine Schlüssel) – vor dem Livegang mit
  Stripe-Testmodus durchspielen (Bestellung, Portal-Kündigung, Jahresabo-Erstattung).
- Offen: anwaltliche Prüfung, echte Firmendaten, SMTP-Zugang, Stripe-Webhook-Events.

---

# Runde 4: Breite, Kreuze, Taube, Ecken, „2 Monate gratis“ (19.10.2026)

## Plan
- [x] Volle Breite am PC: `--frame` von 75rem auf 120rem, mitwachsende Ränder; seitliche Rahmenlinien entfallen
- [x] Pluszeichen-Raster und Kreuze entfernen (Startseite, Anmeldung, 404, Handymenü, Admin-Login)
- [x] Taube im Fuß sichtbar und schön machen – sonst weglassen
- [x] Runde Ecken nach Canva-Beispiel (YouTube-Screenshot): Karten ~16px, Knöpfe/Filter/Etiketten als Pille, Felder 12px
- [x] Umschalter Jährlich: „2 Monate gratis“ statt „−2 Monate“
- [x] Prüfen auf 1920/1440/390 px, Tests, auf Branch zeigen

## Ergebnis
- Breite: Inhalt füllt den Bildschirm bis 1920 px (vorher 1200 px); Ränder wachsen
  von 40 auf bis zu 96 px. Erst über 1920 px (z. B. 2560) bleibt der Inhalt mittig.
- Raster, Kreuze und seitliche Rahmenlinien sind entfernt (`PlusPattern` gelöscht,
  tote Klassen `frame-lines`, `plus-grid`, `cross` raus).
- Taube: Vorher war nur die Flügelspitze bei 6 % zu sehen. Jetzt ist die ganze Taube
  mit Kopf und Flügeln zu sehen, bei 14 %, und sie läuft nach unten weich aus
  (`.wasserzeichen`). Vier Varianten wurden verglichen; diese war die klarste.
- Ecken:
  - Tokens `--radius-card` 16 px, `--radius-field` 12 px und `--radius-control` als Pille.
  - Gerundet sind Karten, Boxen, Knöpfe, Filter, Etiketten, Umschalter, Sperrbalken,
    die Markierung „Investieren“, der Sprunglink, Chat und Cookie-Banner.
  - Die E-Mail-Vorlagen sind ebenfalls gerundet; klassisches Outlook bleibt eckig.
- Prüfskript: keine eckigen Kästen mehr auf 19 Seiten, im Kundenkonto und im Admin-Bereich.
- Tests grün:
  - Bestellung, Kündigung und Widerruf (Desktop und Handy).
  - Paywall-Filter, Filterleiste und Paketbox (320–1280 px).
  - Keine seitliche Verschiebung zwischen 1024 und 2560 px.
- Neuer Text zur Freigabe: „2 Monate gratis“ (Umschalter Jährlich).
- Freigabe „passt“ am 19.10.2026 – live auf `main`.

---

# Runde 5: Erste Analyse sperren, neue Preise (21.10.2026)

## Plan
- [ ] Leseprobe abschaffen: Ohne Paket ist keine Analyse frei (Liste, Startseite, Detailseite)
- [ ] Texte, die die Leseprobe erwähnen, anpassen – neue Texte zur Freigabe auflisten
- [ ] Preise: Basic 9 €, Black 24 €, Platin 49 € (Jahrespreise folgen „2 Monate gratis“)
- [ ] Beschreibungen: Basic „Für den Einstieg in unsere Analysen“, Black „Für eine diversifizierte Auswahl an Aktien“, Platin unverändert
- [ ] Stripe-Anbindung prüfen (feste Preis-IDs oder Beträge aus der Konfiguration?)
- [ ] Build, Tests (Paywall ohne Leseprobe), Screenshots; auf Branch zeigen, `main` erst nach „passt“
