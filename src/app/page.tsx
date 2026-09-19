import Link from "next/link";
import PricingSection from "@/components/PricingSection";
import SignalIndicator from "@/components/SignalIndicator";
import AnalysisCard, { LockedAnalysisCard } from "@/components/AnalysisCard";
import { listAnalyses } from "@/lib/db";
import { currentUser, hasActiveSubscription } from "@/lib/auth";
import { BRAND, PLANS, SIGNALS, SIGNAL_LEVELS } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [analyses, user] = await Promise.all([listAnalyses(), currentUser()]);
  const preview = analyses.slice(0, 3);
  const unlocked = hasActiveSubscription(user);

  return (
    <>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative overflow-hidden">
        <div
          className="aura"
          style={{
            width: 640,
            height: 640,
            top: -300,
            left: "50%",
            transform: "translateX(-50%)",
            background:
              "radial-gradient(circle, rgba(180,188,198,0.16) 0%, rgba(0,0,0,0) 70%)",
          }}
          aria-hidden="true"
        />
        <div
          className="grid-lines absolute inset-0 opacity-40"
          style={{
            maskImage: "radial-gradient(ellipse at 50% 0%, black 0%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 0%, black 0%, transparent 72%)",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-5xl px-5 pb-24 pt-20 text-center sm:px-8 sm:pt-28">
          <span className="hairline inline-flex items-center gap-2.5 rounded-full bg-[rgba(255,255,255,0.03)] px-4 py-1.5">
            <span
              className="signal-dot inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "#00E56A", boxShadow: "0 0 10px rgba(0,229,106,.6)" }}
              aria-hidden="true"
            />
            <span className="text-[0.75rem] tracking-[0.08em] text-[var(--color-mist-2)]">
              {analyses.length > 0
                ? `${analyses.length} Analysen aktuell veröffentlicht`
                : "Neue Analysen jede Woche"}
            </span>
          </span>

          <h1 className="display mt-8 text-[2.5rem] leading-[1.08] sm:text-5xl lg:text-6xl">
            <span className="platinum-text">Fundierte Analysen,</span>
            <br />
            <span className="text-[var(--color-platinum)]">
              die über das Investieren hinausgehen.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-[var(--color-mist)]">
            Jede Analyse auf einen Blick: Titel, Kurs, eine präzise Begründung in ein bis
            zwei Sätzen — und ein Farbcode, der die Signalstärke sofort einordnet.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/preise" className="btn-platinum w-full sm:w-auto">
              Zugang sichern
            </Link>
            <Link href="/methodik" className="btn-ghost w-full sm:w-auto">
              Methodik ansehen
            </Link>
          </div>

          <p className="mt-8 text-xs text-[#6b7179]">
            Entgeltliche Anlageempfehlung · keine individuelle Anlageberatung
          </p>
        </div>
      </section>

      {/* -------------------------- Signal-Legende -------------------------- */}
      <section className="border-y border-[var(--color-line)] bg-[var(--color-void)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <p className="mono-label">Signalcode</p>
            <h2 className="display mt-4 text-3xl sm:text-4xl text-[var(--color-platinum)]">
              Fünf Stufen. Eine Farbe. Keine Interpretationsfrage.
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
              Die Signalstärke fasst das Ergebnis unserer Analyse in einer Skala zusammen —
              von leuchtendem Grün bis leuchtendem Rot.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-2 lg:grid-cols-5"
               style={{ borderRadius: "var(--radius-card)" }}>
            {SIGNAL_LEVELS.map((level) => {
              const meta = SIGNALS[level];
              return (
                <div key={level} className="bg-[var(--color-anthracite)] p-6">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: meta.color,
                      boxShadow: `0 0 14px ${meta.glow}`,
                    }}
                    aria-hidden="true"
                  />
                  <p
                    className="mt-4 text-sm font-semibold"
                    style={{ color: meta.color }}
                  >
                    {meta.label}
                  </p>
                  <p className="mono-label mt-1 !tracking-[0.12em]">{meta.short}</p>
                  <p className="mt-4 text-[0.8125rem] leading-relaxed text-[var(--color-mist)]">
                    {meta.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --------------------------- Analysen-Vorschau ---------------------- */}
      {preview.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mono-label">Aktuell</p>
              <h2 className="display mt-4 text-3xl sm:text-4xl text-[var(--color-platinum)]">
                Zuletzt veröffentlicht
              </h2>
            </div>
            <Link
              href="/analysen"
              className="text-sm text-[var(--color-mist)] underline underline-offset-4 transition-colors hover:text-[var(--color-platinum)]"
            >
              Alle Analysen ansehen
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {preview.map((analysis, index) =>
              unlocked || index === 0 ? (
                <AnalysisCard key={analysis.id} analysis={analysis} />
              ) : (
                <LockedAnalysisCard key={analysis.id} analysis={analysis} />
              ),
            )}
          </div>

          {!unlocked && (
            <p className="mt-8 text-center text-sm text-[var(--color-mist)]">
              Die erste Analyse ist frei einsehbar. Alle weiteren schaltest du mit einem
              Paket frei.
            </p>
          )}
        </section>
      )}

      {/* ------------------------------ Umfang ------------------------------ */}
      <section className="border-y border-[var(--color-line)] bg-[var(--color-void)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="grid gap-px overflow-hidden border border-[var(--color-line)] bg-[var(--color-line)] md:grid-cols-3"
               style={{ borderRadius: "var(--radius-card)" }}>
            {[
              {
                label: "Inhalt je Analyse",
                title: "Titel, Kurs, Begründung",
                body: "Kein Fließtext über Seiten — eine Karte, die in zehn Sekunden gelesen ist.",
              },
              {
                label: "Aktualisierung",
                title: "Sofort live",
                body: "Neue und geänderte Analysen erscheinen unmittelbar nach Freigabe im Kundenbereich.",
              },
              {
                label: "Paketumfang",
                title: `${PLANS.basic.limit} bis ${PLANS.platin.limit} Analysen`,
                body: "Freigeschaltet werden immer die aktuellsten Analysen des Bestands.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-[var(--color-anthracite)] p-8">
                <p className="mono-label">{item.label}</p>
                <h3 className="display mt-4 text-2xl text-[var(--color-platinum)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-mist)]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ Beispiel ---------------------------- */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="mono-label">Aufbau</p>
            <h2 className="display mt-4 text-3xl sm:text-4xl text-[var(--color-platinum)]">
              So liest sich eine Analyse
            </h2>
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
              Jede Karte enthält den Aktientitel mit Kürzel, den Kurs zum Zeitpunkt der
              Analyse, die Signalstärke als Farbbalken, die Kurzbegründung sowie die nach
              Art. 20 MAR erforderlichen Angaben zu Ersteller, Datum und möglichen
              Interessenkonflikten.
            </p>
            <ul className="mt-8 space-y-5">
              {[
                ["Signalstärke", "Fünfstufige Skala mit eindeutigem Farbcode."],
                ["Kurzbegründung", "Ein bis zwei Sätze — der Kern der Einschätzung."],
                ["Pflichtangaben", "Ersteller, Erstellungsdatum, Interessenkonflikte."],
              ].map(([title, body]) => (
                <li key={title} className="border-l border-[var(--color-line-strong)] pl-5">
                  <p className="text-sm font-medium text-[var(--color-platinum)]">{title}</p>
                  <p className="mt-1 text-sm text-[var(--color-mist)]">{body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface p-8" style={{ borderRadius: "var(--radius-card)" }}>
            <p className="mono-label">Beispielhafte Darstellung</p>
            <div className="mt-6 space-y-6">
              {SIGNAL_LEVELS.slice(0, 3).map((level) => (
                <div key={level}>
                  <SignalIndicator level={level} size="sm" />
                </div>
              ))}
            </div>
            <p className="mt-8 border-t border-[var(--color-line)] pt-5 text-xs leading-relaxed text-[#6b7179]">
              Darstellung dient ausschließlich der Illustration des Signalcodes und stellt
              keine Empfehlung für einen konkreten Wert dar.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------ Pakete ------------------------------ */}
      <div className="border-t border-[var(--color-line)] bg-[var(--color-void)]">
        <PricingSection currentPlan={user?.plan ?? null} />
      </div>

      {/* --------------------------- Rechtlicher Hinweis -------------------- */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div
          className="surface p-8 sm:p-10"
          style={{ borderRadius: "var(--radius-card)" }}
        >
          <p className="mono-label">Wichtiger Hinweis</p>
          <h2 className="display mt-4 text-2xl text-[var(--color-platinum)]">
            Anlageempfehlung — keine Anlageberatung
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--color-mist)]">
            Bei den auf dieser Website veröffentlichten Inhalten handelt es sich um
            entgeltliche, öffentlich zugängliche Anlageempfehlungen im Sinne des § 85 WpHG
            i.V.m. Art. 20 MAR und der Delegierten Verordnung (EU) 2016/958. Sie richten
            sich an einen unbestimmten Personenkreis, berücksichtigen keine persönlichen
            Verhältnisse und ersetzen keine individuelle Beratung durch qualifizierte
            Anlage-, Vermögens- oder Steuerberater. {BRAND.name} übernimmt keine Haftung
            für Anlageentscheidungen, die auf Grundlage dieser Inhalte getroffen werden.
          </p>
          <Link
            href="/haftungsausschluss"
            className="mt-6 inline-block text-sm text-[var(--color-platinum)] underline underline-offset-4"
          >
            Vollständigen Haftungsausschluss lesen
          </Link>
        </div>
      </section>
    </>
  );
}
