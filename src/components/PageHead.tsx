import Link from 'next/link'

export type Crumb = { label: string; href?: string }

export function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Навигационная цепочка">
      {items.map((c, i) => (
        <span key={i} style={{ display: 'contents' }}>
          {i > 0 ? <span aria-hidden="true">/</span> : null}
          {c.href ? <Link href={c.href}>{c.label}</Link> : <span className="here">{c.label}</span>}
        </span>
      ))}
    </nav>
  )
}

/** Светлая полоса под шапкой: «хлебные крошки», надзаголовок, заголовок, описание. */
export function PageHead({
  crumbs,
  eyebrow,
  title,
  lead,
  children,
}: {
  crumbs: Crumb[]
  eyebrow?: string
  title: string
  lead?: string
  children?: React.ReactNode
}) {
  return (
    <div className="subbar">
      <div className="container">
        <Crumbs items={crumbs} />
        <div className="page-head" style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {eyebrow ? <p className="eyebrow" style={{ margin: 0 }}>{eyebrow}</p> : null}
          <h1 className="page-title">{title}</h1>
          {lead ? <p className="lead" style={{ maxWidth: 720 }}>{lead}</p> : null}
          {children}
        </div>
      </div>
    </div>
  )
}

/** Ряд фильтров-«таблеток». С `counts` показывает число материалов и скрывает пустые рубрики. */
export function FilterChips({
  base,
  param,
  options,
  current,
  allLabel = 'Все',
  counts,
}: {
  base: string
  param: string
  options: readonly { label: string; value: string }[]
  current?: string
  allLabel?: string
  counts?: Record<string, number>
}) {
  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : undefined
  const visible = counts ? options.filter((o) => (counts[o.value] ?? 0) > 0 || o.value === current) : options
  return (
    <div className="chips" role="list">
      <Link role="listitem" className={`chip${!current ? ' active' : ''}`} href={base}>
        {allLabel}
        {total !== undefined ? <span className="chip-count">{total}</span> : null}
      </Link>
      {visible.map((o) => (
        <Link
          role="listitem"
          key={o.value}
          className={`chip${current === o.value ? ' active' : ''}`}
          href={`${base}?${param}=${o.value}`}
        >
          {o.label}
          {counts ? <span className="chip-count">{counts[o.value] ?? 0}</span> : null}
        </Link>
      ))}
    </div>
  )
}
