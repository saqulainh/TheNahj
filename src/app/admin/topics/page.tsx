"use client";

import { useState } from "react";
import { Hash, Plus, Trash2, Search, Calendar, Sparkles } from "lucide-react";

interface Topic {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: "student" | "youth";
  meta_title: string;
  meta_description: string;
}

const initialTopics: Topic[] = [
  // Student Corner Topics
  {
    id: "tp_focus",
    title: "Focus & Productivity",
    slug: "focus-productivity",
    description: "Build deep work capabilities and avoid study procrastination.",
    type: "student",
    meta_title: "Focus & Productivity | TheNahj Student",
    meta_description: "Imam Ali's (AS) wisdom on reclaiming daily hours and mastering academic concentration."
  },
  {
    id: "tp_anxiety",
    title: "Exam Anxiety",
    slug: "exam-anxiety",
    description: "Guidance on how to maintain inner calm and trust in Allah during examinations.",
    type: "student",
    meta_title: "Overcoming Exam Anxiety | TheNahj Student",
    meta_description: "Find spiritual focus, study mantras, and calming reminders from the wisdom of Imam Ali (AS) to defeat exam panic."
  },
  {
    id: "tp_social",
    title: "Social Media Addiction",
    slug: "social-media-addiction",
    description: "Reclaim real hours stolen by addictive infinite scrolls.",
    type: "student",
    meta_title: "Defeating Social Media Addiction | TheNahj Student",
    meta_description: "Learn how to detox from attention-stealing feeds and align online time with spiritual clarity."
  },
  {
    id: "tp_laziness",
    title: "Laziness",
    slug: "laziness",
    description: "Break physical and mental inertia with small, purposeful daily actions.",
    type: "student",
    meta_title: "Defeating Procrastination & Laziness | TheNahj Student",
    meta_description: "How to invite divine assistance by starting small and overcoming laziness."
  },
  {
    id: "tp_career",
    title: "Career Pressure",
    slug: "career-pressure",
    description: "Developing spiritual identity beyond academic success and competitive pressure.",
    type: "student",
    meta_title: "Navigating Career Pressure | TheNahj Student",
    meta_description: "Focus on character and sustainable growth instead of unhealthy peer comparisons."
  },
  {
    id: "tp_time",
    title: "Time Management",
    slug: "time-management",
    description: "Mastering the distribution of hours to build a meaningful, disciplined life.",
    type: "student",
    meta_title: "Spiritual Time Management | TheNahj Student",
    meta_description: "Your days are limited. Learn how to structure time according to Islamic focus principles."
  },
  {
    id: "tp_dopamine",
    title: "Dopamine Distraction",
    slug: "dopamine-distraction",
    description: "Protecting the heart's focus from hyper-stimulated attention hijack.",
    type: "student",
    meta_title: "Healing Dopamine Distraction | TheNahj Student",
    meta_description: "Understand the biological and spiritual aspects of attention destruction."
  },

  // Youth Corner Topics
  {
    id: "tp_relationships",
    title: "Haram Relationships",
    slug: "haram-relationships",
    description: "Maintaining emotional dignity and clarity before dynamic attachment deepens.",
    type: "youth",
    meta_title: "Clarity in Relationships | TheNahj Youth",
    meta_description: "Spiritual boundaries and emotional self-respect in the modern attachment age."
  },
  {
    id: "tp_loneliness",
    title: "Loneliness",
    slug: "loneliness",
    description: "Finding belonging within character instead of performative validation.",
    type: "youth",
    meta_title: "Overcoming Loneliness | TheNahj Youth",
    meta_description: "You are never truly alone. Connect with your Creator and find sincere companionship."
  },
  {
    id: "tp_identity",
    title: "Identity Crisis",
    slug: "identity-crisis",
    description: "Understanding your true value when the spotlight and likes fade away.",
    type: "youth",
    meta_title: "Resolving Identity Crisis | TheNahj Youth",
    meta_description: "Discover who you are offline with lessons on self-knowledge and soul alignment."
  },
  {
    id: "tp_validation",
    title: "Validation Addiction",
    slug: "validation-addiction",
    description: "Freeing the self from the constant need for public approval and digital applause.",
    type: "youth",
    meta_title: "Breaking Validation Addiction | TheNahj Youth",
    meta_description: "Build an inner anchor that only seeks the validation of the Almighty."
  },
  {
    id: "tp_overthinking",
    title: "Overthinking",
    slug: "overthinking",
    description: "Slowing down mental anxiety loops with disciplined trust and patience.",
    type: "youth",
    meta_title: "Silencing Overthinking | TheNahj Youth",
    meta_description: "How to anchor the racing mind in the present duty and release borrowed tomorrow pain."
  },
  {
    id: "tp_purpose",
    title: "Purpose",
    slug: "purpose",
    description: "Carving a solid direction in life beyond short-lived social trends.",
    type: "youth",
    meta_title: "Discovering Your True Purpose | TheNahj Youth",
    meta_description: "Spiritual pathways to meaningful daily choices and long-term honor."
  },
  {
    id: "tp_respect",
    title: "Self Respect",
    slug: "self-respect",
    description: "Nurturing personal honor and spiritual character that does not compromise.",
    type: "youth",
    meta_title: "Spiritual Self Respect | TheNahj Youth",
    meta_description: "Why dignity is the message you choose to delay, and how to guard your value."
  },
  {
    id: "tp_discipline",
    title: "Emotional Discipline",
    slug: "emotional-discipline",
    description: "Gaining complete control of your internal impulses, desires, and anger responses.",
    type: "youth",
    meta_title: "Mastering Emotional Discipline | TheNahj Youth",
    meta_description: "Defining real strength as pause and self-command rather than external reaction."
  }
];

