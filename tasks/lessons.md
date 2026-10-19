# Lessons

Rules learned from user corrections. Add one entry per pattern:
what went wrong, and the rule that prevents it.

<!-- Example:
- **Pattern:** …
  **Rule:** …
-->

- **Pattern:** Commits mit Autor „Claude“ wurden von Vercel nicht gebaut.
  **Rule:** Immer als Jonah Kuehle committen (Git-Config des Repos); ein Commit eines anderen Autors oben auf einem Branch wird nicht deployt.
- **Pattern:** Änderungen sollten nicht ungefragt live gehen („Lösch nichts an der aktuellen Version … zeig es mir, ich bestätige es dann“).
  **Rule:** Arbeit auf dem Arbeitsbranch zeigen (Bilder, Vorschau); `main` erst nach ausdrücklichem „passt“ aktualisieren.
- **Pattern:** Rechtliche Aussagen (§ 85 WpHG, MAR, BaFin) standen ungeprüft auf der Seite; der Nutzer ließ sie entfernen.
  **Rule:** Keine regulatorischen Behauptungen in Texte schreiben, die der Nutzer nicht bestätigt hat; Rechtstexte immer als prüfbedürftige Vorlage kennzeichnen.
- **Pattern:** Eine Überschrift nannte eine konkrete Anzahl („19 weitere Analysen freischalten“); der Nutzer wollte nur „Weitere Analysen freischalten“.
  **Rule:** Keine dynamischen Zahlen in Verkaufs-Überschriften, sofern nicht ausdrücklich gewünscht.
- **Pattern:** Texte, Logik und Daten wurden im Redesign nur mit Rückfrage geändert – das war gewünscht.
  **Rule:** Bestehende Texte und Logik nicht ohne Rückfrage ändern; neue Texte im Bericht zur Freigabe auflisten.
- **Pattern:** Rabatt stand als „−2 Monate“ im Umschalter; der Nutzer wollte „2 Monate gratis“.
  **Rule:** Vorteile positiv formulieren („X Monate gratis“), keine Minuszeichen in Verkaufs-Etiketten.
- **Pattern:** Seite war am PC zu schmal (Inhalt auf 1200 px begrenzt).
  **Rule:** Layout füllt die PC-Breite (Rahmen bis 1920 px, mitwachsende Ränder); keine schmale Mittelspalte.
- **Pattern:** Dekor (Pluszeichen-Raster, Kreuze) wurde als störend empfunden, die Taube als Wasserzeichen war unsichtbar.
  **Rule:** Dekor sparsam und erkennbar: auf Schwarz mindestens ~12 % Deckkraft, ganze Form statt Fragment; im Zweifel weglassen.
- **Pattern:** Ecken waren zu eckig (2 px).
  **Rule:** Radien nach dem Canva-Beispiel: Karten 16 px, Felder 12 px, Knöpfe, Filter und Etiketten als Pille – auch in neuen Bausteinen.
