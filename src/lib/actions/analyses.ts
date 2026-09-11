"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { createAnalysis, deleteAnalysis, updateAnalysis } from "@/lib/db";
import type { AnalysisInput, SignalLevel } from "@/lib/types";

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

function parse(data: FormData): AnalysisInput | { error: string } {
  const title = text(data, "title");
  const reason = text(data, "reason");
  const signal = Number(text(data, "signal"));

  if (!title) return { error: "Bitte einen Aktientitel angeben." };
  if (!reason) return { error: "Bitte eine kurze Begründung angeben." };
  if (![1, 2, 3, 4, 5].includes(signal)) {
    return { error: "Bitte eine Signalstärke auswählen." };
  }

  const publishedAt = text(data, "publishedAt");

  return {
    title,
    ticker: text(data, "ticker").toUpperCase(),
    price: decimal(data, "price"),
    currency: text(data, "currency") || "EUR",
    targetPrice: decimal(data, "targetPrice"),
    reason,
    signal: signal as SignalLevel,
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