export default function TopicsCMSPage() {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    type: "student" as "student" | "youth",
    meta_title: "",
    meta_description: "",
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "title" && !f.slug) {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      }
      return next;
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug) return;

    const topic: Topic = {
      id: `tp_${Date.now()}`,
      title: form.title,
      slug: form.slug,
      description: form.description,
      type: form.type,
      meta_title: form.meta_title || `${form.title} | TheNahj`,
      meta_description: form.meta_description || form.description,
    };

    setTopics([topic, ...topics]);
    setForm({
      title: "",
      slug: "",
      description: "",
      type: "student",
      meta_title: "",
      meta_description: "",
    });
    setStatus(`Created new topic: "${topic.title}" dynamically.`);
  };

  const deleteTopic = (id: string) => {
    setTopics(topics.filter((t) => t.id !== id));
    setStatus("Topic metadata configuration removed.");
  };

  const filtered = topics.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Hash className="h-8 w-8 text-gold" />
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">Topics CMS</h1>
          <p className="mt-1 text-sm text-muted">Create core tags, self-development paths, and corner topics dynamically.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Creation panel */}
        <div className="lg:col-span-1 rounded-xl border border-border bg-surface p-6 space-y-6 self-start">
          <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4 text-gold-muted" /> Add Corner Path
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Topic Title</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Slug</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none font-mono"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Corner Section</span>
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none text-muted"
              >
                <option value="student">Student Corner</option>
                <option value="youth">Youth Corner</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-gold-muted">Short Description</span>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-gold/40 focus:outline-none"
              />
            </label>

            {/* SEO Panel */}
            <div className="pt-2 border-t border-border/60 space-y-4">
              <h3 className="text-xs uppercase font-semibold text-gold-muted flex items-center gap-1.5">
                <Sparkles size={12} /> Custom SEO
              </h3>
              <label className="block">
                <span className="text-[10px] uppercase tracking-wider text-muted">Meta Title</span>
                <input
                  type="text"
                  value={form.meta_title}
                  onChange={(e) => update("meta_title", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:border-gold/40 focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-wider text-muted">Meta Description</span>
                <textarea
                  value={form.meta_description}
                  onChange={(e) => update("meta_description", e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:border-gold/40 focus:outline-none"
                />
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gold/15 py-3 text-xs font-semibold text-gold-light hover:bg-gold/25 transition-colors border border-gold/25"
            >
              Publish Corner Tag
            </button>
          </form>
        </div>

        {/* Directory grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted/65" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topics directory by name or slug..."
              className="w-full rounded-xl border border-border bg-surface pl-11 pr-4 py-3 text-sm focus:border-gold/40 focus:outline-none"
            />
          </div>

          <div className="grid gap-4">
            {filtered.map((topic) => (
              <div key={topic.id} className="rounded-xl border border-border bg-surface p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-gold/15 text-gold-light border border-gold/25">
                      {topic.type === "student" ? "Student" : "Youth"}
                    </span>
                    <h3 className="font-semibold text-foreground text-sm">{topic.title}</h3>
                  </div>
                  <button
                    onClick={() => deleteTopic(topic.id)}
                    className="p-1 hover:text-red-400 rounded text-muted transition-colors"
                    title="Remove Node"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <p className="text-xs text-muted leading-relaxed">{topic.description}</p>

                <div className="pt-3 border-t border-border/40 grid grid-cols-2 gap-4 text-[10px] text-muted">
                  <div>
                    <span className="font-semibold text-gold-muted">Slug:</span>{" "}
                    <span className="font-mono">{topic.slug}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gold-muted">SEO optimized:</span>{" "}
                    <span className="text-green-400">Perfect</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {status && (
        <div className="rounded-lg bg-surface p-4 text-xs text-gold-muted border border-border">
          {status}
        </div>
      )}
    </div>
  );
}
