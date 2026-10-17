/**
 * Einheitlicher Seitenkopf fuer Unterseiten: Etikett, grosse Ueberschrift,
 * optional Einleitung und Aktion rechts. Haelt Abstaende und Groessen auf
 * allen Seiten gleich.
 */
export default function PageHeader({
  label,
  title,
  lead,
  children,
}: {
  label: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** Aktion rechts neben dem Kopf, z.B. ein Knopf */
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-8 border-b border-[var(--color-line)] pb-10 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <span className="tag fade-up">{label}</span>
        <h1 className="display fade-up fade-up-2 mt-6 text-[length:var(--step-h1)] text-[var(--color-platinum)]">
          {title}
        </h1>
        {lead && <div className="lead fade-up fade-up-3 mt-5 max-w-[56ch]">{lead}</div>}
      </div>
      {children && <div className="fade-up fade-up-3 shrink-0">{children}</div>}
    </header>
  );
}
