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
- [x] Leseprobe abschaffen: Ohne Paket ist keine Analyse frei (Liste, Startseite, Detailseite)
- [x] Texte, die die Leseprobe erwähnen, anpassen – neue Texte zur Freigabe auflisten
- [x] Preise: Basic 9 €, Black 24 €, Platin 49 € (Jahrespreise folgen „2 Monate gratis“)
- [x] Beschreibungen: Basic „Für den Einstieg in unsere Analysen“, Black „Für eine diversifizierte Auswahl an Aktien“, Platin unverändert
- [x] Stripe-Anbindung prüfen (feste Preis-IDs oder Beträge aus der Konfiguration?)
- [x] Build, Tests (Paywall ohne Leseprobe), Screenshots; auf Branch zeigen, `main` erst nach „passt“

## Ergebnis
- Ohne Paket ist keine Analyse frei. Die Detailseite leitet Gäste auf `/preise` um.
  Die Startseite zeigt drei gesperrte Karten.
- Preise 9/24/49 € im Monat und 90/240/490 € im Jahr (10 Monatsbeiträge). § 2 der AGB
  übernimmt sie automatisch, deshalb ist der Stand der Rechtstexte jetzt der 21.10.2026.
- Stripe rechnet über feste Preis-IDs. Neue Preise müssen in Stripe angelegt und die
  IDs in Vercel ersetzt werden. `stripe:setup` legt bei geänderten Beträgen jetzt
  wirklich neue Preise an.
- Neue Texte zur Freigabe:
  - „Mit einem Paket schaltest du die aktuellsten frei.“
  - „Alle Analysen schaltest du mit einem Paket frei.“
  - „Der Filter durchsucht nur freigeschaltete Analysen – mit einem Paket schaltest du sie frei.“
- Recherche und Prüfung liefen über Unteragenten. Build und alle Tests sind grün,
  der Paywall-Test läuft jetzt ohne Leseprobe.
- Freigabe „passt“ am 22.10.2026 – live auf `main`.

---

# Runde 7: Sicherheit (23.10.2026)

Grundlage:
- Code-Audit durch einen Unteragenten; die Funde habe ich selbst im Code nachgeprüft.
- `npm audit`, eine Prüfung der Git-Historie auf Geheimnisse und der Supabase-Security-Advisor.
- Eine Web-Recherche zur aktuellen Lage.

## Plan – Phase 1: Code (auf dem Arbeitsbranch, live erst nach „passt“)
- [x] Next.js 16.3.8 → gepatchte 16.4.x (kritisch: RCE/DoS, GHSA-2464 / -p3m5 / -673q); Bildoptimierer abschalten (wird nicht genutzt)
- [x] Kontoübernahme schließen (/willkommen setzte für jede E-Mail ein neues Passwort):
      Passwort nur noch mit Nachweis – bezahlte Stripe-Checkout-Session (nur erstes Passwort) oder
      signierter E-Mail-Link (1 h, einmalig); Nachweis im httpOnly-Cookie statt in der URL
- [x] Checkout-Abgleich nur für abgeschlossene, bezahlte Sessions; keine Felder mit null überschreiben
- [x] Logins gegen Passwort-Raten drosseln (Kunde, Admin, Link-Anforderung); gleiche Antwortzeit für unbekannte Adressen; Admin-Sitzung 12 h statt 30 Tage
- [x] Kündigungsquittung verrät keine Vertragsdaten mehr (Paket, Vertragsende nur per E-Mail); Mails je Empfänger drosseln
- [x] Stripe-Webhook: frischen Abo-Stand laden (Reihenfolge der Events), Paket aus Abo-Metadaten (alte Preis-IDs), keine internen Fehlertexte
- [x] Chat: nur Anfragen von der eigenen Seite, Verlauf sauber kürzen, Anzahl Analysen zwischenspeichern
- [x] Sicherheits-Header: CSP (Grundregeln), Permissions-Policy, Cross-Origin-Opener-Policy
- [x] Kleinkram: `.env*` in .gitignore, SMTP nur mit TLS, ungültige Analyse-ID → 404 statt 500, PDF-Cache am CDN
- [x] Build, Tests, neue Tests für die Lücken (Unteragent); Bericht und Freigabe

