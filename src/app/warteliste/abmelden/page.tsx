import type { Metadata } from "next";
import AuthShell from "@/components/AuthShell";
import { wartelisteAbmeldenAction } from "@/lib/actions/warteliste";

export const metadata: Metadata = {
  title: "Von der Warteliste abmelden",
  robots: { index: false, follow: false },
};

export default async function AbmeldenPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t = "" } = await searchParams;
  return (
    <AuthShell
      label="Warteliste"
      title="Abmelden"
      lead="Mit einem Klick nehmen wir deine Adresse von der Warteliste und löschen deinen Eintrag."
    >
      <form action={wartelisteAbmeldenAction}>
        <input type="hidden" name="t" value={t} />
        <button type="submit" className="btn-platinum w-full">
          Von der Warteliste abmelden
        </button>
      </form>
    </AuthShell>
  );
}
