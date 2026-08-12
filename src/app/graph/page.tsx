"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Search, 
  Sparkles, 
  ArrowRight, 
  X, 
  BookOpen, 
  Flame, 
  ShieldAlert, 
  Compass, 
  HelpCircle,
  Filter,
  RefreshCw,
  Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define node categories
type NodeType = "root" | "virtue" | "source" | "struggle" | "solution";

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  category: string;
  x: number;
  y: number;
  arabic?: string;
  quote?: string;
  description: string;
  actionStep?: string;
  link?: string;
}

interface GraphLink {
  source: string;
  target: string;
  label?: string;
}

// 25+ Interconnected Nodes covering Imam Ali's wisdom -> Modern Struggles -> Practical Solutions
const GRAPH_NODES: GraphNode[] = [
  // --- CENTER HUB ---
  {
    id: "imam_ali",
    label: "Imam Ali (AS)",
    type: "root",
    category: "Foundation of Wisdom",
    x: 600,
    y: 400,
    arabic: "سلوني قبل أن تفقدوني",
    quote: "Ask me before you lose me, for I am more knowledgeable of the paths of heaven than the paths of the earth.",
    description: "The timeless fountainhead of spiritual, intellectual, and psychological wisdom for human dignity.",
    link: "/wisdom"
  },

  // --- CORE VIRTUES & THEMES (Blue / Sapphire) ---
  {
    id: "v_patience",
    label: "Patience (Sabr)",
    type: "virtue",
    category: "Core Virtues",
    x: 420,
    y: 280,
    arabic: "الصَّبْرُ كَفِيلٌ بِالنَّصْرِ",
    quote: "Patience guarantees victory.",
    description: "Disciplined endurance while staying focused on present duties rather than spiraling in fear.",
    actionStep: "Breathe, pray, and take one small action before revisiting your anxiety.",
    link: "/wisdom/patience-in-hardship"
  },
  {
    id: "v_time",
    label: "Value of Time",
    type: "virtue",
    category: "Core Virtues",
    x: 780,
    y: 280,
    arabic: "يَا بْنَ آدَمَ إِنَّمَا أَنْتَ أَيَّامٌ",
    quote: "You are but a collection of days — when one day passes, a part of you is gone.",
    description: "Time is finite capital. Every scroll steals hours you can never buy back.",
    actionStep: "Set a 25-minute focus block before opening social media.",
    link: "/wisdom/value-of-youth-and-health"
  },
  {
    id: "v_knowledge",
    label: "Seeking Knowledge",
    type: "virtue",
    category: "Core Virtues",
    x: 780,
    y: 520,
    arabic: "طَلَبُ الْعِلْمِ فَرِيضَةٌ",
    quote: "Seeking knowledge is an obligation, and effort invites divine help.",
    description: "Learning is not just for exams; it is sharpening the soul to see truth and resist injustice.",
    actionStep: "Break revision into 10-minute micro sessions instead of fearing failure.",
    link: "/wisdom/knowledge-seeks-the-eager"
  },
  {
    id: "v_self_mastery",
    label: "Self Mastery (Nafs)",
    type: "virtue",
    category: "Core Virtues",
    x: 420,
    y: 520,
    arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ",
    quote: "The strong one is he who controls himself when anger or desire rises.",
    description: "True freedom is choosing what dignifies you rather than obeying every digital impulse.",
    actionStep: "Delay impulsive replies or scroll sessions by 1 hour.",
    link: "/wisdom/control-your-anger"
  },
  {
    id: "v_silence",
    label: "Wisdom of Silence",
    type: "virtue",
    category: "Core Virtues",
    x: 300,
    y: 400,
    arabic: "الصَّمْتُ حِكْمَةٌ",
    quote: "Silence is wisdom — excessive speech weakens a person.",
    description: "Not every feeling needs to be texted or posted online immediately.",
    actionStep: "Sleep on emotional messages until Fajr before sending.",
    link: "/wisdom/silence-is-wisdom"
  },
  {
    id: "v_identity",
    label: "Self Knowledge",
    type: "virtue",
    category: "Core Virtues",
    x: 900,
    y: 400,
    arabic: "مَنْ عَرَفَ نَفْسَهُ",
    quote: "Whoever knows themselves draws nearer to knowing their Lord.",
    description: "Your worth is an eternal soul honored by Allah, not a curated online brand.",
    actionStep: "Write 3 truths about yourself that need no online approval.",
    link: "/wisdom/know-yourself"
  },

  // --- AUTHENTIC SOURCES (Emerald Green) ---
  {
    id: "s_letter31",
    label: "Letter 31 (To My Son)",
    type: "source",
    category: "Nahjul Balagha",
    x: 240,
    y: 180,
    quote: "Do not let yourself be enslaved by others when Allah has created you free.",
    description: "Imam Ali's masterclass advice to youth on emotional independence, character, and life choices.",
    link: "/wisdom/patience-in-hardship"
  },
  {
    id: "s_sermon42",
    label: "Sermon 42 (Desires & Hope)",
    type: "source",
    category: "Nahjul Balagha",
    x: 920,
    y: 180,
    quote: "The thing I fear most for you is following desires and length of hopes.",
    description: "Warning against false security, endless procrastination, and forgetting mortality.",
    link: "/wisdom/value-of-youth-and-health"
  },
  {
    id: "s_saying10",
    label: "Saying 10 (Social Ties)",
    type: "source",
    category: "Nahjul Balagha",
    x: 200,
    y: 580,
    quote: "Live amongst people such that if you die they weep for you, and if you live they yearn for you.",
    description: "Building genuine, compassionate human relationships based on character.",
    link: "/wisdom/true-friendship"
  },
  {
    id: "s_saying147",
    label: "Saying 147 (To Kumayl)",
    type: "source",
    category: "Nahjul Balagha",
    x: 960,
    y: 580,
    quote: "O Kumayl! People are of three types: divine scholars, seekers of salvation, and rabble following every wind.",
    description: "The famous sermon to Kumayl ibn Ziyad on protecting the heart from toxic social influences.",
    link: "/wisdom/knowledge-seeks-the-eager"
  },
  {
    id: "s_saying118",
    label: "Saying 118 (Endurance)",
    type: "source",
    category: "Nahjul Balagha",
    x: 600,
    y: 180,
    quote: "Endure pain, or you will never taste ease.",
    description: "Discipline precedes dignity.",
    link: "/wisdom/patience-in-hardship"
  },

  // --- MODERN STRUGGLES (Ruby Red) ---
  {
    id: "i_exam_anxiety",
    label: "Exam Anxiety",
    type: "struggle",
    category: "Modern Struggles",
    x: 260,
    y: 300,
    description: "Overthinking upcoming exams and fear of failure overwhelming focus.",
    actionStep: "Write your worry on paper, do 5 minutes of dua, then start 1 topic.",
    link: "/student/exam-anxiety"
  },
  {
    id: "i_doomscrolling",
    label: "Doomscrolling & Feed",
    type: "struggle",
    category: "Modern Struggles",
    x: 940,
    y: 300,
    description: "Infinite scroll hijacking attention and draining daily motivation.",
    actionStep: "Remove social media apps from your main screen for 24 hours.",
    link: "/student/social-media-addiction"
  },
  {
    id: "i_loneliness",
    label: "Loneliness & Isolation",
    type: "struggle",
    category: "Modern Struggles",
    x: 140,
    y: 480,
    description: "Feeling disconnected despite hundreds of followers and group chats.",
    actionStep: "Reach out to one genuine friend or family member offline today.",
    link: "/youth/loneliness"
  },
  {
    id: "i_validation",
    label: "Validation Addiction",
    type: "struggle",
    category: "Modern Struggles",
    x: 1040,
    y: 480,
    description: "Measuring personal self-worth by likes, views, and external approval.",
    actionStep: "Spend one full day doing good deeds without telling or posting anyone.",
    link: "/youth/validation-addiction"
  },
  {
    id: "i_laziness",
    label: "Procrastination",
    type: "struggle",
    category: "Modern Struggles",
    x: 740,
    y: 640,
    description: "Paralysis in starting important work or studying due to perfectionism.",
    actionStep: "Use the 5-minute rule: commit to just 5 minutes of work right now.",
    link: "/student/laziness"
  },
  {
    id: "i_relationships",
    label: "Toxic Attachments",
    type: "struggle",
    category: "Modern Struggles",
    x: 440,
    y: 640,
    description: "Impulsive late-night messaging and compromise of self-respect.",
    actionStep: "Pause before texting: ask if this message protects your dignity.",
    link: "/youth/haram-relationships"
  },
  {
    id: "i_career",
    label: "Career Pressure",
    type: "struggle",
    category: "Modern Struggles",
    x: 600,
    y: 620,
    description: "Comparing your professional trajectory with peers online.",
    actionStep: "Measure growth against your past self, not someone else's highlight reel.",
    link: "/student/career-pressure"
  },

  // --- ACTION SOLUTIONS (Amethyst Purple) ---
  {
    id: "act_before_text",
    label: "Before You Text",
    type: "solution",
    category: "Practical Tools",
    x: 320,
    y: 720,
    description: "Interactive reflection tool to pause between emotional impulse and message.",
    actionStep: "Use the /before-you-text interactive prompt.",
    link: "/before-you-text"
  },
  {
    id: "act_pomodoro",
    label: "Deep Work Sessions",
    type: "solution",
    category: "Practical Tools",
    x: 880,
    y: 720,
    description: "Structuring study into 25-minute focused blocks with full phone silence.",
    actionStep: "Start a 25-minute timer now.",
    link: "/student/focus-productivity"
  },
  {
    id: "act_reflection",
    label: "Daily Reflections",
    type: "solution",
    category: "Practical Tools",
    x: 600,
    y: 740,
    description: "5-minute daily habit of reading one authentic saying of Imam Ali (AS).",
    actionStep: "Build your streak by reflecting on today's wisdom card.",
    link: "/wisdom"
  },
  {
    id: "act_ai_search",
    label: "Imam Ali AI Advisor",
    type: "solution",
    category: "Practical Tools",
    x: 100,
    y: 360,
    description: "RAG-powered AI search grounding your life questions in authentic sources.",
    actionStep: "Ask a question about stress, focus, or purpose.",
    link: "/search"
  }
];