## Plan – Phase 2: mit KI und Diensten (nach Rückfrage, teils Konten nötig)
- [x] Wöchentliche KI-Sicherheitsprüfung als Routine „Wöchentlicher Sicherheitscheck“, montags 8:45 Uhr (Berlin), Push + E-Mail; läuft ohne Connectoren (Prüfen/Berichten ja, Fix-Branch pushen evtl. nicht)
- [ ] GitHub: Dependabot-Alerts/-Updates (mit Wartezeit gegen frische Schadpakete), Secret Scanning + Push Protection, CodeQL + Copilot Autofix
- [ ] Vercel Firewall: Rate-Limits für Login/Chat/Formulare, Bot-Schutz, im Ernstfall Attack Challenge Mode
- [ ] Optional: strenge CSP mit Nonce (nach Test mit dem echten GTM-Container), Bot-Schutz (BotID/Turnstile) für Formulare
- [ ] Supabase in Vercel anbinden (Live-Seite nutzt noch Beispieldaten/Arbeitsspeicher)

## Ergebnis Phase 1
- Funde aus dem Audit, alle im Code nachgeprüft:
  - Kontoübernahme ohne Anmeldung über /willkommen (kritisch)
  - Next.js-Lücken (kritisch laut npm audit, bei uns erreichbar: DoS über Server-Aktionen)
  - keine Drosselung der Anmeldung
  - Kündigungsquittung verriet Vertragsdaten
  - Checkout-Abgleich mit offenen Sessions
  - Webhook-Reihenfolge, Chat-Kosten
- Kein Geheimnis in der Git-Historie (43 Commits geprüft); Supabase-Advisor nur Info.
  Die Tabellen sind leer – live laufen noch Beispieldaten.
- Prüfung durch einen Unteragenten:
  - Erster Lauf: 164 ok, 7 Fehler (Absturz bei ?zahlung=constructor, Link-Prüfung mit lokalem Speicher).
  - Beides behoben, zweiter Lauf: 214 ok, 0 Fehler.
  - Dazu alle bisherigen Tests grün; Angriffstests (abgefangene Aktion ohne Nachweis, gefälschte Tokens) scheitern wie gewollt.
- Neue Texte zur Freigabe:
  - /willkommen: „Gib die E-Mail-Adresse ein, mit der du dein Paket gebucht hast. Wir schicken dir einen Link, mit dem du dein Passwort vergibst.“
  - Hinweise nach dem Checkout bzw. bei abgelaufenem Link.
  - Mail „Dein Link zum Passwort“.
  - Login: „Passwort vergessen? Neuen Link anfordern“.
  - Sperrhinweis „Zu viele Versuche in kurzer Zeit. Bitte warte ein paar Minuten.“
- Offen, nicht im Code lösbar:
  - Vercel-Plan (Hobby ist nur nicht-kommerziell).
  - Supabase anbinden.
  - Rechtsfrage: Kündigung erst nach E-Mail-Bestätigung ausführen?
  - Bestellungen mit fremder E-Mail.
- Freigabe „passt“ am 23.10.2026 – live auf `main`.

## Supabase-Anbindung (23.10.2026, Auftrag: „binde Supabase an … damit nichts verloren gehen kann“)
- [x] 20 Analysen (die live sichtbaren, IDs unverändert) per SQL nach Supabase übernommen; Schema war vollständig
- [x] Schutz: Live-Seite lehnt Änderungen ohne Datenbank ab (statt flüchtigem Speicher); Admin zeigt roten Hinweis
- [x] Variablennamen der Vercel-Integration werden ebenfalls erkannt
- [x] Nutzer: NEXT_PUBLIC_SUPABASE_URL (Typ Config) + SUPABASE_SERVICE_ROLE_KEY (Secret) in Vercel, nur Production, Redeploy (24.10.2026)
- [x] Live geprüft: Supabase-Logs zeigen GET /rest/v1/analyses (200) von supabase-js auf Node 24.21.0 genau zu den Seitenaufrufen; 20 Analysen sichtbar
- Offen (klein): Löschen im Admin und Passwort-Setzen zeigen ohne Datenbank nur die allgemeine Fehlerseite statt eines Hinweises


---

