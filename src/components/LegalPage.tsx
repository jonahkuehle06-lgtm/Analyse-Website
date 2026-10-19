import LegalReviewNote from "./LegalReviewNote";
import PageHeader from "./PageHeader";

export default function LegalPage({
  eyebrow,
  title,
  intro,
  pdfHref,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  /** Download-Link fuer dieselbe Fassung als PDF */
  pdfHref?: string;
  /** Weitere Schaltflaechen neben dem PDF-Link */
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="frame">
      <div className="mx-auto max-w-4xl py-14 sm:py-20">
        <PageHeader label={eyebrow} title={title} lead={intro} />

        {(pdfHref || actions) && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {pdfHref && (
              <a href={pdfHref} className="btn-ghost" download>
                Als PDF herunterladen
              </a>
            )}
            {actions}
          </div>
        )}

        <div className="mt-12 max-w-[72ch]">
          <LegalReviewNote />
          <div className="legal-body space-y-10">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="display text-[length:var(--step-h4)] font-normal text-[var(--color-platinum)]">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[0.9375rem] leading-relaxed text-[var(--color-mist-2)]">
        {children}
      </div>
    </section>
  );
}