const GRAPH_LINKS: GraphLink[] = [
  // Center to Virtues
  { source: "imam_ali", target: "v_patience" },
  { source: "imam_ali", target: "v_time" },
  { source: "imam_ali", target: "v_knowledge" },
  { source: "imam_ali", target: "v_self_mastery" },
  { source: "imam_ali", target: "v_silence" },
  { source: "imam_ali", target: "v_identity" },

  // Center to Sources
  { source: "imam_ali", target: "s_saying118" },

  // Virtues to Sources
  { source: "v_patience", target: "s_letter31" },
  { source: "v_time", target: "s_sermon42" },
  { source: "v_silence", target: "s_saying10" },
  { source: "v_knowledge", target: "s_saying147" },

  // Virtues to Struggles
  { source: "v_patience", target: "i_exam_anxiety" },
  { source: "v_time", target: "i_doomscrolling" },
  { source: "v_self_mastery", target: "i_relationships" },
  { source: "v_silence", target: "i_loneliness" },
  { source: "v_identity", target: "i_validation" },
  { source: "v_knowledge", target: "i_laziness" },
  { source: "imam_ali", target: "i_career" },

  // Struggles to Solutions
  { source: "i_exam_anxiety", target: "act_ai_search" },
  { source: "i_relationships", target: "act_before_text" },
  { source: "i_doomscrolling", target: "act_pomodoro" },
  { source: "i_laziness", target: "act_pomodoro" },
  { source: "i_career", target: "act_reflection" },
  { source: "i_validation", target: "act_reflection" }
];

