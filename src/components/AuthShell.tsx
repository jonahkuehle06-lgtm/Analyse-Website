/**
 * Huelle fuer Anmelde- und Einrichtungsseiten: links Ueberschrift und
 * Erklaerung, rechts das Formular. Am Telefon untereinander, die Links
 * stehen dann unter dem Formular.
 */
export default function AuthShell({
  label,
  title,
  lead,
  notice,
  links,
  children,
}: {
  label: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** Meldung ueber dem Formular, z.B. ein Fehler */
  notice?: React.ReactNode;
  links?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="plus-grid border-b border-[var(--color-line)]">
      <div className="frame frame-lines bg-[var(--color-ink)]">
        <div className="grid min-h-[72vh] items-center gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-20">
          <div className="max-w-xl">
            <span className="tag fade-up">{label}</span>
            <h1 className="display fade-up fade-up-2 mt-6 text-[length:var(--step-h1)] text-[var(--color-platinum)]">
              {title}
            </h1>
            {lead && <p className="lead fade-up fade-up-3 mt-5">{lead}</p>}
            {links && (
              <div className="mt-10 hidden space-y-3 text-[0.9375rem] text-[var(--color-mist)] lg:block">
                {links}
              </div>
            )}
          </div>

          <div className="fade-up fade-up-3">
            {notice}
            <div className="surface p-7 sm:p-9">{children}</div>
            {links && (
              <div className="mt-8 space-y-3 text-[0.9375rem] text-[var(--color-mist)] lg:hidden">
                {links}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
