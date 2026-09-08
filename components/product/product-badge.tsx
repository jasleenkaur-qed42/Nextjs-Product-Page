"use client";

import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";

export function ProductBadge({ badge, delay }: { badge: string; delay: number }) {
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible((prev) => ({ ...prev, [badge]: true }));
    }, delay);

    return () => clearTimeout(timer);

    }, [delay]);

  if (!badge) {
    return null;
  }

  return (
    <Badge
      key={badge}
      variant="secondary"
      style={{
        scale: visible[badge] ? "1" : "0.8",
        transition: "scale 200ms ease-out",
      }}
      className="respect-reduced-motion will-change-[scale]"
    >
      {badge}
    </Badge>
  );
}