export default function KnowledgeGraphPage() {
  const router = useRouter();
  const [zoom, setZoom] = useState(0.9);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [links, setLinks] = useState<GraphLink[]>(GRAPH_LINKS);
  const [nodes, setNodes] = useState<GraphNode[]>(GRAPH_NODES);

  // SVG viewBox pan offset
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Dynamically fetch any new published cards/articles from CMS API and add to graph
  useEffect(() => {
    async function loadDynamicContent() {
      try {
        const res = await fetch("/api/content");
        if (!res.ok) return;
        const data = await res.json();
        if (!data?.items || !Array.isArray(data.items) || data.items.length === 0) return;

        const newNodes: GraphNode[] = [...GRAPH_NODES];
        const newLinks: GraphLink[] = [...GRAPH_LINKS];

        const dynamicRadius = 480;
        const angleStep = (2 * Math.PI) / Math.max(1, data.items.length);

        data.items.forEach((item: any, idx: number) => {
          const nodeId = item.slug || item.id;
          if (newNodes.some(n => n.id === nodeId)) return;

          const angle = idx * angleStep;
          const x = Math.round(600 + dynamicRadius * Math.cos(angle));
          const y = Math.round(400 + dynamicRadius * Math.sin(angle));

          let type: NodeType = "source";
          if (item.category === "Student Corner" || item.category === "Youth Corner") {
            type = "struggle";
          } else if (item.category === "Imam Ali Says" || item.category === "Nahjul Balagha") {
            type = "source";
          } else {
            type = "virtue";
          }

          const newNode: GraphNode = {
            id: nodeId,
            label: item.title || item.slug,
            type,
            category: item.category || "CMS Content",
            x,
            y,
            arabic: item.arabic_text || item.narrations?.[0]?.arabic || undefined,
            quote: item.excerpt || item.english_translation || item.summary || undefined,
            description: item.main_explanation || item.seo_description || item.excerpt || "Dynamically added wisdom card from Admin CMS.",
            actionStep: Array.isArray(item.action_steps) && item.action_steps.length > 0 ? item.action_steps[0] : undefined,
            link: item.category === "Articles" ? `/articles/${item.slug}` : `/wisdom/${item.slug}`
          };

          newNodes.push(newNode);
          newLinks.push({ source: "imam_ali", target: newNode.id });

          if (Array.isArray(item.tags)) {
            item.tags.forEach((tag: string) => {
              const match = newNodes.find(n => n.id !== newNode.id && n.label.toLowerCase().includes(String(tag).toLowerCase()));
              if (match) {
                newLinks.push({ source: match.id, target: newNode.id });
              }
            });
          }
        });

        setNodes(newNodes);
        setLinks(newLinks);
      } catch (e) {
        console.warn("Failed to load dynamic graph content", e);
      }
    }

    loadDynamicContent();
  }, []);

  // Get color by type
  const getNodeConfig = (type: NodeType) => {
    switch (type) {
      case "root":
        return {
          bg: "#C7A654",
          stroke: "#F3E5AB",
          glow: "rgba(199, 166, 84, 0.6)",
          radius: 36,
          labelColor: "#F3E5AB"
        };
      case "virtue":
        return {
          bg: "#3B82F6",
          stroke: "#93C5FD",
          glow: "rgba(59, 130, 246, 0.5)",
          radius: 24,
          labelColor: "#93C5FD"
        };
      case "source":
        return {
          bg: "#10B981",
          stroke: "#6EE7B7",
          glow: "rgba(16, 185, 129, 0.5)",
          radius: 20,
          labelColor: "#6EE7B7"
        };
      case "struggle":
        return {
          bg: "#EF4444",
          stroke: "#FCA5A5",
          glow: "rgba(239, 68, 68, 0.5)",
          radius: 22,
          labelColor: "#FCA5A5"
        };
      case "solution":
        return {
          bg: "#A855F7",
          stroke: "#D8B4FE",
          glow: "rgba(168, 85, 247, 0.5)",
          radius: 22,
          labelColor: "#D8B4FE"
        };
    }
  };

  // Connected node ID set for active node (selected or hovered)
  const connectedNodeIds = useMemo(() => {
    const target = hoveredNode || selectedNode;
    if (!target) return new Set<string>();

    const set = new Set<string>([target.id]);
    links.forEach(link => {
      if (link.source === target.id) set.add(link.target);
      if (link.target === target.id) set.add(link.source);
    });
    return set;
  }, [hoveredNode, selectedNode, links]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      // Type filter
      if (activeFilter !== "all" && node.type !== activeFilter) return false;
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          node.label.toLowerCase().includes(q) ||
          node.description.toLowerCase().includes(q) ||
          (node.quote && node.quote.toLowerCase().includes(q)) ||
          node.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [nodes, activeFilter, searchQuery]);

  // Select node automatically when searching if exact match found
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const match = nodes.find(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()));
      if (match) {
        setSelectedNode(match);
      }
    }
  }, [searchQuery, nodes]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag canvas if clicking background SVG
    if ((e.target as HTMLElement).tagName === "svg" || (e.target as HTMLElement).id === "bg-canvas") {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="h-screen w-full bg-[#08090D] text-foreground flex flex-col overflow-hidden relative select-none">
      
      {/* Dynamic Starfield Background Grid */}
      <div 
        id="bg-canvas"
        className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface-alt/20 via-[#08090D] to-[#040508] opacity-90"
      >
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />
      </div>

      {/* --- TOP BAR & CONTROLS CONTAINER --- */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-[#08090D]/85 border-b border-gold/20 backdrop-blur-xl p-4 md:px-6 md:py-4 shadow-2xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Title & Back */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link 
                href="/" 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/40 text-xs font-semibold text-gold-light hover:bg-gold/20 transition-all"
              >
                &larr; Home
              </Link>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold/80 border border-gold/30 px-2.5 py-0.5 rounded-full bg-gold/10">
                RAG Wisdom Graph
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2 font-display">
              Knowledge Constellation <Sparkles size={18} className="text-gold animate-pulse" />
            </h1>
            <p className="text-xs text-secondary/80 max-w-md hidden sm:block">
              Visually trace how the authentic teachings of Imam Ali (AS) directly address modern struggles.
            </p>
          </div>

          {/* Search & Zoom Controls */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-light" />
              <input
                type="text"
                placeholder="Search anxiety, Letter 31, focus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#13151D] border border-gold/40 text-xs text-white placeholder:text-muted/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50 shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Zoom Buttons */}
            <div className="flex items-center gap-1 bg-[#13151D] border border-gold/30 rounded-xl p-1 shadow-md">
              <button 
                onClick={() => setZoom(z => Math.min(1.8, z + 0.15))} 
                className="p-1.5 rounded-lg hover:bg-gold/20 text-gold-light transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button 
                onClick={() => setZoom(z => Math.max(0.4, z - 0.15))} 
                className="p-1.5 rounded-lg hover:bg-gold/20 text-gold-light transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <button 
                onClick={() => { setZoom(0.9); setPan({ x: 0, y: 0 }); setSelectedNode(null); }} 
                className="p-1.5 rounded-lg hover:bg-gold/20 text-gold-light transition-colors"
                title="Reset View"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* --- CATEGORY FILTER BAR --- */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
          {[
            { id: "all", label: "All Nodes" },
            { id: "struggle", label: "🔴 Modern Struggles" },
            { id: "virtue", label: "🔵 Core Virtues" },
            { id: "source", label: "🟢 Authentic Sources" },
            { id: "solution", label: "🟣 Practical Tools" },
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 border whitespace-nowrap ${
                activeFilter === filter.id
                  ? "bg-gold text-black border-gold shadow-[0_0_15px_rgba(199,166,84,0.4)]"
                  : "bg-[#13151D] border-border/40 text-secondary hover:text-white hover:border-gold/40"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- MAIN GRAPH SVG CANVAS --- */}
      <div 
        className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <motion.div 
          style={{ 
            scale: zoom,
            x: pan.x,
            y: pan.y
          }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="w-full h-full flex items-center justify-center absolute inset-0 origin-center"
        >
          <svg 
            width="1200" 
            height="800" 
            className="overflow-visible absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <defs>
              {/* Glowing Filters */}
              <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Gradient Beam for Links */}
              <linearGradient id="beam-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C7A654" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Orbit Guides around Center */}
            <circle cx="600" cy="400" r="220" fill="none" stroke="rgba(199, 166, 84, 0.08)" strokeDasharray="4 6" />
            <circle cx="600" cy="400" r="380" fill="none" stroke="rgba(59, 130, 246, 0.06)" strokeDasharray="6 8" />

            {/* --- CONNECTIONS / LINKS --- */}
            {links.map((link, idx) => {
              const sourceNode = nodes.find(n => n.id === link.source);
              const targetNode = nodes.find(n => n.id === link.target);
              if (!sourceNode || !targetNode) return null;

              const isSourceFiltered = filteredNodes.some(n => n.id === sourceNode.id);
              const isTargetFiltered = filteredNodes.some(n => n.id === targetNode.id);

              if (!isSourceFiltered && !isTargetFiltered) return null;

              const isHighlighted = 
                (selectedNode && (selectedNode.id === sourceNode.id || selectedNode.id === targetNode.id)) ||
                (hoveredNode && (hoveredNode.id === sourceNode.id || hoveredNode.id === targetNode.id));

              const isBothConnected = 
                (selectedNode && connectedNodeIds.has(sourceNode.id) && connectedNodeIds.has(targetNode.id)) ||
                (hoveredNode && connectedNodeIds.has(sourceNode.id) && connectedNodeIds.has(targetNode.id));

              return (
                <g key={`link-${idx}`}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={
                      isHighlighted || isBothConnected 
                        ? "url(#beam-grad)" 
                        : "rgba(255, 255, 255, 0.08)"
                    }
                    strokeWidth={isHighlighted ? 3 : isBothConnected ? 2 : 1}
                    strokeDasharray={isHighlighted ? "none" : "none"}
                    className="transition-all duration-300"
                  />
                  {/* Energy Pulses on highlighted links */}
                  {(isHighlighted || isBothConnected) && (
                    <circle r="3" fill="#F3E5AB">
                      <animateMotion
                        path={`M ${sourceNode.x} ${sourceNode.y} L ${targetNode.x} ${targetNode.y}`}
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* --- NODES --- */}
            {nodes.map(node => {
              const config = getNodeConfig(node.type);
              const isVisible = filteredNodes.some(n => n.id === node.id);
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode?.id === node.id;
              const isConnected = connectedNodeIds.size > 0 && connectedNodeIds.has(node.id);

              const opacity = !isVisible ? 0.15 : (connectedNodeIds.size > 0 && !isConnected ? 0.35 : 1);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                  }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer transition-opacity duration-300"
                  style={{ opacity }}
                >
                  {/* Pulse Effect for Selected or Central Node */}
                  {(isSelected || node.type === "root") && (
                    <motion.circle
                      r={config.radius + 12}
                      fill="none"
                      stroke={config.bg}
                      strokeWidth={1.5}
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    />
                  )}

                  {/* Outer Glow Halo */}
                  <circle
                    r={config.radius + (isHovered || isSelected ? 8 : 4)}
                    fill={config.glow}
                    className="transition-all duration-300"
                  />

                  {/* Main Circle */}
                  <motion.circle
                    r={config.radius}
                    fill={config.bg}
                    stroke={config.stroke}
                    strokeWidth={isSelected ? 3 : 1.5}
                    animate={{
                      scale: isSelected ? 1.25 : isHovered ? 1.15 : 1
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                    className="shadow-xl"
                  />

                  {/* Central Icon Indicator */}
                  {node.type === "root" && (
                    <text textAnchor="middle" dy="4" fill="#08090D" fontSize="14" fontWeight="bold">
                      🌟
                    </text>
                  )}

                  {/* Node Label Text */}
                  <text
                    y={config.radius + 16}
                    textAnchor="middle"
                    fill={isSelected || isHovered ? "#F3E5AB" : "#FFFFFF"}
                    stroke="#08090D"
                    strokeWidth="3.5"
                    paintOrder="stroke fill"
                    className="text-[11px] font-bold tracking-wide"
                    style={{
                      pointerEvents: "none",
                      filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.9))"
                    }}
                  >
                    {node.label}
                  </text>

                  {/* Category Pill Tag below label */}
                  {(isHovered || isSelected) && (
                    <text
                      y={config.radius + 30}
                      textAnchor="middle"
                      className="text-[9px] fill-muted uppercase tracking-widest font-mono"
                      style={{ pointerEvents: "none" }}
                    >
                      {node.category}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </motion.div>
      </div>

      {/* --- SIDE DETAILS DRAWER (When Node Selected) --- */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="absolute right-4 md:right-6 top-24 bottom-6 w-[90vw] max-w-sm rounded-3xl border border-gold/30 bg-[#0E1017]/95 p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col z-30 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/20">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gold/10 text-gold border border-gold/20">
                {selectedNode.category}
              </span>
              <button 
                onClick={() => setSelectedNode(null)} 
                className="h-8 w-8 rounded-full bg-surface-alt flex items-center justify-center text-muted hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Node Title & Arabic */}
            <div className="my-4 space-y-2">
              <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight font-display">
                {selectedNode.label}
              </h2>
              {selectedNode.arabic && (
                <p className="text-lg text-gold text-right font-arabic leading-relaxed pt-1">
                  {selectedNode.arabic}
                </p>
              )}
            </div>

            {/* Quote / Reflection Box */}
            {selectedNode.quote && (
              <div className="my-3 p-4 rounded-2xl bg-surface-alt/70 border border-gold/20 text-xs italic text-foreground/90 leading-relaxed font-serif">
                &quot;{selectedNode.quote}&quot;
              </div>
            )}

            {/* Description */}
            <div className="space-y-3 text-xs text-muted leading-relaxed my-2">
              <p>{selectedNode.description}</p>
            </div>

            {/* Practical Action Step */}
            {selectedNode.actionStep && (
              <div className="my-4 p-4 rounded-2xl bg-gold/10 border border-gold/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-gold text-[10px] font-bold uppercase tracking-widest">
                  <Flame size={14} /> Practical Action Step
                </div>
                <p className="text-xs text-foreground font-medium leading-relaxed">
                  {selectedNode.actionStep}
                </p>
              </div>
            )}

            {/* Related Connections List */}
            <div className="my-4 space-y-2">
              <h4 className="text-[10px] uppercase tracking-widest text-muted font-bold">Connected Links</h4>
              <div className="flex flex-wrap gap-1.5">
                {links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).map(l => {
                  const connId = l.source === selectedNode.id ? l.target : l.source;
                  const connNode = nodes.find(n => n.id === connId);
                  if (!connNode) return null;
                  return (
                    <button
                      key={connId}
                      onClick={() => setSelectedNode(connNode)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-alt/80 border border-border/30 text-foreground hover:border-gold/40 hover:text-gold transition-all"
                    >
                      {connNode.label} &rarr;
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto pt-4 space-y-2">
              {selectedNode.link && (
                <Link
                  href={selectedNode.link}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gold py-3 px-4 text-xs font-bold text-black shadow-lg hover:bg-gold-light transition-all"
                >
                  <BookOpen size={16} /> Read Full Card / Topic
                </Link>
              )}

              <Link
                href={`/search?q=${encodeURIComponent(selectedNode.label)}`}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-surface-alt border border-border/40 py-2.5 px-4 text-xs font-medium text-muted hover:text-foreground hover:border-gold/30 transition-all"
              >
                <Sparkles size={14} className="text-gold" /> Ask AI about &quot;{selectedNode.label}&quot;
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- BOTTOM LEGEND BAR --- */}
      <footer className="absolute bottom-4 left-4 right-4 md:left-6 md:right-6 pointer-events-none z-20 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted">
        {/* Node Color Legend */}
        <div className="flex items-center gap-4 bg-surface-alt/90 border border-border/40 px-4 py-2 rounded-2xl backdrop-blur-md pointer-events-auto overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#C7A654] shadow-[0_0_8px_#C7A654]" />
            <span className="text-foreground">Central Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#EF4444] shadow-[0_0_8px_#EF4444]" />
            <span className="text-foreground">Modern Struggles</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#3B82F6] shadow-[0_0_8px_#3B82F6]" />
            <span className="text-foreground">Virtues</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
            <span className="text-foreground">Authentic Sources</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#A855F7] shadow-[0_0_8px_#A855F7]" />
            <span className="text-foreground">Practical Tools</span>
          </div>
        </div>

        {/* Tip */}
        <div className="hidden lg:flex items-center gap-2 bg-surface-alt/90 border border-border/40 px-3 py-1.5 rounded-2xl backdrop-blur-md text-[10px]">
          <Compass size={12} className="text-gold animate-spin" style={{ animationDuration: "12s" }} />
          <span>Click any node to reveal Arabic text, authentic quotes & practical action steps.</span>
        </div>
      </footer>

    </div>
  );
}
