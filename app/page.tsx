import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { LeafIcon, ShieldCheckIcon, TruckIcon } from "lucide-react"

import { ProductActions } from "@/components/product/product-actions"
import { ProductGallery } from "@/components/product/product-gallery"
import { ReviewsSection } from "@/components/product/reviews-section"
import { StarRating } from "@/components/product/star-rating"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  product,
  ratingBreakdown,
  relatedProducts,
  reviews,
} from "@/lib/product-data"
import { ProductBadge } from "@/components/product/product-badge"

export const metadata: Metadata = {
  title: product.name,
  description: product.shortPitch,
}

function formatMoney(amount: number, symbol: string) {
  return `${symbol}${amount.toFixed(2)}`
}

export default function Page() {
  return (
    <div className="flex min-h-full flex-col bg-[oklch(0.985_0.012_85)] text-foreground dark:bg-background">
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded-lg focus-visible:bg-background focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:ring-2 focus-visible:ring-foreground"
      >
        Skip to content
      </a>
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-heading text-sm font-medium tracking-tight">
            {product.brand}
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <Link href="/" className="text-foreground">
              Shop
            </Link>
            <Link href="/" className="hover:text-foreground">
              Journal
            </Link>
            <Link href="/" className="hover:text-foreground">
              About
            </Link>
          </nav>
          <Button variant="ghost" size="sm">
            Bag (0)
          </Button>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12"
      >
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/" />}>Shop</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/" />}>Honey</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <section className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={product.gallery} />

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {product.badges.map((badge, index) => (
                  <ProductBadge key={badge} badge={badge} delay={index * 200}/>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{product.brand}</p>
              <h1 className="font-heading text-3xl font-medium tracking-tight text-balance sm:text-4xl">
                {product.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <StarRating rating={product.rating} size="md" />
                <span className="text-sm font-medium tabular-nums">
                  {product.rating.toFixed(1)}
                </span>
                <Separator orientation="vertical" className="h-4" />
                <a href="#reviews" className="text-sm text-muted-foreground hover:text-foreground">
                  {product.reviewCount} reviews
                </a>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-medium tracking-tight tabular-nums">
                {formatMoney(product.price, product.currencySymbol)}
              </p>
              <p className="text-sm text-muted-foreground line-through tabular-nums">
                {formatMoney(product.compareAtPrice, product.currencySymbol)}
              </p>
              <Badge variant="outline">{product.currency}</Badge>
            </div>

            <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
              {product.shortPitch}
            </p>

            <div className="flex flex-wrap gap-2">
              {product.tastingNotes.map((note) => (
                <Badge key={note} variant="outline">
                  {note}
                </Badge>
              ))}
            </div>

            <ProductActions
              price={product.price}
              currencySymbol={product.currencySymbol}
            />

            <p className="text-sm text-muted-foreground">
              {product.inStock ? "In stock · ships within 2 business days" : "Out of stock"}
              {" · "}SKU {product.sku}
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-start gap-2.5 rounded-xl bg-background/70 p-3 ring-1 ring-foreground/10">
                <TruckIcon className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Free over $45</p>
                  <p className="text-xs text-muted-foreground">US shipping</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl bg-background/70 p-3 ring-1 ring-foreground/10">
                <ShieldCheckIcon className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">30-day returns</p>
                  <p className="text-xs text-muted-foreground">Unopened jars</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl bg-background/70 p-3 ring-1 ring-foreground/10">
                <LeafIcon className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Small-batch</p>
                  <p className="text-xs text-muted-foreground">August 2025 harvest</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-12 sm:my-16" />

        <Tabs defaultValue="story" className="gap-6">
          <TabsList variant="line" className="w-full justify-start">
            <TabsTrigger value="story">The story</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="care">Care & shipping</TabsTrigger>
          </TabsList>
          <TabsContent value="story" className="max-w-3xl">
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              {product.description.split("\n\n").map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="specs">
            <Card className="bg-background/70 py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48">Detail</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.specifications.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell className="font-medium whitespace-normal">
                        {row.label}
                      </TableCell>
                      <TableCell className="whitespace-normal text-muted-foreground">
                        {row.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          <TabsContent value="care" className="max-w-3xl space-y-4 text-muted-foreground">
            <p>
              Store the jar in a cool, dark pantry. Refrigeration speeds crystallization
              and is not needed. If the honey sets, rest the closed jar in warm water
              and stir until it loosens — never microwave.
            </p>
            <p>
              Packed in amber glass with a food-safe liner. Honey is not suitable for
              infants under 12 months. Ships in a padded mailer; glass is replaced if
              it arrives damaged.
            </p>
          </TabsContent>
        </Tabs>

        <Separator className="my-12 sm:my-16" />

        <ReviewsSection
          product={product}
          reviews={reviews}
          ratingBreakdown={ratingBreakdown}
        />

        <Separator className="my-12 sm:my-16" />

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-medium tracking-tight">
                You may also like
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Other small-batch honeys from the same two Palouse apiaries.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((item) => (
              <Link key={item.id} href="/" className="group">
                <Card className="h-full bg-background/70 pt-0 transition group-hover:ring-foreground/20">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>Meadow & Comb</CardDescription>
                    <CardAction>
                      <Badge variant="secondary">{item.badge}</Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="justify-between">
                    <span className="font-medium tabular-nums">
                      {formatMoney(item.price, item.currencySymbol)}{" "}
                      <span className="text-muted-foreground">USD</span>
                    </span>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground">
                      View
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-8 border-t bg-background/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 {product.brand}. Palouse hills, Washington.</p>
          <p>Raw honey · Small harvests · Amber glass</p>
        </div>
      </footer>
    </div>
  )
}
