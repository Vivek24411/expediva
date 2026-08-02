/** Shown while a lazily-loaded route chunk is in flight. */
export function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory">
      <div className="flex flex-col items-center gap-4">
        <span className="block h-8 w-8 animate-spin rounded-full border-2 border-hairline border-t-ember" />
        <span className="eyebrow">Loading</span>
      </div>
    </div>
  );
}
