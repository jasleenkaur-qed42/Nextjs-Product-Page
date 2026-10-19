"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function ShopHeader() {
  const onList = usePathname() === "/products"

  return (
    <header
      data-figma-node="8:203"
      className="border-b border-shop-rule"
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-[22px] md:h-24 md:px-10 lg:px-16">
        <div className="flex h-full items-center gap-16">
          <Link
            href="/products"
            className="font-shop-serif text-[22px] leading-[1.23] text-shop-ink md:text-[30px]"
          >
            form &amp; field
          </Link>
          <nav aria-label="Shop" className="hidden h-full md:flex">
            <Link
              href="/products"
              aria-current={onList ? "page" : undefined}
              className={cn(
                "relative flex h-full items-center text-sm font-semibold text-shop-ink",
                onList &&
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-shop-ink"
              )}
            >
              Shop
            </Link>
          </nav>
        </div>
        <a
          href={onList ? "#product-search" : "/products#product-search"}
          className="flex items-center gap-2 rounded-md text-[13px] text-shop-ink focus-visible:ring-2 focus-visible:ring-shop-ink focus-visible:outline-none"
        >
          <SearchIcon aria-hidden="true" className="size-[22px] stroke-[1.5]" />
          <span className="sr-only md:not-sr-only">Search</span>
        </a>
      </div>
    </header>
  )
}
