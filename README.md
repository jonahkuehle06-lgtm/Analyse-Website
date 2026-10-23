# Aktienanalysen hinter einer Paywall

Eine fertige Website für entgeltliche Aktienanalysen: Paketauswahl über Stripe,
Kundenbereich mit Zugriffsbeschränkung, Admin-Oberfläche zum Anlegen und
Bearbeiten der Analysen sowie vorbereitete Rechtstexte.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Stripe · Supabase (optional)

---

## 1. In fünf Minuten lokal starten

```bash
npm install
cp .env.example .env.local
npm run seed -- --secret          # AUTH_SECRET erzeugen, Ausgabe in .env.local eintragen
npm run seed                      # Beispieldaten nach data/store.local.json kopieren
npm run dev
```

Danach läuft die Seite auf <http://localhost:3000>. Ohne Supabase- und
Stripe-Variablen arbeitet sie in einem **lokalen Testmodus**: Analysen liegen in
`data/store.local.json`, Bezahlvorgänge sind deaktiviert.

### Admin-Zugang einrichten

```bash
npm run seed -- --admin-password "DeinPasswort"
```

Die ausgegebene Zeile `ADMIN_PASSWORD_HASH=…` zusammen mit `ADMIN_EMAIL=…` in
`.env.local` eintragen. Anmeldung dann unter `/admin/login`.

---

## 2. Datenbank (Supabase)

Damit Änderungen dauerhaft gespeichert werden, wird eine Datenbank benötigt.
Supabase ist die einfachste Variante — kein eigener Server, kostenloser Einstieg.

1. Projekt auf <https://supabase.com> anlegen.
2. Im **SQL Editor** den Inhalt von `supabase-schema.sql` ausführen.
3. Unter *Project Settings → API* zwei Werte kopieren:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = `service_role`-Schlüssel
     (**geheim halten** — dieser Schlüssel umgeht alle Zugriffsregeln und darf
     ausschließlich serverseitig gesetzt werden, nie im Browser)

Sobald beide Variablen gesetzt sind, schaltet die Anwendung automatisch von der
lokalen JSON-Datei auf Supabase um (nach einem neuen Deployment). Die Namen
`SUPABASE_URL` und `SUPABASE_SECRET_KEY` aus der Supabase-Integration von Vercel
werden ebenfalls erkannt.

In Vercel beide Variablen **nur für „Production“** anlegen, den Schlüssel als
„Sensitive“. Vorschau-Deployments von Branches laufen dann mit Beispieldaten und
können die echten Daten nicht verändern.

**Schutz vor Datenverlust:** Fehlt auf der Live-Seite die Datenbank, lehnt die
Seite jede Änderung ab, statt sie im flüchtigen Speicher abzulegen. Der
Admin-Bereich zeigt dann einen roten Hinweis; der Stripe-Webhook antwortet mit
einem Fehler, und Stripe stellt das Ereignis später erneut zu.

---

## 3. Stripe einrichten

### 3.1 Produkte und Preise anlegen

```bash
STRIPE_SECRET_KEY=sk_test_... npm run stripe:setup
```

Das Skript legt die drei Produkte mit je einem monatlichen und einem jährlichen
Preis an und gibt die sechs `STRIPE_PRICE_…`-Zeilen aus, die in die
Umgebungsvariablen gehören. Es ist wiederholbar — vorhandene Produkte werden
erkannt und nicht doppelt angelegt.

### 3.2 Zahlungsarten

`STRIPE_PAYMENT_METHODS` steuert, was im Bezahlvorgang angeboten wird:

| Wert | Bedeutung |
|---|---|
| `card,paypal,sepa_debit` | Voreinstellung: Karte, PayPal, SEPA-Lastschrift |
| `auto` | Die im Stripe-Dashboard aktivierten Methoden werden automatisch verwendet |

In Deutschland stehen für **Abonnements** über Stripe zusätzlich zur Verfügung:

- **Kredit-/Debitkarte** – immer verfügbar
- **SEPA-Lastschrift** – für wiederkehrende Zahlungen gut geeignet, Mandat wird
  von Stripe eingeholt; Zahlungseingang verzögert sich um einige Werktage
- **PayPal** – muss im Dashboard unter *Einstellungen → Zahlungsmethoden*
  aktiviert werden
- **Link** (Stripe-eigenes Schnell-Checkout) – optional
- **Klarna** – für Abonnements nur eingeschränkt nutzbar, daher nicht
  voreingestellt

