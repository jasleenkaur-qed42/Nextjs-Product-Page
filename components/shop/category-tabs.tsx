import type { Category } from "@/lib/products"
import { cn } from "@/lib/utils"

export function CategoryTabs({
  categories,
  active,
  onSelect,
}: {
  categories: Category[]
  active: string | null
  onSelect: (slug: string | null) => void
}) {
  const items = [{ slug: null, label: "All objects" }, ...categories]

  return (
    <div
      data-figma-node="8:230"
      className="border-b border-shop-rule"
    >
      <ul
        aria-label="Categories"
        className="mx-auto flex h-12 max-w-[1440px] gap-[27px] overflow-x-auto px-[22px] [scrollbar-width:none] md:h-16 md:gap-10 md:px-10 lg:px-16 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const selected = item.slug === active
          return (
            <li key={item.slug ?? "all"} className="flex shrink-0">
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(item.slug)}
                className={cn(
                  "relative flex h-full items-center text-sm whitespace-nowrap focus-visible:ring-2 focus-visible:ring-shop-ink focus-visible:outline-none md:text-[15px]",
                  selected
                    ? "font-semibold text-shop-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-shop-ink"
                    : "text-shop-muted hover:text-shop-ink"
                )}
              >
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
