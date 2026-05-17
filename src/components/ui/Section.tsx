import { type ReactNode } from "react";

interface SectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function Section({ title, subtitle, children, className = "", action }: SectionProps) {
  return (
    <section className={`py-12 md:py-16 ${className}`}>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-foreground md:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 max-w-lg text-sm text-muted">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
