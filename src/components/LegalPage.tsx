import LegalReviewNote from "./LegalReviewNote";

export default function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="mono-label">{eyebrow}</p>
      <h1 className="display mt-4 text-4xl sm:text-5xl">
        <span className="platinum-text">{title}</span>
      </h1>
      {intro && (
        <p className="mt-5 text-[0.9375rem] leading-relaxed text-[var(--color-mist)]">
          {intro}
        </p>
      )}

      <div className="mt-12">
        <LegalReviewNote />
        <div className="legal-body space-y-8">{children}</div>
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
      <h2 className="display text-2xl text-[var(--color-platinum)]">{title}</h2>
      <div className="mt-3 space-y-4 text-sm leading-relaxed text-[var(--color-mist-2)]">
        {children}
      </div>
    </section>
  );
}
