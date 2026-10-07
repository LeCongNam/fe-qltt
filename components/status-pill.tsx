export function StatusPill({
  list,
  value,
}: {
  list: { value: string; label: string; tone: string }[]
  value: string
}) {
  const item = list.find((x) => x.value === value)
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${item?.tone ?? "bg-neutral-soft text-muted-foreground"}`}>
      {item?.label ?? value}
    </span>
  )
}