# Runde 8: Vergleich auf der Startseite (24.10.2026)
- [x] Stelle B (vor den Paketen), heller Abschnitt; PC: Überschrift links, Tabelle rechts (PAX-Spalte dunkel mit Logo); Handy: zwei Karten
- [x] Text vom Inhaber (5 Gegenüberstellungen); Überschrift „Was PAX Solutions unterscheidet“; Einleitung nur am PC: „Unsere Prinzipien, die den Unterschied ausmachen.“
- [x] Geprüft: 1440/1920/820/390 px ohne Überlauf, Konsole sauber, Einleitung nur ab 1024 px sichtbar
- Freigabe „passt … kann live“ am 24.10.2026

---

# Runde 9: Metallkarten-Animation auf der Startseite (24.10.2026, zur Probe)
Auftrag: „setze jetzt die Animation mit den Bankkarten ein“ – aus dem Repo `Try-Out-`, Branch
`claude/cool-brahmagupta-v4dxrw` (`metallkarten/index.html`, Artefakt „PAX Metallkarten“).
Nur auf der Startseite, nicht unter /preise. Texte aktuell halten. Live erst nach Freigabe.

- [x] Prototyp gelesen; Datei im Repo und Artefakt sind identisch
- [x] Texte abgeglichen: Einleitung, Namen, Beschreibungen, Umfang und Preise (9/24/49 €, 90/240/490 €) stimmen mit der Website überein
- [x] Komponente `Metallkarten.tsx`: Bühne mit three.js (Code des Prototyps), darunter das bestehende Preisraster
  - Texte direkt aus `config.ts` (Bildunterschriften, Gravur) und aus `PaketeKopf` (Einleitung) – ändern sich künftig mit
  - Umschalter Monatlich/Jährlich gilt auch für die Bildunterschriften (wie im Prototyp)
  - Schriften von der Website (next/font) statt Google Fonts, three.js aus dem Paket statt CDN
  - Bühne bleibt unter der Kopfzeile stehen; three.js startet erst kurz vor der Bühne
  - Kamera hält die vordere Karte mit etwa 3 % Abstand vom Rand (vorher stieß sie bei flachen Fenstern an)
- [x] /preise unverändert (PricingSection mit eigener Überschrift, ohne Bühne)
- [x] Prüfung durch Unteragenten: alle Formate, Umschalter, Ausweichmodi, Videos; unabhängiger Code-Review
- [x] Funde aus dem Review behoben (Commit 47b0e3a) und nachgeprüft
- [x] Bilder und Videos gezeigt; Freigabe „alles passt“ am 24.10.2026 – live seit 21:13 UTC (main 3777107)

### Review Runde 9
**Geprüft** (Chromium + SwiftShader, 1440×900, 1920×1080, 1440×790, 1180×820, 844×390, 820×1180, 390×844, 375×667)
- Kopfzeile bleibt oben, Bühne direkt darunter; kein Überlauf; Konsole sauber
- Karten nie am Rand abgeschnitten (vordere Karte am PC 15–27 px Abstand); Bildunterschriften
  vollständig im Bild, ohne Überlappung, Texte wörtlich wie config.ts
- Umschalter: Jährlich zeigt 90/240/490 € „/Jahr“ in Raster und Bildunterschriften, zurück ebenso
- In Ruhe keine weiteren Bilder; /preise ohne Bühne; je eine H2 „Zugang nach Maß“ und ein #pakete
- Bewegung reduzieren: Standbild unter der Einleitung; ohne WebGL und ohne JavaScript: nur Einleitung
- Seitenwechsel zu /preise und zurück: Bühne startet wieder
- Nach dem Review: Logo pausiert außerhalb des Bilds (0 Zeichnungen), Druck ohne Bühne,
  ohne WebGL 2 sofort Einleitung, bei 200 % Schrift entfällt die Bühne (Text bleibt lesbar)

**Unabhängiger Review:** keine schweren Fehler; Zahlen der Choreografie 1:1 wie im Prototyp.
Behoben: abgeschnittene Einleitung bei großer Schrift, Kopfzeilenhöhe in rem, Druckansicht,
Speicher freigeben, „Bewegung reduzieren“ beim Start neu lesen, LogoScene pausiert, WebGL-2-Prüfung.
Nicht umgesetzt: Aufteilung der Startarbeit auf mehrere Bilder (erst bei Ruckeln am Handy).

