"use client";

import { useEffect, useState } from "react";
import { CheckIcon, HeartIcon, MinusIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 12;

function clampQuantity(value: number) {
  if (Number.isNaN(value)) return MIN_QUANTITY;
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.round(value)));
}

export function ProductActions({
  price,
  currencySymbol,
}: {
  price: number;
  currencySymbol: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function addToBag() {
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }

  function toggleSaved() {
    setSaved((value) => !value);
    setIsSaving(true);
  }

  useEffect(() => {
    if (!isSaving) return;
    const timer = setTimeout(() => setIsSaving(false), 200);
    return () => clearTimeout(timer);
  }, [isSaving]);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <ButtonGroup>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Decrease quantity"
            disabled={quantity <= MIN_QUANTITY}
            onClick={() => setQuantity((value) => clampQuantity(value - 1))}
          >
            <MinusIcon />
          </Button>
          <Input
            type="number"
            inputMode="numeric"
            min={MIN_QUANTITY}
            max={MAX_QUANTITY}
            value={quantity}
            aria-label="Quantity"
            className="w-16 min-w-12 justify-center px-3 text-center tabular-nums"
            onChange={(event) => setQuantity(clampQuantity(event.target.valueAsNumber))}
            onBlur={(event) =>
              setQuantity(clampQuantity(event.target.valueAsNumber))
            }
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Increase quantity"
            disabled={quantity >= MAX_QUANTITY}
            onClick={() => setQuantity((value) => clampQuantity(value + 1))}
          >
            <PlusIcon />
          </Button>
        </ButtonGroup>
        <p className="text-sm text-muted-foreground">
          {currencySymbol}
          {(price * quantity).toFixed(2)} total
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button size="lg" className="flex-1" onClick={addToBag}>
          {added ? (
            <>
              <CheckIcon data-icon="inline-start" />
              Added to bag
            </>
          ) : (
            "Add to bag"
          )}
        </Button>
        <span className="sr-only" role="status">
          {added ? "Added to bag" : ""}
        </span>
        <Button
          size="lg"
          variant="outline"
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={saved}
          onClick={toggleSaved}
          className="respect-reduced-motion will-change-[scale]"
          style={{
            scale: isSaving ? 1.5 : 1,
            transition: "scale 200ms ease-out",
          }}
        >
          <HeartIcon
            data-icon="inline-start"
            className={saved ? "fill-destructive" : undefined}
          />
        </Button>
      </div>
    </div>
  );
}
