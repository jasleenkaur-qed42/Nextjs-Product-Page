import Image from "next/image"
import Link from "next/link"

import { StockBadge } from "@/components/shop/stock-badge"
import { Card } from "@/components/ui/card"
import { categoryLabel, formatPrice, type ProductSummary } from "@/lib/products"

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductSummary
  priority?: boolean
}) {
  const subtitle = [product.brand, categoryLabel(product.category)]
    .filter(Boolean)
    .join(" · ")

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block h-full rounded-(--radius-shop-card) focus-visible:ring-2 focus-visible:ring-shop-ink focus-visible:ring-offset-2 focus-visible:ring-offset-shop-canvas focus-visible:outline-none"
    >
      <Card
        data-figma-node="8:248"
        className="h-full gap-0 rounded-(--radius-shop-card) bg-shop-surface py-0 text-shop-ink ring-0 transition-shadow group-hover:shadow-md"
      >
        <div className="relative h-[182px] overflow-hidden md:h-64 lg:h-80">
          <Image
            src={product.thumbnail}
            alt=""
            fill
            loading={priority ? "eager" : "lazy"}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <StockBadge
            status={product.availabilityStatus}
            className="absolute top-[11px] left-2.5 md:top-4 md:left-4"
          />
        </div>
        <div className="flex flex-col gap-[5px] px-3 pt-3 pb-3.5 md:gap-2 md:px-5 md:pt-[19px] md:pb-[22px]">
          <h2 className="text-[13px] leading-[1.21] font-medium md:text-base">
            {product.title}
          </h2>
          {subtitle ? (
            <p className="text-[11px] leading-[1.21] text-shop-muted md:text-xs">
              {subtitle}
            </p>
          ) : null}
          <p className="text-[13px] leading-[1.21] font-medium tabular-nums md:text-base">
            {formatPrice(product.price)}
          </p>
        </div>
      </Card>
    </Link>
  )
}
