import Link from 'next/link'

export type HadithCard = { href: string; n: number; title: string; titleAr?: string | null; meta: string; empty?: boolean; soon?: string }

/** Карточки тем и книг разделов «Хадисы» и «Фикх» — в том же виде, что список сур в «Коране». */
export function HadithCards({ items }: { items: HadithCard[] }) {
  return (
    <ul className="qi-grid hd-grid">
      {items.map((c) => (
        <li key={c.href}>
          <Link href={c.href} className="qi-card">
            <span className="qi-num" aria-hidden="true">
              <svg viewBox="0 0 48 48">
                <rect x="9" y="9" width="30" height="30" rx="3" />
                <rect x="9" y="9" width="30" height="30" rx="3" transform="rotate(45 24 24)" />
              </svg>
              <b>{c.n}</b>
            </span>
            <span className="qi-main">
              <span className="qi-ru">{c.title}</span>
              <span className="qi-meta">
                {c.meta}
                {c.empty ? <span className="hd-soon">{c.soon ?? 'готовится'}</span> : null}
              </span>
            </span>
            {c.titleAr ? (
              <span className="qi-ar hd-card-ar" lang="ar" dir="rtl">
                {c.titleAr}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  )
}
