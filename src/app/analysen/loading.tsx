import { KartenPlatzhalter, SeitenkopfPlatzhalter } from "@/components/Platzhalter";

export default function AnalysenLaden() {
  return (
    <div className="frame" role="status" aria-label="Analysen werden geladen">
      <div className="py-14 sm:py-20">
        <SeitenkopfPlatzhalter />
        <KartenPlatzhalter />
      </div>
    </div>
  );
}
