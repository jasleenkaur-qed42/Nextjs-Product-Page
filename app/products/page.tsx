import { Suspense } from "react"
import type { Metadata } from "next"

import { CollectionIntro } from "@/components/shop/collection-intro"
import { ProductGridSkeleton } from "@/components/shop/listing-states"
import { ProductBrowser } from "@/components/shop/product-browser"
import { getCategories, getProductSummaries } from "@/lib/products"

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse every product: search, filter by category, price and availability, and sort.",
}

async function ProductListing() {
  const products = await getProductSummaries()
  const categories = getCategories(products)

  return <ProductBrowser products={products} categories={categories} />
}

export default function ProductsPage() {
  return (
    <>
      <CollectionIntro
        eyebrow="Considered objects. Every day."
        title="A quieter kind of home."
      />
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-[1440px] px-[22px] pt-16 md:px-10 lg:px-16">
            <ProductGridSkeleton />
          </div>
        }
      >
        <ProductListing />
      </Suspense>
    </>
  )
}
