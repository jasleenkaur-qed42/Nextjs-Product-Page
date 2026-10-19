import type { AvailabilityStatus, ProductSummary } from "@/lib/products"

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
] as const

export const AVAILABILITY_OPTIONS = [
  { value: "in-stock", label: "In stock", status: "In Stock" },
  { value: "low-stock", label: "Low stock", status: "Low Stock" },
  { value: "out-of-stock", label: "Out of stock", status: "Out of Stock" },
] as const satisfies readonly {
  value: string
  label: string
  status: AvailabilityStatus
}[]

export type SortOption = (typeof SORT_OPTIONS)[number]["value"]
export type AvailabilityOption = (typeof AVAILABILITY_OPTIONS)[number]["value"]

export const PAGE_SIZE = 12

export type ListingParams = {
  q: string
  category: string | null
  sort: SortOption
  min: number | null
  max: number | null
  availability: AvailabilityOption[]
  show: number
}

export const DEFAULT_PARAMS: ListingParams = {
  q: "",
  category: null,
  sort: "featured",
  min: null,
  max: null,
  availability: [],
  show: PAGE_SIZE,
}

function parseShow(value: string | null) {
  const number = Number(value)
  if (!Number.isInteger(number) || number < PAGE_SIZE) return PAGE_SIZE
  return Math.ceil(number / PAGE_SIZE) * PAGE_SIZE
}

function parsePrice(value: string | null) {
  if (value === null || value.trim() === "") return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

function isSortOption(value: string | null): value is SortOption {
  return SORT_OPTIONS.some((option) => option.value === value)
}

function isAvailabilityOption(value: string): value is AvailabilityOption {
  return AVAILABILITY_OPTIONS.some((option) => option.value === value)
}

export function parseListingParams(
  searchParams: Pick<URLSearchParams, "get">
): ListingParams {
  const sort = searchParams.get("sort")
  const availability = (searchParams.get("availability") ?? "")
    .split(",")
    .filter(isAvailabilityOption)

  return {
    q: searchParams.get("q") ?? "",
    category: searchParams.get("category") || null,
    sort: isSortOption(sort) ? sort : "featured",
    min: parsePrice(searchParams.get("min")),
    max: parsePrice(searchParams.get("max")),
    availability: Array.from(new Set(availability)),
    show: parseShow(searchParams.get("show")),
  }
}

export function hasActiveFilters(params: ListingParams) {
  return (
    params.q.trim() !== "" ||
    params.category !== null ||
    params.min !== null ||
    params.max !== null ||
    params.availability.length > 0
  )
}

export function applyListingParams(
  products: ProductSummary[],
  params: ListingParams
) {
  const terms = params.q.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const [low, high] =
    params.min !== null && params.max !== null && params.min > params.max
      ? [params.max, params.min]
      : [params.min, params.max]
  const statuses = new Set<AvailabilityStatus>(
    AVAILABILITY_OPTIONS.filter((option) =>
      params.availability.includes(option.value)
    ).map((option) => option.status)
  )

  const filtered = products.filter((product) => {
    if (terms.length > 0) {
      const haystack = [product.title, product.brand ?? "", product.category]
        .join(" ")
        .toLowerCase()
      if (!terms.every((term) => haystack.includes(term))) return false
    }
    if (params.category && product.category !== params.category) return false
    if (low !== null && product.price < low) return false
    if (high !== null && product.price > high) return false
    if (statuses.size > 0 && !statuses.has(product.availabilityStatus)) {
      return false
    }
    return true
  })

  switch (params.sort) {
    case "price-asc":
      return filtered.sort((a, b) => a.price - b.price)
    case "price-desc":
      return filtered.sort((a, b) => b.price - a.price)
    case "name-asc":
      return filtered.sort((a, b) => a.title.localeCompare(b.title))
    case "name-desc":
      return filtered.sort((a, b) => b.title.localeCompare(a.title))
    default:
      return filtered
  }
}

export function toQueryString(params: ListingParams) {
  const query = new URLSearchParams()
  const q = params.q.trim()

  if (q) query.set("q", q)
  if (params.category) query.set("category", params.category)
  if (params.sort !== DEFAULT_PARAMS.sort) query.set("sort", params.sort)
  if (params.min !== null) query.set("min", String(params.min))
  if (params.max !== null) query.set("max", String(params.max))
  if (params.availability.length > 0) {
    query.set("availability", params.availability.join(","))
  }
  if (params.show !== PAGE_SIZE) query.set("show", String(params.show))

  const value = query.toString()
  return value ? `?${value}` : ""
}