Sofortüberweisung/giropay sind für wiederkehrende Zahlungen nicht geeignet und
bleiben bewusst außen vor.

### 3.3 Webhook

Im Stripe-Dashboard unter *Entwickler → Webhooks* einen Endpunkt anlegen:

- URL: `https://DEINE-DOMAIN/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.created`,
  `customer.subscription.updated`, `customer.subscription.deleted`

Das ausgegebene *Signing secret* als `STRIPE_WEBHOOK_SECRET` hinterlegen.

Lokal testen:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 3.4 Kundenportal

Unter *Einstellungen → Billing → Kundenportal* aktivieren. Darüber ändern
Kunden ihr Zahlungsmittel und laden Rechnungen herunter — die Seite verlinkt es
im Kundenkonto („Abo verwalten“).

Empfohlene Einstellungen:

- **Abos kündigen:** erlaubt, aber nur **zum Ende des Abrechnungszeitraums**
  (nicht „sofort“). Der Webhook bestätigt solche Kündigungen per E-Mail und
  setzt beim Jahresabo nach der Mindestlaufzeit das Ende auf einen Monat (siehe
  Abschnitt 6d). Die gesetzlich vorgeschriebene Kündigung läuft ohnehin über
  die Schaltfläche „Verträge hier kündigen“.
- **Abos aktualisieren (Paketwechsel):** aus. Die AGB regeln keinen
  Paketwechsel; wer wechseln will, kündigt und bucht neu.

---

## 4. Abo-Modell

Vorgeschlagen und umgesetzt ist ein **Abonnement mit monatlicher oder jährlicher
Abrechnung**; bei jährlicher Zahlung entfallen zwei Monatsbeiträge.

| Paket | Analysen | monatlich | jährlich |
|---|---:|---:|---:|
| Basic | 10 | 9 € | 90 € |
| Black | 25 | 24 € | 240 € |
| Platin | 50 | 49 € | 490 € |

Freigeschaltet werden immer die **aktuellsten** Analysen des Bestands. Erscheint
eine neue Analyse, rückt sie automatisch in den Zugang aller Kunden nach.

Laufzeit und Kündigung (§ 6 AGB, ausgelegt auf § 309 Nr. 9 BGB):

- **Monatsabo:** unbefristet, jederzeit zum Ende des Abrechnungsmonats kündbar.
- **Jahresabo:** Mindestlaufzeit zwölf Monate, zum Ende der Mindestlaufzeit
  kündbar. Danach läuft es unbefristet weiter und wird weiter jährlich im Voraus
  abgerechnet, ist aber jederzeit mit einer Frist von einem Monat kündbar. Den
  bezahlten Anteil für die Zeit nach dem Vertragsende erstattet die Seite
  automatisch (taggenau anteilig, über Stripe).

Der Signal-Filter der Übersicht durchsucht nur freigeschaltete Analysen.
Gesperrte Titel blendet er aus, sonst ließe sich ihre Signalstärke über den
Filter ablesen.

Preise, Namen und Umfang stehen in `src/lib/config.ts`. Nach einer Änderung dort
müssen die Stripe-Preise angepasst werden (`npm run stripe:setup` legt bei
geänderten Beträgen neue Preise an).

---

## 5. Deployment

Empfohlen ist **Vercel** — dort läuft Next.js ohne weitere Konfiguration.

1. Repository auf GitHub pushen.
2. Auf <https://vercel.com> *New Project* → Repository auswählen → *Deploy*.
3. Unter *Settings → Environment Variables* alle Werte aus `.env.example`
   eintragen (`NEXT_PUBLIC_SITE_URL` auf die echte Domain setzen).
4. Neu deployen, damit die Variablen greifen.
5. Im Stripe-Dashboard den Webhook auf die echte Domain umstellen.

### Production Branch

Vercel baut die Live-Version nur aus einem einzigen Branch — dem *Production
Branch*. Er steht unter *Settings → Git* und muss mit dem Branch übereinstimmen,
auf dem der Code tatsächlich liegt (hier: `main`).

Zeigt die Einstellung auf einen Branch, den es nicht (mehr) gibt — etwa nach
einer Umbenennung —, meldet Vercel dauerhaft **"No Production Deployments"**
und baut nichts. Dann den Namen korrigieren und einen Commit auf den richtigen
Branch pushen; ein gespeichertes Formular allein löst noch kein Deployment aus.

