"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { createAnalysis, deleteAnalysis, updateAnalysis } from "@/lib/db";
import { ZEITRAEUME } from "@/lib/config";
import type { AnalysisInput, SignalLevel, Szenarien, Szenariosatz } from "@/lib/types";

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
    horizon: text(data, "horizon"),
    author: text(data, "author"),
    conflictDisclosure: text(data, "conflictDisclosure"),
    publishedAt: publishedAt
      ? new Date(`${publishedAt}T12:00:00.000Z`).toISOString()
      : new Date().toISOString(),
  };
}

function refresh() {
  revalidatePath("/");
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

  try {
    await createAnalysis(parsed);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Speichern fehlgeschlagen." };
  }

  refresh();
  redirect("/admin?gespeichert=1");
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

  try {
    const updated = await updateAnalysis(id, parsed);
    if (!updated) return { error: "Diese Analyse existiert nicht (mehr)." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Speichern fehlgeschlagen." };
  }

  refresh();
  redirect("/admin?gespeichert=1");
}

export async function deleteAnalysisAction(data: FormData): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");

  const id = text(data, "id");
  if (id) await deleteAnalysis(id);

  refresh();
  redirect("/admin?geloescht=1");
}
