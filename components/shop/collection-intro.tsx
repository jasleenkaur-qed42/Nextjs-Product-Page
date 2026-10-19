export function CollectionIntro({
  eyebrow,
  title,
}: {
  eyebrow: string
  title: string
}) {
  return (
    <div
      data-figma-node="8:227"
      className="flex flex-col gap-[9px] px-[22px] pt-[22px] pb-[25px] md:gap-4 md:px-10 md:pt-12 md:pb-10 lg:px-16"
    >
      <p className="text-[10px] font-medium tracking-wide text-shop-muted uppercase md:text-[11px]">
        {eyebrow}
      </p>
      <h1 className="font-shop-serif text-[34px] leading-[1.2] text-shop-ink md:text-[52px]">
        {title}
      </h1>
    </div>
  )
}
