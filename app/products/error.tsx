"use client"

import { usePathname } from "next/navigation"

import { ListingError } from "@/components/shop/listing-states"

export default function ProductsError({ retry }: { retry: () => void }) {
  const onDetails = usePathname().startsWith("/products/")

  return (
    <div className="mx-auto w-full max-w-[1440px] px-[22px] md:px-10 lg:px-16">
      <ListingError
        onRetry={() => retry()}
        title={onDetails ? "We couldn't load this product." : undefined}
      />
    </div>
  )
}
