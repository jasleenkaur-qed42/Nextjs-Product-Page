const API = "https://dummyjson.com"
const REVALIDATE_SECONDS = 3600

export type AvailabilityStatus = "In Stock" | "Low Stock" | "Out of Stock"

export type ProductSummary = {
  id: number
  title: string
  price: number
  category: string
  brand: string | null
  thumbnail: string
  availabilityStatus: AvailabilityStatus
}

export type ProductDetail = ProductSummary & {
  description: string
  rating: number
  images: string[]
  stock: number
  discountPercentage: number
}

export type Category = {
  slug: string
  label: string
}

type RawProduct = Omit<ProductSummary, "brand"> & { brand?: string }

function toSummary(raw: RawProduct): ProductSummary {
  return {
    id: raw.id,
    title: raw.title,
    price: raw.price,
    category: raw.category,
    brand: raw.brand ?? null,
    thumbnail: raw.thumbnail,
    availabilityStatus: raw.availabilityStatus,
  }
}

export async function getProductSummaries(): Promise<ProductSummary[]> {
  const response = await fetch(
    `${API}/products?limit=0&select=title,price,category,brand,thumbnail,availabilityStatus`,
    { next: { revalidate: REVALIDATE_SECONDS } }
  )

  if (!response.ok) {
    throw new Error("Products could not be loaded")
  }

  const data: { products: RawProduct[] } = await response.json()
  return data.products.map(toSummary)
}

export async function getProduct(id: number): Promise<ProductDetail | null> {
  const response = await fetch(`${API}/products/${id}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  })

  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error("Product could not be loaded")
  }

  const raw: RawProduct & Omit<ProductDetail, keyof ProductSummary> =
    await response.json()

  return {
    ...toSummary(raw),
    description: raw.description,
    rating: raw.rating,
    images: raw.images,
    stock: raw.stock,
    discountPercentage: raw.discountPercentage,
  }
}

export function categoryLabel(slug: string) {
  const words = slug.replace(/-/g, " ")
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export function getCategories(products: ProductSummary[]): Category[] {
  return Array.from(new Set(products.map((product) => product.category)))
    .sort()
    .map((slug) => ({ slug, label: categoryLabel(slug) }))
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}
