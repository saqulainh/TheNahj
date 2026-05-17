"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Topic {
  slug: string;
  title: string;
  description: string;
}

interface CornerPreviewProps {
  title: string;
  subtitle: string;
  basePath: string;
  topics: Topic[];
  accent?: string;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export function CornerPreview({ title, subtitle, basePath, topics, accent }: CornerPreviewProps) {
  return (
    <section className="relative py-12 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Section header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-light tracking-tight text-foreground md:text-3xl">
              {title}
            </h2>
          </div>
          <Link
            href={basePath}
            className="hidden items-center gap-2 rounded-full border border-border/40 px-5 py-2 text-xs font-medium text-muted transition-all duration-300 hover:border-gold/30 hover:text-gold-light sm:flex"
          >
            Explore all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Topic cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {topics.slice(0, 6).map((topic, i) => (
            <motion.div key={topic.slug} variants={cardVariants}>
              <Link
                href={`${basePath}/${topic.slug}`}
                className="group relative block overflow-hidden rounded-2xl border border-border/30 bg-surface/40 p-6 transition-all duration-500 hover:border-gold/20 hover:bg-surface-elevated/60 md:p-7"
              >
                {/* Number */}
                <span className="absolute right-5 top-5 text-[10px] font-medium tabular-nums text-muted/20">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <h3 className="text-sm font-medium text-foreground transition-colors duration-300 group-hover:text-gold-light">
                  {topic.title}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-muted/60">
                  {topic.description}
                </p>

                <div className="mt-5 flex items-center gap-1 text-[11px] text-gold/60 transition-all duration-300 group-hover:text-gold group-hover:gap-2">
                  <span>Read</span>
                  <ArrowRight size={12} />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile view all */}
        <Link
          href={basePath}
          className="mt-8 flex items-center justify-center gap-2 text-sm text-gold/70 sm:hidden"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
