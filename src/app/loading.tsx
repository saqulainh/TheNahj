"use client";

import { Loader } from "@/components/ui/Loader";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
      <Loader size="12rem" />
    </div>
  );
}
