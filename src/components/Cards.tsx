import { ArticleCardClient } from './ArticleCardClient'
import type { ArticleItem } from './ArticlesBrowser'
import Link from 'next/link'

import { ARTICLE_CATEGORIES, BOOK_CATEGORIES, COURSE_LEVELS, LESSON_CATEGORIES, labelOf } from '@/lib/constants'
import type { CourseDoc, LessonDoc } from '@/lib/learning'
import { lessonCount, lessonsWord, mediaUrl } from '@/lib/queries'


export function CourseCard({ course }: { course: CourseDoc }) {
  const c = course as CourseDoc & Record<string, any>
  return (
    <Link href={`/courses/${c.slug}`} className="card lift course-card">
      <div className="course-cover">
        <span lang="ar">{c.bookTitleAr || 'العلم'}</span>
      </div>
      <div className="course-body">
        <span className="badge">{labelOf(COURSE_LEVELS, c.level)}</span>
        <h3>{c.title}</h3>
        <p>{c.description}</p>
        <div className="course-meta">
          <span>{lessonsWord(lessonCount(course))}</span>
          {c.teacher ? <span>{c.teacher}</span> : null}
        </div>
      </div>
    </Link>
  )
}

export function TextLessonCard({ lesson }: { lesson: LessonDoc }) {
  const l = lesson as LessonDoc & Record<string, any>
  const bilingual = Array.isArray(l.content) && l.content.some((b: any) => b?.blockType === 'matn')
  return (
    <article className="card lift article-card text-card">
      <div className="text-card-top">
        <span className="tag">{labelOf(LESSON_CATEGORIES, l.category)}</span>
        {bilingual ? (
          <span className="tag-soft" title="Арабский текст с переводом">
            <span lang="ar">ع</span> + рус
          </span>
        ) : null}
        {l.questions?.length ? <span className="tag-test">тест</span> : null}
      </div>
      <h3>
        <Link href={`/lessons/${l.slug}`}>{l.title}</Link>
      </h3>
      {l.excerpt ? <p>{l.excerpt}</p> : null}
      {l.sourceRef ? <p className="text-card-src">{l.sourceRef}</p> : null}
      <div className="text-card-foot">
        <span>{l.readingMinutes ? `≈ ${l.readingMinutes} мин чтения` : 'Текстовый урок'}</span>
        <Link href={`/lessons/${l.slug}`} style={{ fontWeight: 700, fontSize: 14 }}>
          Читать урок →
        </Link>
      </div>
    </article>
  )
}

export function toArticleItem(a: Record<string, any>): ArticleItem {
  return {
    id: String(a.id),
    slug: String(a.slug ?? ''),
    title: a.title,
    kind: a.kind ?? 'article',
    category: a.category,
    categoryLabel: labelOf(ARTICLE_CATEGORIES, a.category),
    excerpt: a.excerpt ?? '',
    question: a.question ?? null,
    publishedAt: a.publishedAt ?? null,
    readingMinutes: a.readingMinutes ?? null,
  }
}

export function ArticleCard({ article }: { article: Record<string, any> }) {
  return <ArticleCardClient a={toArticleItem(article)} />
}

export function BookCard({ book }: { book: Record<string, any> }) {
  const url = mediaUrl(book.file)
  return (
    <a href={url ?? '#'} target="_blank" rel="noopener" className="card lift book-card">
      <div className="book-cover">
        <div>
          <span lang="ar">{book.titleAr || book.title}</span>
        </div>
      </div>
      <h3>{book.title}</h3>
      <span style={{ fontSize: 13, color: 'var(--muted)' }}>
        {[book.author, labelOf(BOOK_CATEGORIES, book.category), 'PDF'].filter(Boolean).join(' · ')}
      </span>
    </a>
  )
}
