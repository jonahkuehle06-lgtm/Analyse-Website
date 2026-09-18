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
lokalen JSON-Datei auf Supabase um.

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

Unter *Einstellungen → Billing → Kundenportal* aktivieren. Darüber kündigen
Kunden ihr Abo selbst und laden Rechnungen herunter — die Seite verlinkt es im
Kundenkonto.

---

## 4. Abo-Modell

Vorgeschlagen und umgesetzt ist ein **Abonnement mit monatlicher oder jährlicher
Abrechnung**; bei jährlicher Zahlung entfallen zwei Monatsbeiträge.

| Paket | Analysen | monatlich | jährlich |
|---|---:|---:|---:|
| Basic | 10 | 29 € | 290 € |
| Black | 25 | 59 € | 590 € |
| Platin | 50 | 99 € | 990 € |

Freigeschaltet werden immer die **aktuellsten** Analysen des Bestands. Erscheint
eine neue Analyse, rückt sie automatisch in den Zugang aller Kunden nach.

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
- Ersteller und Offenlegung möglicher Interessenkonflikte (Pflichtangaben)

---

## 7. Rechtliches — bitte lesen

Die Seite enthält Entwürfe für Impressum, Haftungsausschluss,
Datenschutzerklärung, AGB und Widerrufsbelehrung. Der Haftungsausschluss
berücksichtigt insbesondere:

- Kennzeichnung als **entgeltliche Anlageempfehlung** (§ 85 WpHG i.V.m.
  Art. 20 MAR, Delegierte Verordnung (EU) 2016/958) mit Ersteller und Datum —
  sowohl seitenweit als auch auf jeder einzelnen Analyse-Karte
- Hinweis, dass **keine individuelle Anlageberatung** vorliegt
- Hinweis auf die **allgemeinen Risiken** von Wertpapiergeschäften inkl.
  Totalverlustrisiko
- **Platzhalter für die Offenlegung von Interessenkonflikten** — allgemein auf
  der Disclaimer-Seite und je Analyse als eigenes Feld

**Diese Texte sind Vorlagen und keine Rechtsberatung.** Sie müssen vor dem
Livegang anwaltlich geprüft und an den tatsächlichen Geschäftsbetrieb angepasst
werden — insbesondere die mit `[Platzhalter …]` markierten Stellen und die Frage
einer etwaigen Erlaubnispflicht nach KWG/WpIG.

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
    admin/                    Verwaltung (Login, Liste, Anlegen, Bearbeiten)
    api/checkout/             Stripe-Checkout starten
    api/stripe/webhook/       Abo-Status synchronisieren
    impressum/ haftungsausschluss/ datenschutz/ agb/ widerruf/
  components/                 Karten, Formulare, Navigation
  lib/
    config.ts                 Pakete, Preise, Signalstufen, Firmendaten
    db.ts                     Datenschicht (Supabase oder lokale JSON-Datei)
    auth.ts                   Passwort-Hashing und Sitzungen
    stripe.ts                 Stripe-Hilfsfunktionen
    actions/                  Server Actions (Auth, Analysen, Abrechnung)
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