> **Wichtig:** Ohne Supabase gehen auf Vercel alle über die Admin-Oberfläche
> angelegten Analysen beim nächsten Deployment verloren, weil serverlose
> Umgebungen kein beschreibbares Dateisystem haben. Für den Live-Betrieb ist
> Schritt 2 (Supabase) deshalb nicht optional.

### Commit-Autor: Vercel baut nicht jeden Push

Vercel legt **nur für Commits ein Deployment an, deren GitHub-Autor Zugriff
auf das Projekt hat** — im Regelfall also dein eigenes Konto. Ein Commit mit
einer fremden Autoren-E-Mail wird kommentarlos übergangen: keine Fehlermeldung,
kein Eintrag unter *Deployments*, die Live-Seite bleibt auf dem alten Stand.

Deshalb muss die Git-Identität im Projekt stimmen:

```bash
git config user.name  "Dein Name"
git config user.email "deine@adresse.de"   # dieselbe wie in deinem GitHub-Konto
```

Prüfen lässt sich das mit `git log -3 --pretty='%h %an <%ae> | %s'`. Steht dort
eine fremde Adresse, hilft kein erneutes Pushen — es braucht einen neuen Commit
unter der richtigen Autorenschaft. Der bringt den gesamten Stand mit, auch die
übergangenen Commits.

---

## 6. Bedienung der Admin-Oberfläche

`/admin/login` → Anmeldung mit `ADMIN_EMAIL` und Passwort.

Unter `/admin` lassen sich Analysen anlegen, bearbeiten und löschen. Jedes Feld
ist ein Formularfeld — Code oder Datenbank müssen nie angefasst werden.
Gespeicherte Änderungen sind **sofort** auf der Live-Seite sichtbar.

Felder je Analyse:

- Aktientitel, Kürzel, Kurs, Kursziel, Währung
- Kurze Begründung (ein bis zwei Sätze, max. 400 Zeichen)
- Signalstärke in fünf Stufen mit Farbcode
- Anlagehorizont, Erstellungsdatum
- Kurszonen: vier Kursgrenzen, die die fünf Signalbereiche trennen
- Szenarien: Best / Base / Worst Case mit Kursziel, Wahrscheinlichkeit
  und kurzer Begründung, dazu ein gemeinsamer Zeithorizont
- Ersteller und Offenlegung möglicher Interessenkonflikte (Pflichtangaben)

---

## 6a. Seiten-Assistent (Chat)

Rechts unten auf der Seite sitzt ein Chat-Fenster, in dem Besucher Fragen zum
Angebot stellen koennen. Es beantwortet Fragen zu Paketen, Preisen,
Signalstufen, Zahlung und Kuendigung.

### Einrichten

1. Auf <https://console.anthropic.com> ein Konto anlegen und Guthaben
   hinterlegen (Abrechnung nach Verbrauch, kein Abo).
2. Unter *API Keys* einen Schluessel erzeugen.
3. In Vercel als `ANTHROPIC_API_KEY` eintragen (Typ: Secret), neu deployen.

Ohne Schluessel erscheint das Chat-Fenster gar nicht erst — die Seite
funktioniert vollstaendig ohne ihn.

Ueber `ANTHROPIC_MODEL` laesst sich das Modell wechseln. Voreingestellt ist
`claude-sonnet-5-5`; `claude-haiku-4-5` ist guenstiger, `claude-opus-5-5`
staerker.

### Grenzen, die fest eingebaut sind

Der Assistent darf **keine Anlageberatung** geben. Er lehnt Fragen zu
einzelnen Wertpapieren, Kursprognosen, Portfolios und zur persoenlichen
Finanzlage ab und verweist auf das Angebot. Die Inhalte der Analysen
(Begruendung, Kursziel) kennt er nicht — sie sind zahlungspflichtig, und der
Chat soll die Paywall nicht umgehen koennen. Unter dem Eingabefeld steht ein
dauerhaft sichtbarer Hinweis darauf.

Diese Grenzen stehen in `src/lib/chat-knowledge.ts`. Wer sie lockert, sollte
bedenken: Persönlich zugeschnittene Empfehlungen im Chat wären keine
allgemeine Analyse mehr, sondern individuelle Anlageberatung.

### Missbrauchsschutz

