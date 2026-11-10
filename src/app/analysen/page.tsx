import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import type { Metadata } from "next";
import AnalysisCard, { LockedAnalysisCard } from "@/components/AnalysisCard";
import SignalFilter from "@/components/SignalFilter";
import RichtungUmschalter from "@/components/RichtungUmschalter";
import { analysenLink, type Ansicht, type Sortierung } from "@/lib/analysen-link";
import { beispielPfad } from "@/lib/beispiele";
import { listAnalyses, merklisteLesen } from "@/lib/db";
import { besuchVermerken } from "@/lib/besuch";
import { einfuehrungSchliessenAction, merkenAction } from "@/lib/actions/konto";
import { abstandProzent, prozentText } from "@/lib/szenarien";
import { SIGNALS } from "@/lib/config";
import { currentUser } from "@/lib/auth";
import { PLANS, PLAN_ORDER, SIGNAL_LEVELS } from "@/lib/config";
import { sichtbarkeitFuer } from "@/lib/freischaltung";
import type { Analysis, Richtung, SignalLevel } from "@/lib/types";
import { brotkrumen, kanonisch } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aktienanalysen",
  description:
    "Alle aktuellen Aktienanalysen von PAX Solutions mit Signalstärke, Kurzbegründung und Kursziel – fundamental und technisch fundiert.",
  ...kanonisch("/analysen"),
};

const SORTIERUNGEN: { id: Sortierung; name: string }[] = [
  { id: "datum", name: "Neueste" },
  { id: "signal", name: "Signalstärke" },
  { id: "abstand", name: "Abstand zum Kursziel" },
];

const tag = (iso: string) =>
  new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));

const geld = (wert: number | null, waehrung: string) =>
  wert === null
    ? "—"
    : new Intl.NumberFormat("de-DE", { style: "currency", currency: waehrung || "EUR", maximumFractionDigits: 2 }).format(wert);

