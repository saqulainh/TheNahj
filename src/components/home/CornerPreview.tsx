"use client";

import Link from "next/link";
import {
  Activity, ArrowRight, Brain, BriefcaseBusiness, Clock3, Cloud, Compass,
  GraduationCap, Heart, Smartphone, Sparkles, Star, Target, Users, UserRound,
  Shield, Scale, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface Topic {
  slug: string;
  title: string;
  description: string;
  icon?: string;
}

interface CornerPreviewProps {
  title: string;
  subtitle: string;
  basePath: string;
  topics: Topic[];
}

const topicIcons: Record<string, LucideIcon> = {
  activity: Activity,
  brain: Brain,
  briefcase: BriefcaseBusiness,
  clock: Clock3,
  cloud: Cloud,
  compass: Compass,
  heart: Heart,
  smartphone: Smartphone,
  star: Star,
  target: Target,
  users: Users,
  user: UserRound,
  shield: Shield,
  balance: Scale,
  zap: Zap,
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42 } },
};

export function CornerPreview({ title, subtitle, basePath, topics }: CornerPreviewProps) {
  const reduceMotion = useReducedMotion();
  const isStudent = basePath === "/student";
  const eyebrow = isStudent ? "For the classroom and beyond" : "For the questions growing up brings";
  const accent = isStudent ? "text-[#b88c43] bg-[#b88c43]/10" : "text-[#8e655e] bg-[#8e655e]/10";
  const headingId = `${basePath.slice(1)}-corner-title`;

  return (
    <section className="relative py-12 md:py-16" aria-labelledby={headingId}>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading id={headingId} eyebrow={eyebrow} title={title} description={subtitle} href={basePath} action="Explore all" />

        <motion.div
          variants={containerVariants}
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
        >
          {topics.slice(0, 3).map((topic, index) => {
            const Icon = topicIcons[topic.icon || ""] || Sparkles;
            return (
              <motion.div key={topic.slug} variants={cardVariants}>
                <Link
                  href={`${basePath}/${topic.slug}`}
                  className="group relative flex h-full min-h-[190px] flex-col overflow-hidden rounded-2xl border border-border/55 bg-surface/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/35 hover:bg-surface hover:shadow-[0_16px_36px_-25px_rgba(80,57,23,.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold md:p-6"
                >
                  <div className="flex items-start justify-between">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
                      <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span className="pt-1 text-[10px] font-medium tabular-nums tracking-[.18em] text-muted/50">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-5 text-base font-medium tracking-tight text-foreground transition-colors group-hover:text-gold-light">{topic.title}</h3>
                  <p className="mt-2 max-w-[34ch] text-sm leading-6 text-secondary/75">{topic.description}</p>
                  <span className="mt-auto flex items-center gap-1.5 pt-5 text-xs font-medium text-gold-muted transition-all group-hover:gap-2 group-hover:text-gold-light">
                    Read topic <ArrowRight size={13} aria-hidden="true" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