Pro IP sind 15 Nachrichten in 10 Minuten moeglich, je Nachricht hoechstens
1200 Zeichen, je Gespraech 12 Nachrichten. Angenommen werden nur Anfragen von
der eigenen Seite. Die Zaehlung liegt im Arbeitsspeicher der jeweiligen
Serverinstanz — auf Vercel laufen mehrere parallel, die Grenze wirkt dort also
weicher als angegeben. Harte Grenzen setzen eine Rate-Limit-Regel in der
Vercel-Firewall fuer `/api/chat` und ein Ausgabenlimit fuer den API-Schluessel
(eigener Workspace in der Claude Console).

---

## 6b. Google Tag Manager (optional)

Vorbereitet, aber nicht aktiv. Sobald `NEXT_PUBLIC_GTM_ID` auf eine
Container-ID der Form `GTM-XXXXXXX` gesetzt ist, wird der Container geladen -
ohne die Variable kommt kein einziges Google-Skript auf die Seite.

### Einwilligung

Vor dem Container laeuft der **Google Consent Mode v2** mit der Voreinstellung
`denied` fuer `analytics_storage`, `ad_storage`, `ad_user_data` und
`ad_personalization`. GTM startet damit zwar, feuert aber keine
einwilligungspflichtigen Tags.

Das **Einwilligungsfenster** erscheint beim ersten Besuch, sobald eine
Container-ID gesetzt ist. Es bietet "Nur notwendige", "Einstellungen" und
"Alle akzeptieren" in gleicher Groesse und gleicher Gestaltung - ein
hervorgehobener Zustimmen-Knopf neben einem unscheinbaren Ablehnen-Knopf gilt
als unzulaessige Beeinflussung. Statistik und Marketing sind nicht
vorangekreuzt. Ueber "Cookie-Einstellungen" in der Fusszeile laesst sich die
Wahl jederzeit aendern oder widerrufen.

Ohne Container-ID erscheint weder das Fenster noch der Fusszeilen-Link - dann
gibt es nichts einzuwilligen.

Das Fenster steuert die Einwilligung ueber diese Schnittstelle:

```js
window.paxConsent.update({ analytics: true, ads: false }); // erteilen
window.paxConsent.read();                                  // aktuelle Wahl lesen
window.paxConsent.revoke();                                // widerrufen
```

Die Wahl liegt unter `pax_consent` im localStorage und wird beim naechsten
Besuch automatisch wieder angewendet.

### Cookie-Seite

`/cookies` passt sich an: Ohne Container-ID erklaert sie, warum es keinen
Banner gibt. Mit Container-ID beschreibt sie stattdessen den Tag Manager und
den Consent Mode - samt Platzhalter fuer die konkret eingebundenen Dienste,
der vor dem Livegang zu fuellen ist.

---

## 6c. Detailansicht einer Analyse

Jede freigeschaltete Analyse laesst sich anklicken und oeffnet unter
`/analysen/<id>` eine eigene Seite: Kurs, Kursziel, Horizont, Datum,
Signalstaerke mit Erlaeuterung, die Begruendung und - sofern gepflegt -
das Szenario-Diagramm und der Kurszonen-Balken.

**Die Paywall gilt dort genauso.** Die Detailseite prueft serverseitig
dieselbe Regel wie die Uebersicht: freigeschaltet sind die N aktuellsten
Analysen des gebuchten Pakets, ohne Abo keine.
Wer eine gesperrte Kennung direkt aufruft, landet auf `/preise`. Gesperrte
Karten fuehren ebenfalls nur zu den Paketen, nie auf die Detailseite. Die
Seiten sind zudem auf `noindex` gesetzt - bezahlte Inhalte gehoeren nicht in
den Suchindex.

### Kurszonen

Die vier Grenzen im Admin-Formular trennen die fuenf Signalbereiche, von
unten nach oben. Beispiel bei einem Kurs von 186 EUR:

| Feld | Wert | bedeutet |
|---|---|---|
| Starker Einstieg bis | 149 | darunter: starker Einstiegsbereich |
| Einstieg bis | 177 | 149 bis 177 |
| Neutral bis | 205 | 177 bis 205 |
| Ausstieg bis | 233 | 205 bis 233, darueber starker Ausstieg |

