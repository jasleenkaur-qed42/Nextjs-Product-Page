"use client"

import { useMemo, useState } from "react"
import { BadgeCheckIcon, ThumbsUpIcon } from "lucide-react"

import { StarRating } from "@/components/product/star-rating"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type {
  product as productData,
  ratingBreakdown as ratingBreakdownData,
  reviews as reviewsData,
} from "@/lib/product-data"

type Product = typeof productData
type RatingBreakdown = typeof ratingBreakdownData
type Review = (typeof reviewsData)[number]

function ReviewCard({ review }: { review: Review }) {
  const [helpful, setHelpful] = useState(false)
  const [helpfulCount, setHelpfulCount] = useState(0)

  return (
    <Card className="bg-background/70">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{review.initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="flex flex-wrap items-center gap-2">
              {review.name}
              {review.verified ? (
                <Badge variant="secondary">
                  <BadgeCheckIcon data-icon="inline-start" />
                  Verified
                </Badge>
              ) : null}
            </CardTitle>
            <CardDescription>
              {review.location} · {review.date}
            </CardDescription>
          </div>
        </div>
        <CardAction>
          <StarRating rating={review.rating} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="font-medium">{review.title}</p>
        <p className="mt-1.5 leading-relaxed text-muted-foreground">
          {review.body}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-3"
          aria-pressed={helpful}
          onClick={() => {
            setHelpful((value) => !value)
            setHelpfulCount((value) => (helpful ? value - 1 : value + 1))
          }}
        >
          <ThumbsUpIcon
            data-icon="inline-start"
            className={helpful ? "fill-foreground" : undefined}
          />
          Helpful{helpfulCount > 0 ? ` (${helpfulCount})` : ""}
        </Button>
      </CardContent>
    </Card>
  )
}

export function ReviewsSection({
  product,
  reviews,
  ratingBreakdown,
}: {
  product: Product
  reviews: readonly Review[]
  ratingBreakdown: RatingBreakdown
}) {
  const [starFilter, setStarFilter] = useState<number | null>(null)
  const maxRatingCount = Math.max(...ratingBreakdown.map((row) => row.count))
  const filteredReviews = useMemo(
    () =>
      starFilter === null
        ? reviews
        : reviews.filter((review) => review.rating === starFilter),
    [reviews, starFilter]
  )

  return (
    <section id="reviews" className="scroll-mt-8">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-medium tracking-tight">
            Reviews
          </h2>
          <p className="text-sm text-muted-foreground">
            {reviews.length} recent notes from the {product.reviewCount}{" "}
            customers who have tasted this harvest.
          </p>
        </div>
        <div className="flex items-center gap-6 rounded-2xl bg-background/70 px-5 py-4 ring-1 ring-foreground/10">
          <div>
            <p className="text-3xl font-medium tabular-nums">
              {product.rating.toFixed(1)}
            </p>
            <StarRating rating={product.rating} />
            <p className="mt-1 text-xs text-muted-foreground">
              {product.reviewCount} ratings
            </p>
          </div>
          <Separator orientation="vertical" className="h-16" />
          <ul className="grid min-w-48 gap-1.5">
            {ratingBreakdown.map((row) => {
              const active = starFilter === row.stars

              return (
                <li key={row.stars}>
                  <button
                    type="button"
                    aria-pressed={active}
                    aria-label={`Filter to ${row.stars} star reviews (${row.count})`}
                    onClick={() =>
                      setStarFilter((value) =>
                        value === row.stars ? null : row.stars
                      )
                    }
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-xs transition-colors hover:bg-muted",
                      active && "bg-muted ring-1 ring-foreground/20"
                    )}
                  >
                    <span className="w-8 tabular-nums text-muted-foreground">
                      {row.stars} star
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-amber-500"
                        style={{
                          width: `${(row.count / maxRatingCount) * 100}%`,
                        }}
                      />
                    </span>
                    <span className="w-6 text-right tabular-nums text-muted-foreground">
                      {row.count}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {starFilter !== null ? (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span role="status">
            Showing {filteredReviews.length} review
            {filteredReviews.length === 1 ? "" : "s"} rated {starFilter} star
            {starFilter === 1 ? "" : "s"}.
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setStarFilter(null)}
          >
            Clear filter
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4">
        {filteredReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  )
}
