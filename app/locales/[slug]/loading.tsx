export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-14 md:px-10 lg:px-12">
        <div className="h-5 w-32 animate-pulse rounded-full bg-[var(--color-surface-strong)]" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
          <div className="space-y-4">
            <div className="h-4 w-40 animate-pulse rounded-full bg-[var(--color-surface-strong)]" />
            <div className="h-14 w-3/4 animate-pulse rounded-[1.5rem] bg-[var(--color-surface-strong)]" />
            <div className="h-24 w-full animate-pulse rounded-[1.5rem] bg-[var(--color-surface-strong)]" />
          </div>
          <div className="h-56 animate-pulse rounded-[2rem] bg-[var(--color-surface-strong)]" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-white shadow-[0_20px_60px_rgba(39,24,13,0.08)]"
            >
              <div className="aspect-[4/3] animate-pulse bg-[var(--color-surface-strong)]" />
              <div className="space-y-3 p-5">
                <div className="h-6 w-2/3 animate-pulse rounded-full bg-[var(--color-surface-strong)]" />
                <div className="h-16 animate-pulse rounded-[1rem] bg-[var(--color-surface-strong)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