Die Werte werden **nicht berechnet**. Sie sind eine Einschaetzung des
Erstellers; aus Kurs und Kursziel liesse sich so etwas nicht seriöes
ableiten. Bleiben die Felder leer oder sind sie nicht aufsteigend, zeigt
die Detailansicht schlicht keinen Balken - alles andere bleibt sichtbar.

### Szenarien (Best / Base / Worst Case)

Darueber steht auf der Detailseite ein Szenario-Diagramm: drei Linien, die
vom heutigen Kurs zu den drei Kurszielen laufen, darunter die drei Faelle
im Einzelnen mit Wahrscheinlichkeit und Begruendung.

Im Admin-Formular ist das ein eigener Block mit drei Spalten:

| Spalte | Felder |
|---|---|
| Best Case | Kursziel, Wahrsch. %, kurze Begruendung |
| Base Case | Kursziel, Wahrsch. %, kurze Begruendung |
| Worst Case | Kursziel, Wahrsch. %, kurze Begruendung |

Dazu ein Feld fuer den gemeinsamen Zeithorizont (z.B. "12 Monate").
Zahlen aendern, speichern, fertig - das Diagramm zeichnet sich neu.

Auch diese Werte werden **nicht berechnet**, sondern eingetragen. Das
Diagramm erscheint nur, wenn alle drei Kursziele gefuellt sind; sonst
waere die Projektion unvollstaendig. Die Wahrscheinlichkeiten sind
optional, sollten zusammen aber 100 ergeben.

Die geraden Linien sind Absicht: ein geschwungener Verlauf wuerde einen
Kursweg behaupten, den niemand prognostiziert hat. Dargestellt ist nur,
wo die Reise in drei Faellen endet. Ein entsprechender Hinweis steht
unter dem Diagramm.

### Datenbank nachziehen

Bei einer bereits angelegten Supabase-Datenbank einmalig im SQL Editor
ausfuehren (steht auch am Ende von `supabase-schema.sql`):

```sql
alter table public.analyses
  add column if not exists zone_strong_entry_to numeric(14,4),
  add column if not exists zone_entry_to        numeric(14,4),
  add column if not exists zone_neutral_to      numeric(14,4),
  add column if not exists zone_exit_to         numeric(14,4);

alter table public.analyses
  add column if not exists scenario_horizon           text default '',
  add column if not exists scenario_best_price        numeric(14,4),
  add column if not exists scenario_best_probability  numeric(5,2),
  add column if not exists scenario_best_note         text default '',
  add column if not exists scenario_base_price        numeric(14,4),
  add column if not exists scenario_base_probability  numeric(5,2),
  add column if not exists scenario_base_note         text default '',
  add column if not exists scenario_worst_price       numeric(14,4),
  add column if not exists scenario_worst_probability numeric(5,2),
  add column if not exists scenario_worst_note        text default '';
```

---

## 6d. Bestellung, Vertrags-E-Mails, Kündigung und Widerruf

### Ablauf

1. **Bestellübersicht** (`/bestellen`): Paket, Preis, Laufzeit und Kündigung
   stehen direkt über dem Knopf. Der Kunde gibt Name und E-Mail-Adresse an und
   setzt das Pflicht-Häkchen zum sofortigen Beginn (§ 356 Abs. 5 BGB). Der
   Knopf heißt „Zahlungspflichtig bestellen“ (§ 312j Abs. 3 BGB).
2. **Eingangsbestätigung** per E-Mail, sofort nach dem Klick (§ 312i BGB) —
   noch keine Annahme. AGB und Widerrufsbelehrung hängen als PDF an.
3. Weiterleitung zu **Stripe**; dort hinterlegt der Kunde das Zahlungsmittel.
4. Nach erfolgreicher Zahlung: Freischaltung und **Vertragsbestätigung** per
   E-Mail (Webhook `checkout.session.completed`) mit allen Vertragsdaten, der
   Dokumentation der Zustimmung (§ 312f Abs. 3 BGB) und beiden PDFs. Erst mit
   dieser Bestätigung erlischt das Widerrufsrecht. **Ohne funktionierenden
   Webhook und Mailversand bleibt es bestehen** — beides muss eingerichtet sein.

5. Rückkehr auf `/willkommen/zahlung`: Die Seite gleicht die Bestellung ab und
   bietet beim ersten Mal das Passwort-Vergeben an (siehe 6e).

Bestellnummer, Zustimmungszeitpunkt und Stand der Rechtstexte stehen als
Metadaten an der Zahlung und am Abo in Stripe.

