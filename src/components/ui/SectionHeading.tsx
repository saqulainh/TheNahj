import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeadingProps {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  action?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  href,
  action = "View all",
  align = "left",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={`mb-8 flex flex-wrap gap-4 sm:mb-10 ${centered ? "flex-col items-center text-center" : "items-end justify-between"}`}>
      <div className={centered ? "max-w-2xl" : "min-w-0"}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-muted">{eyebrow}</p>
        <h2 id={id} className="mt-2 font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">{title}</h2>
        {description && <p className={`mt-2 text-sm leading-6 text-muted/75 ${centered ? "mx-auto max-w-xl" : "max-w-xl"}`}>{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-xs font-medium text-secondary transition-colors hover:border-gold/40 hover:text-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
          {action}<ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
