"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { createAnalysis, deleteAnalysis, getAnalysis, updateAnalysis } from "@/lib/db";
import { meldeNeueAnalyse, meldeSignalwechsel } from "@/lib/benachrichtigung";
import { ZEITRAEUME } from "@/lib/config";
import { freischaltungenSichern } from "@/lib/freischaltung";
import type { AnalyseStatus, AnalysisInput, Richtung, SignalLevel, Szenarien, Szenariosatz } from "@/lib/types";

export interface AnalysisFormState {
  error?: string;
}

function text(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function decimal(data: FormData, key: string): number | null {
  const raw = text(data, key).replace(",", ".");
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/**
 * Szenarien je Zeitraum. Ein Zeitraum ist entweder leer oder hat alle drei
 * Kursziele - mindestens einer muss gepflegt sein.
 */
function szenarienAus(data: FormData): { werte: Szenarien } | { error: string } {
  const werte: Szenarien = {};
  for (const { id, name } of ZEITRAEUME) {
    const feld = (f: string) => `szenario-${id}-${f}`;
    const satz: Szenariosatz = {
      bestPrice: decimal(data, feld("bestPrice")),
      bestProbability: decimal(data, feld("bestProbability")),
      bestNote: text(data, feld("bestNote")),
      basePrice: decimal(data, feld("basePrice")),
      baseProbability: decimal(data, feld("baseProbability")),
      baseNote: text(data, feld("baseNote")),
      worstPrice: decimal(data, feld("worstPrice")),
      worstProbability: decimal(data, feld("worstProbability")),
      worstNote: text(data, feld("worstNote")),
    };
    const leer = Object.values(satz).every((v) => v === null || v === "");
    if (leer) continue;
    if (satz.bestPrice === null || satz.basePrice === null || satz.worstPrice === null) {
      return {
        error: `${name}: Bitte alle drei Kursziele angeben oder den Zeitraum ganz leer lassen.`,
      };
    }
    werte[id] = satz;
  }
  if (Object.keys(werte).length === 0) {
    return { error: "Bitte mindestens einen Zeitraum mit allen drei Kurszielen ausfüllen." };
  }
  return { werte };
}

function parse(data: FormData): AnalysisInput | { error: string } {
  const title = text(data, "title");
  const reason = text(data, "reason");
  const signal = Number(text(data, "signal"));

  if (!title) return { error: "Bitte einen Aktientitel angeben." };
  if (!reason) return { error: "Bitte eine kurze Begründung angeben." };
  if (![1, 2, 3, 4, 5].includes(signal)) {
    return { error: "Bitte eine Signalstärke auswählen." };
  }

  const szenarien = szenarienAus(data);
  if ("error" in szenarien) return szenarien;

  const publishedAt = text(data, "publishedAt");

  return {
    title,
    ticker: text(data, "ticker").toUpperCase(),
    price: decimal(data, "price"),
    currency: text(data, "currency") || "EUR",
    targetPrice: decimal(data, "targetPrice"),
    zoneStrongEntryTo: decimal(data, "zoneStrongEntryTo"),
    zoneEntryTo: decimal(data, "zoneEntryTo"),
    zoneNeutralTo: decimal(data, "zoneNeutralTo"),
    zoneExitTo: decimal(data, "zoneExitTo"),
    scenarios: szenarien.werte,
    reason,
    signal: signal as SignalLevel,
    direction: text(data, "direction") === "short" ? "short" : "long",
    isPublic: data.get("isPublic") === "ja",
    // Das Protokoll fuehrt die Speicher-Aktion fort (siehe updateAnalysisAction)
    changelog: [],
    status: statusAus(text(data, "status")),
    closedAt: null,
    benachrichtigtAm: null,
    horizon: text(data, "horizon"),
    author: text(data, "author"),
    conflictDisclosure: text(data, "conflictDisclosure"),
    publishedAt: publishedAt
      ? new Date(`${publishedAt}T12:00:00.000Z`).toISOString()
      : new Date().toISOString(),
  };
}

function statusAus(v: string): AnalyseStatus {
  return v === "entwurf" || v === "abgeschlossen" ? v : "veroeffentlicht";
}

/** Zurück in den Bereich (Long oder Short), aus dem man kam. */
function adminLink(richtung: Richtung, meldung: "gespeichert" | "geloescht" | "entwurf"): string {
  return `/admin?${richtung === "short" ? "richtung=short&" : ""}${meldung}=1`;
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/beispielanalyse");
  revalidatePath("/analysen");
  revalidatePath("/admin");
}

export async function createAnalysisAction(
  _prev: AnalysisFormState,
  data: FormData,
): Promise<AnalysisFormState> {
  if (!(await isAdmin())) return { error: "Nicht angemeldet." };

  const parsed = parse(data);
  if ("error" in parsed) return parsed;

  // Vorher sichern, was Kunden gerade freigeschaltet haben - die neue
  // Analyse schiebt die älteste aus dem Paket in die Historie
  await freischaltungenSichern();
  // Eine neue Analyse beginnt nie abgeschlossen
  if (parsed.status === "abgeschlossen") parsed.status = "veroeffentlicht";
  try {
    const neu = await createAnalysis(parsed);
    await meldeNeueAnalyse(neu);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Speichern fehlgeschlagen." };
  }

  refresh();
  redirect(adminLink(parsed.direction, parsed.status === "entwurf" ? "entwurf" : "gespeichert"));
}

export async function updateAnalysisAction(
  _prev: AnalysisFormState,
  data: FormData,
): Promise<AnalysisFormState> {
  if (!(await isAdmin())) return { error: "Nicht angemeldet." };

  const id = text(data, "id");
  if (!id) return { error: "Kennung der Analyse fehlt." };

  const parsed = parse(data);
  if ("error" in parsed) return parsed;

  // Änderungsprotokoll fortschreiben: ein Eintrag, wenn ein Grund angegeben
  // ist oder sich das Signal geändert hat. Neueste zuerst.
  const bisher = await getAnalysis(id).catch(() => null);
  if (!bisher) return { error: "Diese Analyse existiert nicht (mehr)." };
  const grund = text(data, "aenderungsgrund").slice(0, 280);
  const jetzt = new Date().toISOString();
  const warEntwurf = bisher.status === "entwurf";
  // Solange die Analyse ein Entwurf ist, gibt es noch nichts zu protokollieren
  const signalGeaendert = !warEntwurf && bisher.signal !== parsed.signal;
  const schliesst = parsed.status === "abgeschlossen" && bisher.status !== "abgeschlossen";
  const oeffnet = bisher.status === "abgeschlossen" && parsed.status !== "abgeschlossen";
  parsed.benachrichtigtAm = bisher.benachrichtigtAm;
  parsed.closedAt = parsed.status === "abgeschlossen" ? (bisher.closedAt ?? jetzt) : null;
  parsed.changelog =
    !warEntwurf && (grund || signalGeaendert || schliesst || oeffnet)
      ? [
          {
            date: jetzt,
            note: schliesst
              ? `Analyse abgeschlossen.${grund ? ` ${grund}` : ""}`
              : oeffnet
                ? `Analyse wieder aufgenommen.${grund ? ` ${grund}` : ""}`
                : grund,
            ...(signalGeaendert ? { signalFrom: bisher.signal, signalTo: parsed.signal } : {}),
          },
          ...bisher.changelog,
        ]
      : bisher.changelog;

  // Ein geändertes Datum kann die Reihenfolge verschieben
  await freischaltungenSichern();
  try {
    const updated = await updateAnalysis(id, parsed);
    if (!updated) return { error: "Diese Analyse existiert nicht (mehr)." };
    // Erst jetzt veröffentlicht: als neue Analyse melden. Sonst nur den Signalwechsel.
    if (warEntwurf) await meldeNeueAnalyse(updated);
    else if (signalGeaendert) await meldeSignalwechsel(updated, bisher.signal, grund);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Speichern fehlgeschlagen." };
  }

  refresh();
  redirect(adminLink(parsed.direction, parsed.status === "entwurf" ? "entwurf" : "gespeichert"));
}

/** Legt eine Kopie als Entwurf an und öffnet sie zum Bearbeiten. */
export async function duplicateAnalysisAction(data: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");

  const vorlage = await getAnalysis(text(data, "id")).catch(() => null);
  if (!vorlage) redirect("/admin");
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = vorlage;
  void _id; void _c; void _u;
  const kopie = await createAnalysis({
    ...rest,
    status: "entwurf",
    isPublic: false,
    changelog: [],
    closedAt: null,
    benachrichtigtAm: null,
    publishedAt: new Date().toISOString(),
  });

  refresh();
  redirect(`/admin/${kopie.id}`);
}

export async function deleteAnalysisAction(data: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");

  const id = text(data, "id");
  if (id) await deleteAnalysis(id);

  refresh();
  redirect(adminLink(text(data, "direction") === "short" ? "short" : "long", "geloescht"));
}