### Kündigung und Widerruf

- **„Verträge hier kündigen“** (`/kuendigen`, Pflicht nach § 312k BGB) und
  **„Vertrag hier widerrufen“** (`/widerrufen`, elektronische Widerrufsfunktion)
  stehen im Fuß jeder Seite und im Kundenkonto — beide ohne Anmeldung.
- Nach dem Absenden sieht der Kunde eine Bestätigung zum Drucken bzw.
  Speichern und erhält sofort eine E-Mail mit Inhalt, Datum und Uhrzeit des
  Eingangs und dem Vertragsende.
- Ordentliche Kündigungen zum nächstmöglichen Termin trägt die Seite selbst bei
  Stripe ein. Außerordentliche Kündigungen, spätere Wunschtermine und Fälle
  ohne zuordenbares Abo gehen als Meldung an `MAIL_NOTIFY` zur Bearbeitung.
- Widerrufe bestätigt die Seite sofort; entschieden wird von Hand. Die Meldung
  an `MAIL_NOTIFY` nennt, ob Zustimmung und Vertragsbestätigung dokumentiert
  sind.
- Kündigungen aus dem Stripe-Kundenportal bestätigt der Webhook ebenfalls.

### E-Mail-Versand einrichten

Die Mails gehen per **SMTP** raus — über den Mail-Anbieter der eigenen Domain
(z. B. IONOS, Strato, Google Workspace) oder einen Versanddienst (Brevo,
Postmark, Amazon SES, Resend). Variablen in Vercel setzen:

| Variable | Bedeutung |
|---|---|
| `SMTP_HOST`, `SMTP_PORT` | Server und Port (meist 587, bei SSL 465) |
| `SMTP_USER`, `SMTP_PASS` | Zugangsdaten |
| `MAIL_FROM` | Absender, z. B. `PAX Solutions <kontakt@deine-domain.de>` |
| `MAIL_REPLY_TO` | Antwortadresse (Standard: Firmen-E-Mail) |
| `MAIL_NOTIFY` | Postfach für interne Meldungen (Standard: Firmen-E-Mail) |
| `MAIL_BCC` | optional: Archiv-Postfach, erhält eine Kopie jeder Kundenmail |

Für gute Zustellbarkeit beim Anbieter SPF und DKIM für die Absenderdomain
einrichten. Ohne `SMTP_HOST` landen die Mails lokal als `.eml` und `.html` in
`data/outbox/` (zum Ansehen); auf dem Server wird dann nur gewarnt.

### Texte ändern

| Was | Wo |
|---|---|
| AGB | `src/lib/legal/agb.ts` |
| Widerrufsbelehrung, Muster-Formular | `src/lib/legal/widerruf.ts` (Muster-Wortlaut nicht umformulieren) |
| Zustimmungstext, Laufzeiten, Stand | `src/lib/legal/vertrag.ts` |
| E-Mails | `src/lib/mail/vorlagen.ts` |

Website, PDFs und E-Mails lesen aus diesen Dateien — sie können nicht
auseinanderlaufen. Bei inhaltlichen Änderungen `RECHTSTEXTE_STAND` anpassen.
Die PDFs gibt es auch unter `/agb/pdf` und `/widerruf/pdf`.

---

## 6e. Sicherheit

- **Passwort nur mit Nachweis** (`src/lib/zugang.ts`): Das erste Passwort nach
  dem Checkout setzt nur, wer von einer abgeschlossenen Stripe-Session kommt
  und solange das Konto noch keins hat. Sonst gibt es einen Link per E-Mail
  (`/willkommen` → „Link anfordern“), eine Stunde gültig und einmalig. Der
  Nachweis liegt in einem httpOnly-Cookie, nie in der URL.
- **Drosselung**: Anmeldung (je Gerät und Adresse), Admin-Anmeldung,
  Link-Anforderung, Kündigung, Widerruf und Chat. Die Zähler liegen je
  Serverinstanz im Speicher; harte Grenzen setzt die Vercel-Firewall.
- **Sitzungen**: signiert (HS256, `AUTH_SECRET`), httpOnly; Kunden 30 Tage,
  Admin 12 Stunden.
- **Kündigungsquittung** zeigt nur die eigenen Angaben; Paket und Vertragsende
  gehen per E-Mail an die Vertragsadresse.
