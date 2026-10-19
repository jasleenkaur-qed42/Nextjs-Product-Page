import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeftIcon } from "lucide-react"

import { ProductGallery } from "@/components/product/product-gallery"
import { StarRating } from "@/components/product/star-rating"
import { StockBadge } from "@/components/shop/stock-badge"
import { categoryLabel, formatPrice, getProduct } from "@/lib/products"

async function loadProduct(id: string) {
  if (!/^\d+$/.test(id)) notFound()
  const product = await getProduct(Number(id))
  if (!product) notFound()
  return product
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params
  const product = await loadProduct(id)
  return { title: product.title, description: product.description }
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[id]">) {
  const { id } = await params
  const product = await loadProduct(id)
  const images = product.images.map((src, index) => ({
    src,
    alt: `${product.title} image ${index + 1}`,
  }))

  return (
    <div className="mx-auto w-full max-w-[1440px] px-[22px] py-8 md:px-10 md:py-12 lg:px-16">
      <Link
        href="/products"
        className="mb-8 inline-flex items-center gap-1 rounded-md text-[13px] text-shop-muted hover:text-shop-ink focus-visible:ring-2 focus-visible:ring-shop-ink focus-visible:outline-none"
      >
        <ChevronLeftIcon aria-hidden="true" className="size-4" />
        Back to shop
      </Link>

      <section className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={images} />

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-medium tracking-wide text-shop-muted uppercase">
              {[product.brand, categoryLabel(product.category)]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <h1 className="font-shop-serif text-[34px] leading-[1.2] md:text-[44px]">
              {product.title}
            </h1>
            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} size="md" />
              <span className="text-sm font-medium tabular-nums">
                {product.rating.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-3xl font-medium tabular-nums">
              {formatPrice(product.price)}
            </p>
            <StockBadge status={product.availabilityStatus} />
          </div>

          <p className="max-w-prose text-base leading-relaxed text-shop-muted">
            {product.description}
          </p>

          <p className="text-sm text-shop-muted">
            {product.availabilityStatus === "Out of Stock"
              ? "Out of stock"
              : `${product.availabilityStatus} · ${product.stock} available`}
          </p>
        </div>
      </section>
    </div>
  )
}