export default async function AnalysenPage({
  searchParams,
}: {
  searchParams: Promise<{
    signal?: string;
    richtung?: string;
    q?: string;
    sort?: string;
    ansicht?: string;
    merk?: string;
  }>;
}) {
  const params = await searchParams;
  const [all, user] = await Promise.all([listAnalyses(), currentUser()]);

  /* Freigeschaltet sind immer die N aktuellsten Analysen; ohne Abo keine.
     Dabei wird vermerkt, was freigeschaltet ist - fuer die Historie. */
  const { aktiv: active, limit, aktuell: unlockedIds } = await sichtbarkeitFuer(user, all);

  const wunsch = Number(params.signal) as SignalLevel;
  const selected = SIGNAL_LEVELS.includes(wunsch) ? wunsch : null;

  /* Der Filter wirkt nur auf freigeschaltete Analysen. Gesperrte Titel
     bleiben beim Filtern ausgeblendet - sonst liesse sich ihre
     Signalstaerke ueber den Filter ablesen. Aus demselben Grund haengen
     Leerhinweis und Paket-Hinweis nie von gesperrten Analysen ab. */
  /* Long oder Short: die Übersicht zeigt immer nur eine Richtung. Welche
     Analysen freigeschaltet sind, bestimmt weiterhin der Gesamtbestand. */
  const richtung: Richtung = params.richtung === "short" ? "short" : "long";

  /* Suche, Sortierung, Ansicht und Merkliste stehen in der Adresse - so
     bleiben sie beim Filtern erhalten und funktionieren ohne JavaScript. */
  const suche = (params.q ?? "").trim().slice(0, 60);
  const sort: Sortierung = params.sort === "signal" || params.sort === "abstand" ? params.sort : "datum";
  const alsListe = params.ansicht === "liste";
  const gemerkt = active && user
    ? await merklisteLesen(user.id).catch(() => new Set<string>())
    : new Set<string>();
  const nurGemerkt = active && params.merk === "1";
  const ansicht: Ansicht = { q: suche, sort, liste: alsListe, merk: nurGemerkt };
  const passt = (a: Analysis) => {
    if (!suche) return true;
    const s = suche.toLowerCase();
    return a.title.toLowerCase().includes(s) || a.ticker.toLowerCase().includes(s);
  };

  // "Neu" heißt: seit dem letzten Besuch erschienen (siehe besuchVermerken)
  const neuSeit = active && user ? await besuchVermerken(user) : null;
  const istNeu = (a: Analysis) =>
    neuSeit !== null && Date.parse(a.benachrichtigtAm ?? a.createdAt) > neuSeit;

  const inRichtung = all.filter((a) => a.direction === richtung);
  // Öffentliche Beispielanalysen sind für jeden lesbar - auch ohne Paket
  const lesbar = (a: { id: string; isPublic: boolean }) => unlockedIds.has(a.id) || a.isPublic;
  const freigeschaltet = inRichtung.filter(lesbar);
  const gefiltert = freigeschaltet
    .filter((a) => (selected ? a.signal === selected : true))
    .filter((a) => (nurGemerkt ? gemerkt.has(a.id) : true))
    .filter(passt);
  const zumZiel = (a: Analysis) => abstandProzent(a.price, a.targetPrice);
  const frei =
    sort === "signal"
      ? [...gefiltert].sort((a, b) => a.signal - b.signal)
      : sort === "abstand"
        ? // Größter Abstand in Richtung der Analyse zuerst; ohne Kursziel ans Ende
          [...gefiltert].sort(
            (a, b) =>
              (zumZiel(b) ?? -Infinity) * (richtung === "short" ? -1 : 1) -
              (zumZiel(a) ?? -Infinity) * (richtung === "short" ? -1 : 1),
          )
        : gefiltert;
  // Gesperrte Titel zeigen nur Name und Kürzel - danach darf man suchen
  const gesperrt = selected || nurGemerkt ? [] : inRichtung.filter((a) => !lesbar(a)).filter(passt);
  const hinweis = inRichtung.some((a) => !lesbar(a));
  const eingegrenzt = selected !== null || nurGemerkt || suche !== "";
  // In der Listenansicht stehen im Raster keine Karten - nur der Paket-Hinweis
  const karten = alsListe ? 0 : frei.length;
  const leer = inRichtung.length === 0 || (eingegrenzt && frei.length === 0 && gesperrt.length === 0);

  return (
    <div className="frame">
      <JsonLd daten={brotkrumen("Aktienanalysen", "/analysen")} />
      <div className="py-14 sm:py-20">
        <PageHeader
          label="Research"
          title="Analysen"
          lead={
            <>
              {all.length} Analysen im Bestand.{" "}
              {active
                ? `Dein Paket ${PLANS[user!.plan!].name} schaltet die ${limit} aktuellsten frei.`
                : "Mit einem Paket schaltest du die aktuellsten frei."}
            </>
          }
        >
          {!active && (
            <Link href="/preise" className="btn-platinum">
              Alle freischalten
              <span className="pfeil" aria-hidden="true">→</span>
            </Link>
          )}
        </PageHeader>

        {/* Long / Short */}
        <RichtungUmschalter
          aktiv={richtung}
          links={{ long: analysenLink("long", selected, ansicht), short: analysenLink("short", selected, ansicht) }}
          className="mt-8"
        />

        {/* Status-Leiste */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-line)] py-5">
          <p className="text-[0.9375rem] text-[var(--color-mist-2)]">
            {active ? (
              <>
                Paket{" "}
                <span className="font-medium text-[var(--color-platinum)]">
                  {PLANS[user!.plan!].name}
                </span>{" "}
                · {Math.min(limit, all.length)} von {all.length} Analysen freigeschaltet
              </>
            ) : (
              <>Kein aktives Paket · {Math.min(limit, all.length)} von {all.length} sichtbar</>
            )}
          </p>
          <Link href={active ? "/konto" : "/preise"} className="btn-link text-[0.9375rem]">
            {active ? "Abo verwalten" : "Pakete ansehen"}
            <span className="pfeil" aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Einführung nach dem Kauf - einmal, bis sie geschlossen wird */}
        {active && user && !user.einfuehrungGesehen && (
          <section
            aria-labelledby="einfuehrung-titel"
            className="surface mt-8 p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="tag">Erste Schritte</span>
                <h2 id="einfuehrung-titel" className="display mt-4 text-[length:var(--step-h4)] font-normal text-[var(--color-platinum)]">
                  So findest du dich zurecht
                </h2>
              </div>
              <form action={einfuehrungSchliessenAction}>
                <button type="submit" className="btn-ghost !w-auto !min-h-11 text-sm">
                  Verstanden, ausblenden
                </button>
              </form>
            </div>
            <ol className="mt-6 grid gap-6 border-t border-[var(--color-line)] pt-6 md:grid-cols-3 md:gap-8">
              {[
                {
                  titel: "Analyse öffnen",
                  text: `Die ${limit} aktuellsten Analysen sind freigeschaltet. Jede Karte zeigt Signalstärke, Begründung und Kursziel.`,
                },
                {
                  titel: "Szenarien lesen",
                  text: "In jeder Analyse stehen die Szenarien A, B und C mit Wahrscheinlichkeit, für bis zu drei Zeiträume.",
                  link: { href: "/methodik", text: "Zur Methodik" },
                },
                {
                  titel: "Auf dem Laufenden bleiben",
                  text: "Merke dir Titel und lass dich bei neuen Analysen oder Signalwechseln per E-Mail benachrichtigen.",
                  link: { href: "/konto", text: "Benachrichtigungen einstellen" },
                },
              ].map((s, i) => (
                <li key={s.titel} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4">
                  <span className="tabular flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-line-strong)] text-sm text-[var(--color-platinum)]" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-medium text-[var(--color-platinum)]">{s.titel}</h3>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">{s.text}</p>
                    {s.link && (
                      <Link href={s.link.href} className="btn-link mt-3 text-sm">
                        {s.link.text}
                        <span className="pfeil" aria-hidden="true">→</span>
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Suche, Sortierung, Ansicht */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <form action="/analysen" method="get" role="search" className="flex w-full gap-2 lg:max-w-md">
            {richtung === "short" && <input type="hidden" name="richtung" value="short" />}
            {selected && <input type="hidden" name="signal" value={selected} />}
            {sort !== "datum" && <input type="hidden" name="sort" value={sort} />}
            {alsListe && <input type="hidden" name="ansicht" value="liste" />}
            {nurGemerkt && <input type="hidden" name="merk" value="1" />}
            <label htmlFor="analysen-suche" className="sr-only">
              Analysen nach Name oder Kürzel durchsuchen
            </label>
            <input
              id="analysen-suche"
              type="search"
              name="q"
              defaultValue={suche}
              maxLength={60}
              placeholder="Name oder Kürzel"
              className="field !rounded-full !py-2.5"
            />
            <button type="submit" className="btn-ghost !w-auto shrink-0 !min-h-11 !px-5 text-sm">
              Suchen
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <nav aria-label="Sortierung" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="mono-label">Sortiert nach</span>
              {SORTIERUNGEN.map((o) => (
                <Link
                  key={o.id}
                  href={analysenLink(richtung, selected, { ...ansicht, sort: o.id })}
                  aria-current={sort === o.id ? "true" : undefined}
                  className={`inline-flex min-h-11 items-center border-b transition-colors ${
                    sort === o.id
                      ? "border-[var(--color-platinum)] font-medium text-[var(--color-platinum)]"
                      : "border-transparent text-[var(--color-mist)] hover:text-[var(--color-platinum)]"
                  }`}
                >
                  {o.name}
                </Link>
              ))}
            </nav>
            <nav aria-label="Ansicht" className="inline-grid grid-cols-2 gap-1 rounded-full border border-[var(--color-line-strong)] p-1 text-sm">
              {[
                { liste: false, name: "Karten" },
                { liste: true, name: "Liste" },
              ].map((o) => (
                <Link
                  key={o.name}
                  href={analysenLink(richtung, selected, { ...ansicht, liste: o.liste })}
                  aria-current={alsListe === o.liste ? "true" : undefined}
                  className={`inline-flex min-h-9 items-center justify-center rounded-full px-4 transition-colors ${
                    alsListe === o.liste
                      ? "bg-[var(--color-platinum)] font-medium text-[var(--color-ink)]"
                      : "text-[var(--color-mist)] hover:text-[var(--color-platinum)]"
                  }`}
                >
                  {o.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Signalfilter, rechts daneben Merkliste und historische Analysen */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="min-w-0 lg:flex-1">
            <SignalFilter active={selected} richtung={richtung} ansicht={ansicht} />
          </div>
          {active && (
            <Link
              href={analysenLink(richtung, selected, { ...ansicht, merk: !nurGemerkt })}
              aria-current={nurGemerkt ? "true" : undefined}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 self-start rounded-full border px-4 text-sm whitespace-nowrap transition-colors duration-200 lg:self-auto ${
                nurGemerkt
                  ? "border-[var(--color-platinum)] bg-[var(--color-platinum)] font-medium text-[var(--color-ink)]"
                  : "border-[var(--color-line-strong)] text-[var(--color-mist)] hover:border-[var(--color-platinum)] hover:text-[var(--color-platinum)]"
              }`}
            >
              Merkliste
              <span className="tabular">{gemerkt.size}</span>
            </Link>
          )}
          <Link
            href="/analysen/historisch"
            className="btn-link shrink-0 self-start text-[0.9375rem] lg:mb-2 lg:self-auto"
          >
            {!active && (
              <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="7" width="10" height="7" rx="1.5" />
                <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
              </svg>
            )}
            Historische Analysen
            <span className="pfeil" aria-hidden="true">→</span>
          </Link>
        </div>

        {leer && (
          <div className="mt-16 text-center">
          <p className="text-[0.9375rem] text-[var(--color-mist)]">
            {all.length === 0
              ? "Es wurden noch keine Analysen veröffentlicht."
              : inRichtung.length === 0
                ? richtung === "short"
                  ? "Aktuell keine Short-Analysen."
                  : "Aktuell keine Long-Analysen."
              : suche
                ? `Keine Analyse passt zu „${suche}“.`
              : nurGemerkt
                ? "Auf deiner Merkliste steht hier noch nichts. Merken kannst du einen Titel in der Analyse oder in der Listenansicht."
              : !active
                ? "Der Filter durchsucht nur freigeschaltete Analysen – mit einem Paket schaltest du sie frei."
                : hinweis
                  ? "Unter den freigeschalteten Analysen ist aktuell keine mit dieser Signalstufe."
                  : "Für diese Signalstufe liegt aktuell keine Analyse vor."}
          </p>
          {eingegrenzt && inRichtung.length > 0 && (
            <Link href={analysenLink(richtung, null, { sort, liste: alsListe })} className="btn-link mt-5 text-[0.9375rem]">
              Alle Analysen zeigen
              <span className="pfeil" aria-hidden="true">→</span>
            </Link>
          )}
          </div>
        )}

        {alsListe && frei.length > 0 && (
          /* Listenansicht: dieselben Analysen als Tabelle - schneller zu
             überfliegen. Am Handy rückt die Tabelle in einen Wischbereich. */
          <div className="mt-8 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-line)]">
            <table className="w-full min-w-[46rem] text-left text-[0.9375rem]">
              <caption className="sr-only">Freigeschaltete Analysen als Liste</caption>
              <thead>
                <tr className="border-b border-[var(--color-line)]">
                  {["Titel", "Signalstärke", "Kurs", "Kursziel", "Abstand", "Erstellt", "Merken"].map((k, i) => (
                    <th key={k} scope="col" className={`mono-label px-4 py-3.5 font-normal whitespace-nowrap ${i >= 2 && i <= 4 ? "text-right" : ""}`}>
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {frei.map((a) => {
                  const p = zumZiel(a);
                  const ziel = unlockedIds.has(a.id) ? `/analysen/${a.id}` : beispielPfad(a);
                  return (
                    <tr key={a.id} className="border-b border-[var(--color-line)] last:border-b-0 hover:bg-white/[0.03]">
                      <th scope="row" className="px-4 py-3 font-normal">
                        <Link href={ziel} className="group inline-flex min-h-11 flex-col justify-center">
                          <span className="font-medium text-[var(--color-platinum)] underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-current">
                            {a.title}
                          </span>
                          <span className="mono-label mt-0.5">
                            {a.ticker || "—"}
                            {istNeu(a) && <span className="text-[var(--color-platinum)]"> · Neu</span>}
                            {a.status === "abgeschlossen" && <span> · Abgeschlossen</span>}
                          </span>
                        </Link>
                      </th>
                      <td className="px-4 py-3 whitespace-nowrap text-[var(--color-mist-2)]">
                        <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: SIGNALS[a.signal].color }} aria-hidden="true" />
                        {SIGNALS[a.signal].label}
                      </td>
                      <td className="tabular px-4 py-3 text-right whitespace-nowrap text-[var(--color-platinum)]">{geld(a.price, a.currency)}</td>
                      <td className="tabular px-4 py-3 text-right whitespace-nowrap text-[var(--color-platinum)]">{geld(a.targetPrice, a.currency)}</td>
                      <td className="tabular px-4 py-3 text-right whitespace-nowrap text-[var(--color-mist-2)]">{p === null ? "—" : prozentText(p)}</td>
                      <td className="tabular px-4 py-3 whitespace-nowrap text-[var(--color-mist)]">{tag(a.publishedAt)}</td>
                      <td className="px-4 py-3">
                        {unlockedIds.has(a.id) && (
                          <form action={merkenAction}>
                            <input type="hidden" name="id" value={a.id} />
                            <input type="hidden" name="gemerkt" value={gemerkt.has(a.id) ? "nein" : "ja"} />
                            <button
                              type="submit"
                              aria-pressed={gemerkt.has(a.id)}
                              className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm whitespace-nowrap transition-colors ${
                                gemerkt.has(a.id)
                                  ? "border-[var(--color-platinum)] text-[var(--color-platinum)]"
                                  : "border-[var(--color-line-strong)] text-[var(--color-mist)] hover:border-[var(--color-platinum)] hover:text-[var(--color-platinum)]"
                              }`}
                            >
                              {gemerkt.has(a.id) ? "Gemerkt" : "Merken"}
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {(karten > 0 || hinweis) && (
          /* Freigeschaltete Karten. Sind es weniger als drei (etwa beim
             Filtern), fuellt der Paket-Hinweis die freie Flaeche daneben;
             sonst steht er als eigene Zeile darunter. Ohne Abo ist er
             allein und volle Breite. */
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {!alsListe &&
              frei.map((analysis) => (
                <AnalysisCard
                  key={analysis.id}
                  analysis={analysis}
                  headingLevel={2}
                  href={unlockedIds.has(analysis.id) ? undefined : beispielPfad(analysis)}
                  neu={istNeu(analysis)}
                  gemerkt={gemerkt.has(analysis.id)}
                />
              ))}
            {hinweis && (
              <div
                className={`section-paper @container flex flex-col justify-between gap-8 rounded-[var(--radius-card)] p-8 sm:p-10 ${
                  karten === 0
                    ? "md:col-span-2 lg:col-span-3"
                    : karten % 3 === 1
                      ? "md:col-span-1 lg:col-span-2"
                      : karten % 3 === 2
                        ? "md:col-span-2 lg:col-span-1"
                        : "md:col-span-2 lg:col-span-3"
                }`}
              >
                <div>
                  <span className="tag">Pakete</span>
                  <h2 className="display mt-6 text-[length:var(--step-h3)] text-[var(--color-platinum)]">
                    Weitere Analysen freischalten
                  </h2>
                  <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
                    {active
                      ? "Mit einem größeren Paket erweiterst du deinen Zugang auf bis zu 50 Analysen."
                      : "Basic, Black oder Platin — Zugriff auf 10, 25 oder 50 Analysen, monatlich kündbar."}
                  </p>
                </div>
                {/* Die drei Pakete auf einen Blick - aus denselben Daten wie die
                    Paketseite. Die Box ist je nach Raster halb oder ganz breit;
                    ist sie schmal, stehen die Pakete als Zeilen untereinander,
                    sonst als drei Spalten. */}
                <dl className="grid border-y border-[var(--color-line)] @sm:grid-cols-3">
                  {PLAN_ORDER.map((id, i) => (
                    <div
                      key={id}
                      className={`grid grid-cols-[auto_1fr_auto] items-baseline gap-x-2 gap-y-1.5 py-3.5 @sm:block @sm:py-4 ${
                        i > 0
                          ? "border-t border-[var(--color-line)] @sm:border-t-0 @sm:border-l @sm:pl-5"
                          : ""
                      }`}
                    >
                      <dt className="mono-label col-span-3">{PLANS[id].name}</dt>
                      <dd className="display tabular text-[1.5rem] leading-none font-normal text-[var(--color-platinum)] @sm:mt-1.5">
                        {PLANS[id].limit}
                      </dd>
                      <dd className="text-sm text-[var(--color-mist-2)] @sm:mt-1">Analysen</dd>
                      <dd className="tabular text-sm whitespace-nowrap text-[var(--color-mist)] @sm:mt-2">
                        {PLANS[id].priceMonthly} €/Monat
                      </dd>
                    </div>
                  ))}
                </dl>
                <Link href="/preise" className="btn-platinum self-start">
                  {active ? "Paket erweitern" : "Paket wählen"}
                  <span className="pfeil" aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {gesperrt.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gesperrt.map((analysis) => (
              <LockedAnalysisCard key={analysis.id} analysis={analysis} headingLevel={2} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
