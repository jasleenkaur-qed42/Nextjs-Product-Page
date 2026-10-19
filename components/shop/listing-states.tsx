import { Button } from "@/components/ui/button"

const pillClass =
  "h-[46px] w-[210px] rounded-full bg-shop-ink text-[13px] font-medium text-shop-surface hover:bg-shop-ink/90 focus-visible:ring-2 focus-visible:ring-shop-ink focus-visible:ring-offset-2 focus-visible:ring-offset-shop-canvas"

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading products">
      <ul className="grid grid-cols-2 gap-x-3 gap-y-3.5 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
        {Array.from({ length: count }, (_, index) => (
          <li
            key={index}
            className="overflow-hidden rounded-shop-card bg-shop-surface"
          >
            <div className="h-[182px] animate-pulse bg-shop-rule/60 md:h-64 lg:h-80" />
            <div className="grid gap-2 p-3 md:p-5">
              <div className="h-3.5 w-3/4 animate-pulse rounded bg-shop-rule/60" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-shop-rule/60" />
              <div className="h-3.5 w-1/4 animate-pulse rounded bg-shop-rule/60" />
            </div>
          </li>
        ))}
      </ul>
      <span className="sr-only">Loading products…</span>
    </div>
  )
}

export function ListingEmpty({
  filtered,
  onClear,
}: {
  filtered: boolean
  onClear?: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center text-shop-ink">
      <p className="font-shop-serif text-2xl">
        {filtered
          ? "No products match your search or filters."
          : "No products available right now."}
      </p>
      {filtered && onClear ? (
        <Button type="button" onClick={onClear} className={pillClass}>
          Clear filters
        </Button>
      ) : null}
    </div>
  )
}

export function ListingError({
  onRetry,
  title = "We couldn't load products.",
}: {
  onRetry: () => void
  title?: string
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 py-16 text-center text-shop-ink"
    >
      <p className="font-shop-serif text-2xl">{title}</p>
      <p className="text-[13px] text-shop-muted">
        Check your connection and try again.
      </p>
      <Button type="button" onClick={onRetry} className={pillClass}>
        Try again
      </Button>
    </div>
  )
}

export { pillClass }
