import Link from 'next/link'

import { deathLabel, type BookItem } from '@/lib/books'

import { BookCover } from './BookCover'

export function BookTile({ b }: { b: BookItem }) {
  return (
    <Link href={`/library/${b.slug}`} className="card lift btile">
      <BookCover titleAr={b.titleAr} title={b.title} authorAr={b.authorAr} kind={b.kind} coverUrl={b.coverUrl} />
      <div className="btile-body">
        <div className="btile-tags">
          <span className={`btag btag-${b.kind}`}>{b.kindLabel}</span>
          {b.levelLabel ? <span className="btag btag-level">{b.levelLabel}</span> : null}
          {b.isMutamad ? (
            <span className="btag btag-mutamad" title="Опорная книга мазхаба">
              ★ опорная
            </span>
          ) : null}
        </div>
        <h3>{b.title}</h3>
        <span className="btile-author">
          {[b.author, deathLabel(b.authorDeath)].filter(Boolean).join(', ')}
        </span>
        {b.baseTitle ? <span className="btile-base">на «{b.baseTitle}»</span> : null}
        <span className="btile-foot">
          <span>{b.languageLabel}</span>
          <span>{b.hasPdf ? 'PDF' : b.hasLinks ? 'онлайн' : 'описание'}</span>
        </span>
      </div>
    </Link>
  )
}
