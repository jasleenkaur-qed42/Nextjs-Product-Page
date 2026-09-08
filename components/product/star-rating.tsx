import { StarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function StarRating({
  rating,
  size = "sm",
  className,
}: {
  rating: number
  size?: "sm" | "md"
  className?: string
}) {
  const iconClass = size === "md" ? "size-5" : "size-3.5"

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.min(1, Math.max(0, rating - index))

        return (
          <span key={index} className={cn("relative inline-flex", iconClass)}>
            <StarIcon
              className={cn(iconClass, "text-muted-foreground/25")}
              aria-hidden
            />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <StarIcon
                className={cn(iconClass, "fill-amber-500 text-amber-500")}
                aria-hidden
              />
            </span>
          </span>
        )
      })}
    </div>
  )
}
