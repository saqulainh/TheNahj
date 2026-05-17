import { PomodoroTimer } from "@/components/focus/PomodoroTimer";

export const metadata = {
  title: "Deep Focus Mode",
  description: "Pomodoro timer with wisdom quotes — minimal distractions, dark immersive UI, ambient sounds.",
};

export default function FocusPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-gold-muted">
          Deep Focus Mode
        </p>
        <h1 className="mb-4 text-center text-2xl font-medium text-foreground md:text-3xl">
          One task. One session. One breath.
        </h1>
        <p className="mb-14 max-w-md text-center text-sm text-muted/70">
          Put your phone face down. Close other tabs. This is your space to work with intention.
        </p>

        <PomodoroTimer />
      </div>
    </div>
  );
}
