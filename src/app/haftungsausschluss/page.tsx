import type { Metadata } from "next";
import Link from "next/link";
import LegalReviewNote from "@/components/LegalReviewNote";
import Wordmark from "@/components/Wordmark";
import { BRAND, COMPANY } from "@/lib/config";

export const metadata: Metadata = {
  title: "Haftungsausschluss",
  description:
    "Risikohinweise, Kennzeichnung als Anlageempfehlung und Offenlegung möglicher Interessenkonflikte.",
};

const PARAGRAPHS: { heading?: string; body: React.ReactNode }[] = [
  {
    heading: "Kennzeichnung als Anlageempfehlung",
    body: (
      <>
        Bei sämtlichen auf dieser Website veröffentlichten Analysen, Berichten,
        Handelsanregungen und Publikationen handelt es sich um{" "}
        <strong>entgeltliche, öffentlich zugängliche Anlageempfehlungen</strong> im Sinne
        des § 85 WpHG i.V.m. Art. 20 der Verordnung (EU) Nr. 596/2014
        (Marktmissbrauchsverordnung) und der Delegierten Verordnung (EU) 2016/958. Jede
        einzelne Analyse weist den <strong>Ersteller der Empfehlung</strong> (Name und
        Funktion) sowie das <strong>Datum ihrer Erstellung</strong> unmittelbar auf der
        jeweiligen Karte aus. Die zum Ausdruck gebrachten Meinungen geben ausschließlich
        die Einschätzung zum angegebenen Zeitpunkt wieder und können sich jederzeit ohne
        vorherige Ankündigung ändern.
      </>
    ),
  },
  {
    heading: "Keine individuelle Anlageberatung",
    body: (
      <>
        Die bereitgestellten Informationen dienen ausschließlich der allgemeinen
        Information und stellen weder eine Anlageberatung noch eine konkrete Empfehlung
        zum Kauf, Verkauf oder Halten von Finanzinstrumenten oder Kryptowerten noch eine
        Empfehlung zu einer bestimmten Anlagestrategie dar. Sie können keine individuelle,
        speziell auf die persönlichen und finanziellen Verhältnisse des Nutzers bzw.
        Abonnenten zugeschnittene Beratung durch qualifizierte Anlage-, Vermögens- oder
        Steuerberater ersetzen. Dies gilt insbesondere auch dann, wenn einzelne Emittenten,
        Wertpapiere, Derivate oder Handelsplattformen erwähnt oder besprochen werden.
        Abonnenten und Leser, die aufgrund der veröffentlichten Inhalte
        Anlageentscheidungen treffen bzw. Transaktionen durchführen, handeln in vollem
        Umfang auf eigene Gefahr und auf eigenes Risiko.
      </>
    ),
  },
  {
    heading: "Allgemeine Risiken von Wertpapiergeschäften",
    body: (
      <>
        Investitionen am Kapitalmarkt bzw. in Finanzinstrumente (z. B. Aktien, Anleihen,
        Wertpapiere, Derivate) und Kryptowerte sind mit Risiken behaftet —{" "}
        <strong>einschließlich des Risikos eines Totalverlusts des eingesetzten
        Kapitals</strong>. Vergangene Wertentwicklungen sind kein verlässlicher Indikator
        für künftige Ergebnisse. Speziell der Handel mit Optionsscheinen, Futures, sog.
        Hebelprodukten, CFDs („Contracts for Difference“ – finanzielle
        Differenzkontrakte) oder anderen Derivaten birgt erhebliche Risiken, einschließlich
        des Totalverlustrisikos des eingesetzten Kapitals und sogar möglicher darüber
        hinausgehender Verluste. Entsprechende Geschäfte setzen daher vertiefte Kenntnisse
        in Bezug auf diese Finanzprodukte, die Finanzmärkte, Handelstechniken und
        -strategien voraus. Nutzer sollten bei allen Investitionen überlegen, ob sie
        verstehen, wie die jeweiligen Instrumente und Strategien funktionieren, und ob sie
        es sich leisten können, das Risiko einzugehen, Geld zu verlieren.
      </>
    ),
  },
  {
    heading: "Offenlegung möglicher Interessenkonflikte",
    body: (
      <>
        [Platzhalter — bitte vor dem Livegang durch die tatsächlichen Verhältnisse
        ersetzen und anwaltlich prüfen lassen:] Geschäftsführung und Mitarbeiter von{" "}
        {COMPANY.name} können zum Zeitpunkt der Veröffentlichung Anteile an
        Finanzinstrumenten bzw. Kryptowerten halten, welche auf dieser Website und in den
        Publikationen im Rahmen einer Chart- oder Marktanalyse besprochen werden. Etwaige
        Beteiligungen, Vergütungen durch Emittenten, Auftragsverhältnisse oder sonstige
        Umstände, die einen Interessenkonflikt begründen können, werden{" "}
        <strong>bei der jeweiligen Analyse gesondert ausgewiesen</strong>. Bestehen im
        Einzelfall keine Interessenkonflikte, wird dies dort ebenfalls angegeben. Darüber
        hinaus bestehen zum Zeitpunkt der Veröffentlichung folgende allgemeine
        Interessenkonflikte: [Platzhalter — z. B. Eigenpositionen, Market-Making,
        Beteiligungen &gt; 0,5 %, Vergütungsvereinbarungen, sonstige Geschäftsbeziehungen].
      </>
    ),
  },
  {
    heading: "Haftung",
    body: (
      <>
        {COMPANY.name} übernimmt keinerlei Haftung für die bereitgestellten Analysen,
        Berichte, Handelsanregungen, Publikationen und Informationen. Analysen und
        anderweitige Informationen stellen in keiner Weise einen Aufruf oder eine
        Aufforderung zur individuellen oder allgemeinen Nachbildung dar, auch nicht
        stillschweigend. Eine Haftung für mittelbare und unmittelbare Folgen der
        vermittelten und bereitgestellten Inhalte ist ausgeschlossen. Die Redaktion bzw.
        die Autoren beziehen ihre Informationen aus Quellen und Ressourcen, die sie als
        vertrauenswürdig erachten. Eine Gewähr hinsichtlich Qualität, Korrektheit und
        Wahrheitsgehalt dieser Informationen, Interpretationen und Berechnungen kann und
        wird jedoch nicht übernommen.
      </>
    ),
  },
  {
    heading: "Nutzungsrechte",
    body: (
      <>
        Die Anmeldung auf dieser Website oder ein Abonnement der Publikationen von{" "}
        {COMPANY.name} beinhaltet keine Genehmigung zur Kopie, Vervielfältigung oder
        Weitergabe an unbefugte Dritte. Sofern nicht anders ausgewiesen oder gekennzeichnet,
        liegen alle Rechte an den enthaltenen Aussagen bei {COMPANY.name}. Jeglicher
        registrierte Verstoß wird geahndet.
      </>
    ),
  },
  {
    heading: "Verantwortlich für die Erstellung der Publikation",
    body: (
      <>
        {COMPANY.name}, {COMPANY.street}, {COMPANY.city}, {COMPANY.country}. An der
        Erstellung der Publikationen Beteiligte: [Platzhalter — Namen und Funktionen aller
        beteiligten Personen eintragen]. Der jeweils verantwortliche Ersteller wird
        zusätzlich bei jeder einzelnen Analyse genannt.
      </>
    ),
  },
];

