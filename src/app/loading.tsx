"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
      {/* Hero Skeleton Section */}
      <div className="flex flex-col items-center justify-center space-y-6 pt-12 pb-8">
        <div className="h-10 w-3/4 max-w-lg bg-surface border border-gold/10 rounded-xl animate-pulse" />
        <div className="h-4 w-1/2 max-w-sm bg-surface-elevated rounded-lg animate-pulse" />
        <div className="h-4 w-1/3 max-w-xs bg-surface-elevated rounded-lg animate-pulse delay-75" />
      </div>

      {/* Grid Skeletons (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card-cinematic p-8 space-y-6 h-72 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-1/3 bg-gold/20 rounded-md animate-pulse" />
                <div className="h-8 w-8 rounded-full bg-surface-elevated animate-pulse" />
              </div>
              <div className="space-y-3 pt-4">
                <div className="h-6 w-full bg-surface-elevated rounded-md animate-pulse" />
                <div className="h-6 w-5/6 bg-surface-elevated rounded-md animate-pulse delay-75" />
                <div className="h-4 w-2/3 bg-surface rounded-md animate-pulse delay-100" />
              </div>
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-border/20">
              <div className="h-4 w-1/4 bg-surface-elevated rounded-md animate-pulse" />
              <div className="h-8 w-24 bg-surface rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
