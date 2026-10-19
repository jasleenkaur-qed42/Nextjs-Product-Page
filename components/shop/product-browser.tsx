"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SearchIcon, SlidersHorizontalIcon } from "lucide-react"

import { CategoryTabs } from "@/components/shop/category-tabs"
import { FilterPanel } from "@/components/shop/filter-panel"
import { ListingEmpty, pillClass } from "@/components/shop/listing-states"
import { ProductCard } from "@/components/shop/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DEFAULT_PARAMS,
  PAGE_SIZE,
  applyListingParams,
  hasActiveFilters,
  parseListingParams,
  toQueryString,
  type ListingParams,
} from "@/lib/product-filters"
import type { Category, ProductSummary } from "@/lib/products"

const SEARCH_DEBOUNCE_MS = 250
const PANEL_ID = "product-filters"

export function ProductBrowser({
  products,
  categories,
}: {
  products: ProductSummary[]
  categories: Category[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useMemo(
    () => parseListingParams(searchParams),
    [searchParams]
  )

  const [panelOpen, setPanelOpen] = useState(false)
  const [query, setQuery] = useState(params.q)
  const [syncedQ, setSyncedQ] = useState(params.q)

  if (params.q !== syncedQ) {
    setSyncedQ(params.q)
    setQuery(params.q)
  }

  function navigate(next: ListingParams) {
    router.replace(`${pathname}${toQueryString(next)}`, { scroll: false })
  }

  function update(next: ListingParams) {
    navigate({ ...next, show: PAGE_SIZE })
  }

  useEffect(() => {
    if (query === params.q) return
    const timer = window.setTimeout(() => {
      router.replace(
        `${pathname}${toQueryString({ ...params, q: query, show: PAGE_SIZE })}`,
        { scroll: false }
      )
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [query, params, pathname, router])

  function clearFilters() {
    setQuery("")
    update({ ...DEFAULT_PARAMS, sort: params.sort })
  }

  const filtered = useMemo(
    () => applyListingParams(products, params),
    [products, params]
  )
  const shown = filtered.slice(0, params.show)
  const filtersActive = hasActiveFilters(params)

  return (
    <>
      <CategoryTabs
        categories={categories}
        active={params.category}
        onSelect={(category) => update({ ...params, category })}
      />

      <div
        data-figma-node="8:240"
        className="mx-auto w-full max-w-[1440px] px-[22px] pb-[22px] md:px-10 md:pb-12 lg:px-16"
      >
        <div
          data-figma-node="8:241"
          className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between md:gap-6 md:py-6"
        >
          <div className="relative w-full md:max-w-xs">
            <label htmlFor="product-search" className="sr-only">
              Search products
            </label>
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-shop-muted"
            />
            <Input
              id="product-search"
              type="search"
              placeholder="Search products"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 rounded-full border-shop-rule bg-shop-surface pl-9 text-sm text-shop-ink placeholder:text-shop-muted focus-visible:border-shop-ink focus-visible:ring-shop-ink/20"
            />
          </div>
          <div className="flex items-center justify-between gap-6 md:justify-end">
            <p
              aria-live="polite"
              className="text-[11px] text-shop-muted md:text-[13px]"
            >
              {filtered.length}{" "}
              {filtered.length === 1
                ? "considered essential"
                : "considered essentials"}
            </p>
            <Button
              type="button"
              variant="ghost"
              aria-expanded={panelOpen}
              aria-controls={PANEL_ID}
              onClick={() => setPanelOpen((open) => !open)}
              className="h-auto gap-[7px] px-0 text-[11px] font-medium text-shop-ink hover:bg-transparent aria-expanded:bg-transparent md:gap-2.5 md:text-[13px]"
            >
              Filter &amp; sort
              <SlidersHorizontalIcon
                aria-hidden="true"
                className="size-[15px] stroke-[1.5] md:size-[18px]"
              />
            </Button>
          </div>
        </div>

        {panelOpen ? (
          <FilterPanel
            id={PANEL_ID}
            params={params}
            categories={categories}
            onChange={update}
            onClear={clearFilters}
          />
        ) : null}

        {filtered.length === 0 ? (
          <ListingEmpty
            filtered={products.length > 0}
            onClear={filtersActive ? clearFilters : undefined}
          />
        ) : (
          <>
            <ul
              role="list"
              data-figma-node="8:247"
              className="mt-2 grid grid-cols-2 gap-x-3 gap-y-3.5 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6"
            >
              {shown.map((product, index) => (
                <li key={product.id}>
                  <ProductCard product={product} priority={index < 4} />
                </li>
              ))}
            </ul>

            <div
              data-figma-node="8:292"
              className="flex flex-col items-center gap-4 pt-[38px]"
            >
              <p
                aria-live="polite"
                className="text-xs text-shop-muted"
              >
                Showing {shown.length} of {filtered.length} objects
              </p>
              {shown.length < filtered.length ? (
                <Button
                  type="button"
                  data-figma-node="8:294"
                  onClick={() =>
                    navigate({ ...params, show: params.show + PAGE_SIZE })
                  }
                  className={pillClass}
                >
                  Load more objects
                </Button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </>
  )
}
