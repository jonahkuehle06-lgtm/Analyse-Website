import { SeitenkopfPlatzhalter } from "@/components/Platzhalter";

export default function AnalyseLaden() {
  return (
    <div className="frame" role="status" aria-label="Analyse wird geladen">
      <div className="py-10 sm:py-14">
        <span className="platzhalter block h-4 w-32" aria-hidden="true" />
        <div className="mt-10">
          <SeitenkopfPlatzhalter />
        </div>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-x-14 xl:gap-x-24" aria-hidden="true">
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <span className="platzhalter block h-2.5 w-24" />
                  <span className="platzhalter block h-7 w-32" />
                </div>
              ))}
            </div>
            <div className="space-y-2.5">
              <span className="platzhalter block h-2.5 w-full" />
              <span className="platzhalter block h-2.5 w-[82%]" />
            </div>
          </div>
          <div className="surface h-[26rem]" />
        </div>
      </div>
    </div>
  );
}
