export function ImmersiveArticleSkeleton() {
  return (
    <div className="animate-pulse bg-background pb-16 pt-20">
      <div className="border-b border-border/20">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8">
          <div className="h-6 w-28 rounded-full bg-surface-elevated" />
          <div className="mt-6 h-12 w-3/4 rounded-xl bg-surface-elevated" />
          <div className="mt-4 h-6 w-1/2 rounded-xl bg-surface-elevated" />
        </div>
      </div>
      <div className="mx-auto mt-8 grid max-w-7xl grid-cols-1 gap-8 px-5 md:px-8 xl:grid-cols-[200px_1fr_280px]">
        <div className="hidden xl:block h-72 rounded-2xl bg-surface-elevated" />
        <div className="rounded-2xl border border-border/25 bg-surface/60 p-6 md:p-10">
          <div className="h-10 w-2/3 rounded-xl bg-surface-elevated" />
          <div className="mt-6 space-y-4">
            <div className="h-4 w-full rounded bg-surface-elevated" />
            <div className="h-4 w-11/12 rounded bg-surface-elevated" />
            <div className="h-4 w-10/12 rounded bg-surface-elevated" />
            <div className="h-4 w-full rounded bg-surface-elevated" />
            <div className="h-4 w-9/12 rounded bg-surface-elevated" />
          </div>
        </div>
        <div className="h-72 rounded-2xl bg-surface-elevated" />
      </div>
    </div>
  );
}
