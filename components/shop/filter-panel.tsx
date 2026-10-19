"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AVAILABILITY_OPTIONS,
  SORT_OPTIONS,
  type AvailabilityOption,
  type ListingParams,
  type SortOption,
} from "@/lib/product-filters"
import type { Category } from "@/lib/products"

const fieldClass =
  "h-9 w-full rounded-lg border border-shop-rule bg-shop-surface px-2.5 text-sm text-shop-ink focus-visible:border-shop-ink focus-visible:ring-2 focus-visible:ring-shop-ink/20 focus-visible:outline-none"

const PRICE_COMMIT_MS = 400

function parsePriceInput(value: string) {
  if (value.trim() === "") return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

function formatPriceDraft(value: number | null) {
  return value === null ? "" : String(value)
}

function PriceField({
  id,
  label,
  placeholder,
  value,
  onCommit,
}: {
  id: string
  label: string
  placeholder: string
  value: number | null
  onCommit: (value: number | null) => void
}) {
  const [draft, setDraft] = useState(formatPriceDraft(value))
  const [synced, setSynced] = useState(value)
  const [committed, setCommitted] = useState(value)

  if (value !== synced) {
    setSynced(value)
    if (value !== committed) {
      setCommitted(value)
      setDraft(formatPriceDraft(value))
    }
  }

  function commit() {
    const parsed = parsePriceInput(draft)
    if (parsed === committed) return
    setCommitted(parsed)
    onCommit(parsed)
  }

  useEffect(() => {
    const parsed = parsePriceInput(draft)
    if (parsed === committed) return
    const timer = window.setTimeout(() => {
      setCommitted(parsed)
      onCommit(parsed)
    }, PRICE_COMMIT_MS)
    return () => window.clearTimeout(timer)
  }, [draft, committed, onCommit])

  return (
    <>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Input
        id={id}
        type="number"
        min={0}
        inputMode="decimal"
        placeholder={placeholder}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit()
        }}
        className={fieldClass}
      />
    </>
  )
}

export function FilterPanel({
  id,
  params,
  categories,
  onChange,
  onClear,
}: {
  id: string
  params: ListingParams
  categories: Category[]
  onChange: (next: ListingParams) => void
  onClear: () => void
}) {
  function toggleAvailability(value: AvailabilityOption, checked: boolean) {
    const availability = checked
      ? [...params.availability, value]
      : params.availability.filter((item) => item !== value)
    onChange({ ...params, availability })
  }

  return (
    <section
      id={id}
      aria-label="Filter and sort products"
      className="mt-4 grid gap-6 rounded-shop-card bg-shop-surface p-5 text-shop-ink sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="grid gap-2">
        <label htmlFor={`${id}-sort`} className="text-[13px] font-medium">
          Sort by
        </label>
        <select
          id={`${id}-sort`}
          value={params.sort}
          onChange={(event) =>
            onChange({ ...params, sort: event.target.value as SortOption })
          }
          className={fieldClass}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label htmlFor={`${id}-category`} className="text-[13px] font-medium">
          Category
        </label>
        <select
          id={`${id}-category`}
          value={params.category ?? ""}
          onChange={(event) =>
            onChange({ ...params, category: event.target.value || null })
          }
          className={fieldClass}
        >
          <option value="">All objects</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-[13px] font-medium">Price (USD)</legend>
        <div className="flex items-center gap-2">
          <PriceField
            id={`${id}-min`}
            label="Minimum price"
            placeholder="Min"
            value={params.min}
            onCommit={(min) => onChange({ ...params, min })}
          />
          <span aria-hidden="true" className="text-shop-muted">
            –
          </span>
          <PriceField
            id={`${id}-max`}
            label="Maximum price"
            placeholder="Max"
            value={params.max}
            onCommit={(max) => onChange({ ...params, max })}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-[13px] font-medium">Availability</legend>
        {AVAILABILITY_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 text-sm"
          >
            <input
              type="checkbox"
              checked={params.availability.includes(option.value)}
              onChange={(event) =>
                toggleAvailability(option.value, event.target.checked)
              }
              className="size-4 accent-shop-ink"
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <div className="sm:col-span-2 lg:col-span-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onClear}
          className="px-0 text-[13px] text-shop-ink underline underline-offset-4 hover:bg-transparent"
        >
          Clear filters
        </Button>
      </div>
    </section>
  )
}
