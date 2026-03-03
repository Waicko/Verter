export default function RoutesLoading() {
  return (
    <div className="px-4 py-8 sm:px-6 sm:py-12 animate-pulse">
      <div className="mx-auto max-w-6xl">
        <div className="h-10 w-64 rounded bg-verter-border/50" />
        <div className="mt-2 h-5 w-96 rounded bg-verter-border/30" />
        <div className="mt-8 h-24 rounded-card bg-verter-border/20" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 rounded-card bg-verter-border/20"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
