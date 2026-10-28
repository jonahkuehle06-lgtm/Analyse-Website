import { isAdmin } from "@/lib/auth";
import { listWarteliste } from "@/lib/db";

/** Bestätigte Einträge der Warteliste als CSV (Excel-tauglich, Semikolon). */
export async function GET() {
  if (!(await isAdmin())) return new Response("Nicht angemeldet", { status: 401 });
  const zelle = (v: string | null) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const zeilen = (await listWarteliste()).map((e) =>
    [e.email, e.vorname, e.quelle, e.bestaetigtAm].map(zelle).join(";"),
  );
  const csv = "﻿" + ["E-Mail;Vorname;Quelle;Bestätigt am", ...zeilen].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="warteliste.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
