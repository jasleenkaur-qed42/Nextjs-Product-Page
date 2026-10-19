import { Inter, Libre_Caslon_Text } from "next/font/google"

import { ShopHeader } from "@/components/shop/shop-header"

const libreCaslon = Libre_Caslon_Text({
  variable: "--font-libre-caslon",
  subsets: ["latin"],
  weight: "400",
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

export default function ProductsLayout({
  children,
}: LayoutProps<"/products">) {
  return (
    <div
      className={`${libreCaslon.variable} ${inter.variable} flex min-h-full flex-1 flex-col bg-shop-canvas font-shop-sans text-shop-ink`}
    >
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded-lg focus-visible:bg-shop-surface focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:ring-2 focus-visible:ring-shop-ink"
      >
        Skip to content
      </a>
      <ShopHeader />
      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>
    </div>
  )
}
