"use client";

import { useEffect } from "react";
import { RefreshCw, AlertCircle, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="card-cinematic max-w-lg w-full p-10 flex flex-col items-center relative overflow-hidden"
      >
        {/* Decorative Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gold/10 blur-[50px] -z-10" />

        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8">
          <AlertCircle className="w-10 h-10 text-red-500/80" />
        </div>

        <h2 className="font-cinematic-title text-3xl mb-4 text-foreground">
          A Moment of Patience
        </h2>
        
        <p className="text-secondary mb-8 font-arabic text-xl leading-relaxed">
          وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ
        </p>
        
        <p className="text-muted text-sm mb-10 max-w-sm italic">
          "And seek help through patience and prayer..." (Quran 2:45)<br/>
          Something went wrong on our end, but peace is always within reach.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 btn-cinematic-wrapper group"
          >
            <div className="btn-cinematic bg-gold/10 border-gold/30 hover:bg-gold/20 text-foreground w-full py-4 rounded-xl flex items-center justify-center space-x-2 transition-all">
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
              <span>Try Again</span>
            </div>
          </button>
          
          <Link href="/" className="flex-1 btn-cinematic-wrapper group">
            <div className="btn-cinematic bg-surface border-border hover:bg-surface-elevated text-foreground w-full py-4 rounded-xl flex items-center justify-center space-x-2 transition-all">
              <Home className="w-4 h-4 text-gold/80" />
              <span>Return Home</span>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