export default function HaftungsausschlussPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
      <LegalReviewNote />

      {/* Tafel im Stil klassischer Disclaimer-Seiten */}
      <article
        className="relative overflow-hidden border border-[var(--color-line)] bg-[#0b0d11] px-6 py-10 sm:px-12 sm:py-14"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <div
          className="aura"
          style={{
            width: 520,
            height: 520,
            top: -260,
            right: -180,
            background:
              "radial-gradient(circle, rgba(160,170,185,0.13) 0%, rgba(0,0,0,0) 70%)",
          }}
          aria-hidden="true"
        />

        <header className="relative flex flex-wrap items-start justify-between gap-6 border-b border-[var(--color-line)] pb-8">
          <h1 className="text-3xl font-bold uppercase leading-tight tracking-tight text-white sm:text-5xl">
            Hinweis
            <br />
            Haftungsausschluss
          </h1>
          <div className="shrink-0 pt-1">
            <Wordmark />
          </div>
        </header>

        <div className="relative mt-10 space-y-9">
          {PARAGRAPHS.map((item, index) => (
            <section key={index}>
              {item.heading && (
                <h2 className="text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-silver)]">
                  {item.heading}
                </h2>
              )}
              <p className="mt-3 text-[0.9375rem] leading-[1.75] text-[#c3c8ce]">
                {item.body}
              </p>
            </section>
          ))}
        </div>

        <footer className="relative mt-12 border-t border-[var(--color-line)] pt-8">
          <p className="text-xs leading-relaxed text-[#6b7179]">
            Stand: {new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date())}{" "}
            · {BRAND.name} {BRAND.suffix} ist ein Angebot der {COMPANY.name}. Ergänzende
            Angaben finden Sie im{" "}
            <Link href="/impressum" className="underline underline-offset-2">
              Impressum
            </Link>
            , in den{" "}
            <Link href="/agb" className="underline underline-offset-2">
              AGB
            </Link>{" "}
            und in der{" "}
            <Link href="/datenschutz" className="underline underline-offset-2">
              Datenschutzerklärung
            </Link>
            .
          </p>
        </footer>
      </article>
    </div>
  );
}
