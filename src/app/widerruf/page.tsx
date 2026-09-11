import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/LegalPage";
import { COMPANY } from "@/lib/config";

export const metadata: Metadata = {
  title: "Widerrufsbelehrung",
  description: "Widerrufsrecht für Verbraucher bei digitalen Inhalten.",
};

export default function WiderrufPage() {
  return (
    <LegalPage
      eyebrow="Verbraucherrechte"
      title="Widerrufsbelehrung"
      intro="Für Verbraucher im Sinne des § 13 BGB gilt das folgende Widerrufsrecht."
    >
      <LegalSection title="Widerrufsrecht">
        <p>
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag
          zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des
          Vertragsschlusses.
        </p>
        <p>
          Um Ihr Widerrufsrecht auszuüben, müssen Sie uns ({COMPANY.name},{" "}
          {COMPANY.street}, {COMPANY.city}, E-Mail: {COMPANY.email}, Telefon:{" "}
          {COMPANY.phone}) mittels einer eindeutigen Erklärung (z. B. ein mit der Post
          versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu
          widerrufen, informieren. Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie
          die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist
          absenden.
        </p>
      </LegalSection>

      <LegalSection title="Folgen des Widerrufs">
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von
          Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem
          Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf bei uns eingegangen
          ist. Für die Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der
          ursprünglichen Transaktion eingesetzt haben; Entgelte werden Ihnen wegen dieser
          Rückzahlung nicht berechnet.
        </p>
      </LegalSection>

      <LegalSection title="Vorzeitiges Erlöschen des Widerrufsrechts">
        <p>
          Bei Verträgen über die Bereitstellung digitaler Inhalte, die nicht auf einem
          körperlichen Datenträger geliefert werden, erlischt das Widerrufsrecht gemäß
          § 356 Abs. 5 BGB, wenn Sie ausdrücklich zugestimmt haben, dass wir mit der
          Ausführung des Vertrags vor Ablauf der Widerrufsfrist beginnen, Sie Ihre Kenntnis
          davon bestätigt haben, dass Sie durch Ihre Zustimmung mit Beginn der Ausführung
          des Vertrags Ihr Widerrufsrecht verlieren, und wir Ihnen eine Bestätigung
          hierüber zur Verfügung gestellt haben.
        </p>
        <p>
          [Platzhalter — im Bezahlvorgang ist eine entsprechende ausdrückliche Zustimmung
          einzuholen und zu dokumentieren, sofern der Zugang sofort freigeschaltet werden
          soll. Bitte anwaltlich prüfen lassen.]
        </p>
      </LegalSection>

      <LegalSection title="Muster-Widerrufsformular">
        <p className="whitespace-pre-line rounded-xl border border-[var(--color-line)] bg-[rgba(255,255,255,0.02)] p-5 text-[0.8125rem]">
{`An ${COMPANY.name}, ${COMPANY.street}, ${COMPANY.city}, E-Mail: ${COMPANY.email}

Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf
der folgenden Waren (*) / die Erbringung der folgenden Dienstleistung (*)

Bestellt am (*) / erhalten am (*): ______________________
Name des/der Verbraucher(s): ______________________
Anschrift des/der Verbraucher(s): ______________________
Unterschrift (nur bei Mitteilung auf Papier): ______________________
Datum: ______________________

(*) Unzutreffendes streichen.`}
        </p>
      </LegalSection>
    </LegalPage>
  );
}
