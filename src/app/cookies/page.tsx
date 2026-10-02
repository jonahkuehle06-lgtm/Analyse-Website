import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { LegalSection } from "@/components/LegalPage";
import { COMPANY } from "@/lib/config";
import { gtmId } from "@/components/GoogleTagManager";

export const metadata: Metadata = {
  title: "Cookies",
  description:
    "Welche Cookies diese Website setzt, wozu sie dienen und wie sie sich löschen lassen.",
};

const COOKIES = [
  {
    name: "ma_session",
    purpose:
      "Hält die Anmeldung im Kundenbereich aufrecht. Enthält ausschließlich eine kryptografisch signierte Kennung des Kontos — keine persönlichen Daten, keine Zahlungsdaten.",
    duration: "30 Tage",
    when: "Erst nach dem Anmelden.",
  },
  {
    name: "ma_admin",
    purpose:
      "Hält die Anmeldung im Verwaltungsbereich des Betreibers aufrecht. Funktioniert technisch wie das Sitzungs-Cookie des Kundenbereichs.",
    duration: "30 Tage",
    when: "Nur beim Betreiber, nie bei Besuchern der Website.",
  },
];

export default function CookiesPage() {
  // Der Text richtet sich danach, ob tatsaechlich ein Tag Manager eingebunden
  // ist - sonst wuerde die Seite etwas behaupten, das nicht stimmt.
  const tagManagerActive = Boolean(gtmId());

  return (
    <LegalPage
      eyebrow="Transparenz"
      title="Cookie-Hinweise"
      intro={
        tagManagerActive
          ? "Diese Website setzt zwei technisch notwendige Cookies. Zusätzlich ist ein Tag Manager eingebunden, der weitere Dienste nachladen kann — aber erst nach Ihrer Einwilligung."
          : "Diese Website kommt mit zwei Cookies aus. Beide sind technisch notwendig, keines dient der Analyse oder Werbung."
      }
    >
      <LegalSection title="Was Cookies sind">
        <p>
          Cookies sind kleine Textdateien, die eine Website im Browser ablegt und beim
          nächsten Aufruf wieder auslesen kann. Sie werden unter anderem gebraucht, damit
          eine Seite wiedererkennt, dass man bereits angemeldet ist — ohne sie müsste man
          sich bei jedem Klick erneut einloggen.
        </p>
      </LegalSection>

      <LegalSection title="Welche Cookies wir setzen">
        {/* Am Telefon gestapelt, ab Tablet als Tabelle - sonst liegt die
            Spalte "Dauer" ausserhalb des Bildschirms. */}
        <div className="space-y-4 sm:hidden">
          {COOKIES.map((cookie) => (
            <div
              key={cookie.name}
              className="rounded-xl border border-[var(--color-line)] bg-[rgba(255,255,255,0.02)] p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <code className="text-[0.8125rem] text-[var(--color-platinum)]">
                  {cookie.name}
                </code>
                <span className="text-[0.75rem] whitespace-nowrap text-[var(--color-mist)]">
                  {cookie.duration}
                </span>
              </div>
              <p className="mt-2.5 text-[0.8125rem] leading-relaxed">{cookie.purpose}</p>
              <p className="mt-1.5 text-[0.75rem] text-[#6b7179]">{cookie.when}</p>
            </div>
          ))}
        </div>

        <table className="hidden w-full border-collapse text-left text-[0.8125rem] sm:table">
          <thead>
            <tr className="border-b border-[var(--color-line)]">
              <th className="py-3 pr-4 font-medium text-[var(--color-platinum)]">Name</th>
              <th className="py-3 pr-4 font-medium text-[var(--color-platinum)]">Zweck</th>
              <th className="py-3 font-medium text-[var(--color-platinum)]">Dauer</th>
            </tr>
          </thead>
          <tbody>
            {COOKIES.map((cookie) => (
              <tr key={cookie.name} className="border-b border-[var(--color-line)]">
                <td className="py-4 pr-4 align-top">
                  <code className="text-[var(--color-platinum)]">{cookie.name}</code>
                </td>
                <td className="py-4 pr-4 align-top leading-relaxed">
                  {cookie.purpose}
                  <span className="mt-1.5 block text-[#6b7179]">{cookie.when}</span>
                </td>
                <td className="py-4 align-top whitespace-nowrap">{cookie.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Beide Cookies sind als <em>HttpOnly</em> gesetzt — JavaScript im Browser kann sie
          also nicht auslesen — und werden über eine verschlüsselte Verbindung übertragen.
          Mit der Abmeldung werden sie gelöscht.
        </p>
      </LegalSection>

      {tagManagerActive ? (
        <LegalSection title="Google Tag Manager und Einwilligung">
          <p>
            Auf dieser Website ist der Google Tag Manager der Google Ireland Limited
            eingebunden. Er lädt selbst keine Messdaten, sondern verwaltet, welche
            weiteren Dienste geladen werden dürfen.
          </p>
          <p>
            Der Tag Manager läuft mit dem Google Consent Mode v2 und der Voreinstellung{" "}
            <strong>abgelehnt</strong>: Solange Sie nicht einwilligen, werden keine Cookies
            für Reichweitenmessung, Statistik, Profilbildung oder Werbung gesetzt und keine
            entsprechenden Daten übertragen. Rechtsgrundlage für eine Einwilligung wäre
            § 25 Abs. 1 TDDDG i.V.m. Art. 6 Abs. 1 lit. a DSGVO.
          </p>
          <p>
            Beim ersten Besuch werden Sie um eine Entscheidung gebeten. Ablehnen ist
            dabei genauso einfach wie Zustimmen, und keine Auswahl ist vorangekreuzt. Sie
            können Ihre Entscheidung jederzeit über „Cookie-Einstellungen" in der Fußzeile
            ändern oder vollständig widerrufen (Art. 7 Abs. 3 DSGVO).
          </p>
          <p>
            Ihre Entscheidung wird unter dem Schlüssel <code>pax_consent</code> lokal in
            Ihrem Browser gespeichert, damit sie beim nächsten Besuch nicht erneut
            abgefragt werden muss. Diese Speicherung dient allein der Umsetzung Ihrer Wahl
            und wird nicht übertragen; löschen Sie die Browserdaten, ist sie entfernt.
          </p>
          <p>
            [Platzhalter — sobald konkrete Dienste über den Tag Manager eingebunden werden
            (etwa Google Analytics oder Werbe-Tags), sind sie hier einzeln mit Zweck,
            Anbieter, Speicherdauer und etwaiger Drittlandsübermittlung aufzuführen. Diese
            Angaben sind zusammen mit dem Einwilligungsfenster zu ergänzen.]
          </p>
        </LegalSection>
      ) : (
        <LegalSection title="Warum es keinen Cookie-Banner gibt">
          <p>
            Eine Einwilligung ist nach § 25 Abs. 2 Nr. 2 TDDDG entbehrlich, wenn die
            Speicherung unbedingt erforderlich ist, damit ein vom Nutzer ausdrücklich
            gewünschter Dienst bereitgestellt werden kann. Genau das trifft auf beide
            Cookies zu: Ohne sie lässt sich der kostenpflichtige Bereich nicht nutzen.
          </p>
          <p>
            Wir setzen <strong>keine</strong> Cookies für Reichweitenmessung, Statistik,
            Profilbildung, Wiedererkennung über mehrere Websites hinweg oder Werbung. Es
            sind keine Dienste wie Google Analytics, Meta-Pixel oder vergleichbare
            Werkzeuge eingebunden, und es werden keine Skripte Dritter geladen. Deshalb
            erscheint beim Aufruf dieser Seite kein Einwilligungsfenster.
          </p>
        </LegalSection>
      )}

      <LegalSection title="Zahlungsabwicklung über Stripe">
        <p>
          Für den Bezahlvorgang leiten wir auf eine Seite der Stripe Payments Europe, Ltd.
          weiter. Stripe setzt dort eigene Cookies, unter anderem zur Betrugsprävention.
          Diese liegen auf der Domain von Stripe, nicht auf unserer, und unterliegen den
          Bestimmungen von Stripe. Einzelheiten:{" "}
          <a
            href="https://stripe.com/de/privacy"
            className="underline underline-offset-2"
            rel="noopener noreferrer"
            target="_blank"
          >
            stripe.com/de/privacy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Cookies löschen oder blockieren">
        <p>
          Sie können Cookies jederzeit im Browser löschen oder deren Speicherung
          einschränken. Die Einstellung findet sich üblicherweise unter „Einstellungen →
          Datenschutz und Sicherheit". Blockieren Sie die hier beschriebenen Cookies,
          können Sie sich nicht mehr anmelden und die gebuchten Inhalte nicht aufrufen —
          die übrigen Seiten bleiben uneingeschränkt nutzbar.
        </p>
      </LegalSection>

      <LegalSection title="Änderungen">
        <p>
          Sollten künftig weitere Cookies oder Dienste hinzukommen, die eine Einwilligung
          erfordern, wird diese Seite aktualisiert und eine Einwilligung vor dem Setzen
          eingeholt. Stand dieser Hinweise:{" "}
          {new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date())}.
        </p>
        <p>
          Weitere Informationen zur Verarbeitung personenbezogener Daten finden Sie in der{" "}
          <Link href="/datenschutz" className="underline underline-offset-2">
            Datenschutzerklärung
          </Link>
          . Bei Fragen erreichen Sie uns unter{" "}
          <a href={`mailto:${COMPANY.email}`} className="underline underline-offset-2">
            {COMPANY.email}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
