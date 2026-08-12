"use client";

import { useState } from "react";
import { Network, ZoomIn, ZoomOut, Maximize, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Mock graph data (Wisdom -> Topics -> Issues)
const nodes = [
  { id: "root", label: "Imam Ali (AS)", type: "root", x: 400, y: 300 },
  
  // Topics
  { id: "t_patience", label: "Patience", type: "topic", x: 200, y: 200 },
  { id: "t_knowledge", label: "Knowledge", type: "topic", x: 600, y: 150 },
  { id: "t_time", label: "Time & Focus", type: "topic", x: 650, y: 400 },
  { id: "t_ego", label: "Ego & Humility", type: "topic", x: 150, y: 450 },

  // Specific Quotes/Sermons
  { id: "s_10", label: "Saying 10", type: "source", x: 100, y: 100 },
  { id: "s_118", label: "Saying 118", type: "source", x: 750, y: 350 },
  { id: "s_54", label: "Saying 54", type: "source", x: 700, y: 50 },
  { id: "l_31", label: "Letter 31", type: "source", x: 50, y: 350 },

  // Human Issues
  { id: "i_anxiety", label: "Exam Anxiety", type: "issue", x: 100, y: 300 },
  { id: "i_distraction", label: "Distraction", type: "issue", x: 500, y: 500 },
  { id: "i_jealousy", label: "Jealousy", type: "issue", x: 300, y: 550 },
];

const links = [
  { source: "root", target: "t_patience" },
  { source: "root", target: "t_knowledge" },
  { source: "root", target: "t_time" },
  { source: "root", target: "t_ego" },
  
  { source: "t_patience", target: "s_10" },
  { source: "t_patience", target: "l_31" },
  { source: "t_time", target: "s_118" },
  { source: "t_knowledge", target: "s_54" },

  { source: "t_patience", target: "i_anxiety" },
  { source: "t_time", target: "i_distraction" },
  { source: "t_ego", target: "i_jealousy" },
];

export default function KnowledgeGraphPage() {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  const getNodeColor = (type: string) => {
    switch (type) {
      case "root": return "rgba(199, 166, 84, 1)"; // gold
      case "topic": return "rgba(59, 130, 246, 0.8)"; // blue
      case "source": return "rgba(16, 185, 129, 0.8)"; // emerald
      case "issue": return "rgba(239, 68, 68, 0.8)"; // red
      default: return "rgba(255, 255, 255, 0.5)";
    }
  };

  const getNodeSize = (type: string) => {
    switch (type) {
      case "root": return 40;
      case "topic": return 25;
      case "source": return 15;
      case "issue": return 20;
      default: return 10;
    }
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden relative">
      
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pointer-events-none">
        <div className="space-y-2 pointer-events-auto">
          <Link href="/" className="inline-block px-4 py-2 rounded-xl bg-surface-alt/80 border border-border/40 text-xs font-bold hover:bg-surface-elevated transition-colors">
            &larr; Home
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground drop-shadow-lg">Knowledge Constellation</h1>
          <p className="text-xs text-muted max-w-sm">Visually explore how the wisdom of Imam Ali (AS) connects to modern human struggles.</p>
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <button onClick={() => setZoom(z => Math.min(2, z + 0.2))} className="p-2 rounded-xl bg-surface-alt/80 border border-border/40 hover:bg-surface-elevated text-foreground">
            <ZoomIn size={18} />
          </button>
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="p-2 rounded-xl bg-surface-alt/80 border border-border/40 hover:bg-surface-elevated text-foreground">
            <ZoomOut size={18} />
          </button>
          <button onClick={() => setZoom(1)} className="p-2 rounded-xl bg-surface-alt/80 border border-border/40 hover:bg-surface-elevated text-foreground">
            <Maximize size={18} />
          </button>
        </div>
      </div>

      {/* SVG Graph Area */}
      <div className="flex-1 w-full h-full relative cursor-move bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface-alt via-background to-background">
        <motion.div 
          drag 
          dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
          style={{ scale: zoom }}
          className="w-full h-full flex items-center justify-center absolute inset-0 origin-center"
        >
          <svg width="1200" height="800" className="overflow-visible absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* Draw Links */}
            {links.map((link, i) => {
              const sourceNode = nodes.find(n => n.id === link.source);
              const targetNode = nodes.find(n => n.id === link.target);
              if (!sourceNode || !targetNode) return null;
              
              const isHighlighted = selectedNode && (selectedNode.id === sourceNode.id || selectedNode.id === targetNode.id);
              
              return (
                <motion.line
                  key={`link-${i}`}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={isHighlighted ? "rgba(199, 166, 84, 0.6)" : "rgba(255,255,255,0.1)"}
                  strokeWidth={isHighlighted ? 2 : 1}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: i * 0.1 }}
                />
              );
            })}

            {/* Draw Nodes */}
            {nodes.map((node) => {
              const r = getNodeSize(node.type);
              const isSelected = selectedNode?.id === node.id;
              
              return (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer"
                >
                  <motion.circle
                    r={r}
                    fill={getNodeColor(node.type)}
                    className="drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    initial={{ scale: 0 }}
                    animate={{ scale: isSelected ? 1.2 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                  {/* Outer pulse ring if selected */}
                  {isSelected && (
                    <motion.circle
                      r={r + 5}
                      fill="none"
                      stroke={getNodeColor(node.type)}
                      strokeWidth={2}
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                  
                  {/* Label */}
                  <text 
                    y={r + 15} 
                    textAnchor="middle" 
                    fill="currentColor" 
                    className={`text-[10px] font-bold ${isSelected ? 'text-gold fill-gold' : 'text-foreground/80 fill-current'}`}
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </motion.div>
      </div>

      {/* Node Info Sidebar Overlay */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute right-6 top-24 bottom-6 w-80 rounded-3xl border border-gold/30 bg-surface-alt/90 p-6 shadow-2xl backdrop-blur-xl flex flex-col z-30"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest border border-gold/20">
                {selectedNode.type}
              </span>
              <button onClick={() => setSelectedNode(null)} className="text-muted hover:text-foreground">✕</button>
            </div>
            
            <h3 className="text-2xl font-bold text-foreground mb-4">{selectedNode.label}</h3>
            
            <p className="text-sm text-muted leading-relaxed mb-6">
              {selectedNode.type === "topic" && `Discover how ${selectedNode.label} is addressed in the teachings of Imam Ali (AS).`}
              {selectedNode.type === "issue" && `A modern human struggle related to ${selectedNode.label}.`}
              {selectedNode.type === "source" && `An authentic saying or letter from Nahjul Balagha.`}
              {selectedNode.type === "root" && `The foundational wisdom of the Commander of the Faithful.`}
            </p>

            <div className="mt-auto space-y-3">
              <Link href="/wisdom" className="flex items-center justify-center gap-2 w-full rounded-xl bg-gold py-3 text-xs font-bold text-black shadow-lg hover:bg-gold-light transition-all">
                <Network size={16} /> Explore Connections
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