- **Stripe-Webhook** prüft die Signatur und liest den Abo-Stand frisch bei
  Stripe (Events kommen nicht immer in Reihenfolge).
- **Header** (`next.config.ts`): CSP-Grundregeln, `X-Frame-Options`,
  `Permissions-Policy`, `Cross-Origin-Opener-Policy`; HSTS setzt Vercel.
- **Abhängigkeiten**: `npm audit` vor jedem Livegang; Updates erst nach einigen
  Tagen übernehmen (Schutz vor frisch kompromittierten Paketen).

---

## 7. Rechtliches — bitte lesen

Die Seite enthält Entwürfe für Impressum, Haftungsausschluss,
Datenschutzerklärung, AGB und Widerrufsbelehrung. Der Haftungsausschluss
enthält:

- Hinweis, dass **keine individuelle Anlageberatung** vorliegt
- Hinweis auf die **allgemeinen Risiken** von Wertpapiergeschäften inkl.
  Totalverlustrisiko
- Hinweis, dass PAX Solutions und ihre Mitarbeiter **Anteile an besprochenen
  Unternehmen halten** können
- Haftungsausschluss und Nutzungsrechte

Der kurze Risikohinweis steht zusätzlich in der Fußzeile jeder Seite. Jede
Analyse nennt Ersteller und Erstellungsdatum.

AGB, Widerrufsbelehrung und die Vertrags-E-Mails sind auf ein Abonnement
digitaler Inhalte für Verbraucher ausgelegt (Abschnitt 6d). Für korrekte
Pflichtangaben müssen die Firmendaten (`NEXT_PUBLIC_COMPANY_…`) stimmen;
`NEXT_PUBLIC_COMPANY_NAME` muss die vollständige Firma samt Rechtsform enthalten
(z. B. „PAX Solutions GmbH“).

**Diese Texte sind Vorlagen und keine Rechtsberatung.** Sie müssen vor dem
Livegang anwaltlich geprüft und an den tatsächlichen Geschäftsbetrieb angepasst
werden — insbesondere die mit `[Platzhalter …]` markierten Stellen.

Auf allen Rechtsseiten erscheint dazu ein Hinweiskasten. Nach der Prüfung
`NEXT_PUBLIC_LEGAL_REVIEWED=true` setzen, um ihn auszublenden.

---

## 8. Projektstruktur

```
src/
  app/
    page.tsx                  Startseite
    analysen/                 Analysenübersicht (Paywall)
    preise/                   Pakete + FAQ
    methodik/                 Beschreibung des Vorgehens
    login/ willkommen/ konto/ Kundenbereich
    bestellen/                Bestellübersicht (Button-Lösung, Zustimmung)
    kuendigen/ widerrufen/    Kündigungs- und Widerrufsschaltfläche
    admin/                    Verwaltung (Login, Liste, Anlegen, Bearbeiten)
    api/stripe/webhook/       Abo-Status, Vertragsbestätigung, Erstattung
    impressum/ haftungsausschluss/ datenschutz/ agb/ widerruf/
    agb/pdf/ widerruf/pdf/    Rechtstexte als PDF
  components/                 Karten, Formulare, Navigation
  lib/
    config.ts                 Pakete, Preise, Signalstufen, Firmendaten
    db.ts                     Datenschicht (Supabase oder lokale JSON-Datei)
    auth.ts                   Passwort-Hashing und Sitzungen
    stripe.ts                 Stripe-Hilfsfunktionen
    abo.ts                    Vertragsbestätigung, Kündigung, Widerruf, Erstattung
    legal/                    AGB, Widerrufsbelehrung, Vertragsbausteine
    mail/                     SMTP-Versand und E-Mail-Vorlagen
    pdf/                      PDF-Satz der Rechtstexte (mit Markenschriften)
    actions/                  Server Actions (Auth, Analysen, Abrechnung, Bestellung, Vertrag)
data/seed.json                Beispielanalysen
supabase-schema.sql           Datenbankschema
```

## 9. Anpassungen

| Was | Wo |
|---|---|
| Markenname, Claim | `src/lib/config.ts` → `BRAND` |
| Firmendaten im Impressum | Umgebungsvariablen `NEXT_PUBLIC_COMPANY_…` |
| Preise, Paketumfang | `src/lib/config.ts` → `PLANS` |
| Farben, Typografie | `src/app/globals.css` |
| Signalstufen und Farbcode | `src/lib/config.ts` → `SIGNALS` |