**Grenzen:** nur Software-Rendering geprüft – auf einem echten Handy noch offen (Ruckeln beim
Heranscrollen, Zurück-Taste an der Bühne: im Test sprang die Seite einmal nach oben, vermutlich
ein Effekt des langsamen Software-Renderings).

---

# SEO-Audit (24.10.2026, Auftrag: „führe einen SEO Audit für die Website durch“)
Datensammlung durch Unteragenten (Live-Seite = `main` a9e8fc4, 30 URLs, robots, Sitemap, Code).
PageSpeed Insights ohne API-Schlüssel gesperrt (Kontingent 0) – Messung durch den Inhaber oder lokal.

Befund (Kurzfassung)
- Gut: crawlbar, serverseitig gerendert, richtige Domain überall, Sitemap/robots gültig, keine kaputten Links,
  echte 404, Weiterleitungen (Schrägstrich, http→https), HSTS, eindeutige Titel, LCP ist Text, CLS 0
- Dringend (Inhaber): Impressum und Fuß zeigen Platzhalter (Musterstraße, Max Mustermann, example.com …)
- Dringend (Inhaber): keine Spur einer Indexierung – Search Console einrichten, Sitemap einreichen
- Technik: keine Canonical-Tags (Filter-URLs /analysen?signal=1…5 = Duplikate), /preise ohne H1,
  Open Graph ohne url/type/locale/site_name, kein JSON-LD, PDFs ohne noindex, /favicon.ico 404,
  robots.txt sperrt Seiten mit noindex, Sitemap-lastmod überall Build-Zeit
- Texte: Start-Titel 81 Zeichen ohne „Aktienanalysen“, Unterseiten-Titel einwortig, Beschreibungen kurz
- Später: eigene Domain, mehr öffentliche Inhalte (fast alles hinter der Bezahlschranke), HTML nie gecacht

Vorschläge (warten auf Freigabe)
- [x] Technik ohne neue Texte: Canonical, H1 auf /preise, Open Graph, JSON-LD (Name, URL, Logo), PDFs noindex, favicon.ico, robots.txt
- [x] Neue Titel und Beschreibungen (Freigabe „alles passt … kann alles live“ am 24.10.2026)
- [ ] Search-Console-Code einbauen, sobald der Inhaber ihn schickt

Umsetzung
- `src/lib/seo.ts`: `kanonisch(pfad)` für 13 öffentliche Seiten (Canonical + og:url, type, locale, site_name, Bild);
  Grundwerte im Layout; JSON-LD (Organization, WebSite) auf der Startseite
- Preise-Beschreibung aus config.ts (Namen, Umfang, Gratis-Monate) – bleibt so aktuell
- Fund beim Prüfen: Seiten mit eigener Open-Graph-Angabe verlieren das Bild aus opengraph-image.png –
  deshalb steht das Bild ausdrücklich in `kanonisch()`
- Geprüft lokal (16 Adressen): je ein Canonical auf die eigene Adresse (Filter und ?gesperrt=1 auf die
  Grundseite), je eine H1, je ein og:image (200), Titel/Beschreibungen wie freigegeben, /login weiter noindex,
  PDFs mit X-Robots-Tag noindex, /favicon.ico 200, robots.txt sperrt nur /api/; H1 auf /preise sieht aus wie zuvor

---

# Kopfzeile auf Tablets und Tauben-Kennung (24.10.2026, Auftrag: „Ja“ – zur Probe)
- [x] Kopfzeile: volle Navigation erst ab 1024 px (vorher ab 768 px, dort brachen „Über uns“ und „Zugang sichern“
      um); darunter das Handy-Menü mit „Zugang sichern“ im Menü. Bühnen-Abstand (`--kopfzeile`) folgt dem Wechsel
- [x] DoveMark: eigene Kennung je Taube (`useId`), vorher 5× `id="taube"`; einfarbige Taube ohne Verlauf
- [x] Geprüft: 768/820 px ohne Umbruch, Kopfzeile 65 px, Bühne bündig; Menü öffnet mit allen Punkten;
      1024/1440 px unverändert; 4 eindeutige Kennungen, alle 8 Verweise gültig
- [ ] Freigabe abwarten, dann live
