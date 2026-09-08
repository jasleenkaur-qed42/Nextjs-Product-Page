"use client"

import {
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"

const ZOOM_SCALE = 2.25
const FADE_MS = 200

type GalleryImage = {
  src: string
  alt: string
}

type Origin = {
  x: number
  y: number
}

function originFromPointer(event: MouseEvent<HTMLElement>): Origin {
  const rect = event.currentTarget.getBoundingClientRect()

  return {
    x: ((event.clientX - rect.left) / rect.width) * 100,
    y: ((event.clientY - rect.top) / rect.height) * 100,
  }
}

export function ProductGallery({ images }: { images: readonly GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [pendingIndex, setPendingIndex] = useState<number | null>(null)
  const [visible, setVisible] = useState(true)
  const [hovering, setHovering] = useState(false)
  const [zoomLocked, setZoomLocked] = useState(false)
  const [origin, setOrigin] = useState<Origin>({ x: 50, y: 50 })
  const active = images[activeIndex] ?? images[0]
  const fading = pendingIndex !== null
  const zoomed = hovering || zoomLocked

  const selectImage = useCallback(
    (index: number) => {
      if (index === activeIndex || fading) return
      setPendingIndex(index)
      setVisible(false)
      setZoomLocked(false)
    },
    [activeIndex, fading]
  )

  const handleGalleryKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault()
        selectImage((activeIndex + 1) % images.length)
      } else if (event.key === "ArrowLeft") {
        event.preventDefault()
        selectImage((activeIndex - 1 + images.length) % images.length)
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        setZoomLocked((value) => !value)
      } else if (event.key === "Escape" && zoomLocked) {
        setZoomLocked(false)
      }
    },
    [activeIndex, images.length, selectImage, zoomLocked]
  )

  const handleFadeTransitionEnd = useCallback(() => {
    if (!visible && pendingIndex !== null) {
      setActiveIndex(pendingIndex)
      setPendingIndex(null)
      // Wait one frame so the new src paints before fading back in.
      requestAnimationFrame(() => setVisible(true))
    }
  }, [visible, pendingIndex])

  // Fallback in case the opacity transition never fires transitionend
  // (e.g. prefers-reduced-motion disables transitions entirely), so the
  // gallery never gets stuck mid-fade.
  useEffect(() => {
    if (visible || pendingIndex === null) return
    const timer = setTimeout(handleFadeTransitionEnd, FADE_MS + 50)
    return () => clearTimeout(timer)
  }, [visible, pendingIndex, handleFadeTransitionEnd])

  if (!active) {
    return null
  }

  return (
    <div className="grid gap-3">
      <div
        role="group"
        aria-label={`Product image gallery, image ${activeIndex + 1} of ${images.length}. Press Enter to zoom, arrow keys to change image.`}
        tabIndex={0}
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl bg-muted ring-1 ring-foreground/10 outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        onMouseEnter={(event) => {
          setHovering(true)
          setOrigin(originFromPointer(event))
        }}
        onMouseMove={(event) => setOrigin(originFromPointer(event))}
        onMouseLeave={() => setHovering(false)}
        onClick={() => setZoomLocked((value) => !value)}
        onKeyDown={handleGalleryKeyDown}
      >
        <Image
          key={active.src}
          src={active.src}
          alt={active.alt}
          fill
          priority={activeIndex === 0}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="respect-reduced-motion object-cover will-change-[transform,opacity]"
          style={{
            opacity: visible ? 1 : 0,
            transformOrigin: `${origin.x}% ${origin.y}%`,
            transform: zoomed ? `scale(${ZOOM_SCALE})` : "scale(1)",
            transition: [
              `opacity ${FADE_MS}ms ease-in-out`,
              hovering ? "transform 0ms" : "transform 200ms ease-out",
            ].join(", "),
          }}
          onTransitionEnd={(event) => {
            if (event.propertyName === "opacity") {
              handleFadeTransitionEnd()
            }
          }}
        />
      </div>
      <span className="sr-only" aria-live="polite">
        {`Image ${activeIndex + 1} of ${images.length}: ${active.alt}`}
      </span>
      <ul className="grid grid-cols-6 gap-2">
        {images.map((image, index) => {
          const selected = index === activeIndex

          return (
            <li key={image.src}>
              <button
                type="button"
                onClick={() => selectImage(index)}
                aria-label={`Show image ${index + 1}: ${image.alt}`}
                aria-current={selected}
                disabled={fading}
                className={cn(
                  "relative aspect-square w-full overflow-hidden rounded-lg ring-1 ring-foreground/10 transition",
                  selected
                    ? "ring-2 ring-foreground"
                    : "opacity-80 hover:opacity-100",
                  fading && "pointer-events-none"
                )}
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
