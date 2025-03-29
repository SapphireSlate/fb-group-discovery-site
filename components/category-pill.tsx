import Link from "next/link"

interface CategoryPillProps {
  name: string
  isActive?: boolean
  count?: number
}

export default function CategoryPill({ name, isActive = false, count }: CategoryPillProps) {
  return (
    <Link
      href={`/discover?category=${encodeURIComponent(name)}`}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      {name}
      {count !== undefined && <span className="ml-1 text-xs opacity-75">({count})</span>}
    </Link>
  )
}

