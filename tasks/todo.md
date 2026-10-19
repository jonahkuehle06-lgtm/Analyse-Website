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
