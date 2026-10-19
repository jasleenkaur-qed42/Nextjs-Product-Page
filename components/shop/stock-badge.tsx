import { Badge } from "@/components/ui/badge"
import type { AvailabilityStatus } from "@/lib/products"
import { cn } from "@/lib/utils"

const LABELS: Record<AvailabilityStatus, string | null> = {
  "In Stock": null,
  "Low Stock": "Low stock",
  "Out of Stock": "Out of stock",
}

export function StockBadge({
  status,
  className,
}: {
  status: AvailabilityStatus
  className?: string
}) {
  const label = LABELS[status]
  if (!label) return null

  return (
    <Badge
      data-figma-node="8:251"
      className={cn(
        "h-auto rounded-shop-badge bg-shop-canvas px-[7px] py-[5px] font-shop-sans text-[9px] font-medium tracking-wide text-shop-ink uppercase md:px-2.5 md:py-[7px]",
        className
      )}
    >
      {label}
    </Badge>
  )
}
