import { ArticleCardClient } from './ArticleCardClient'
import type { ArticleItem } from './ArticlesBrowser'
import Link from 'next/link'

import { BookTile } from '@/components/library/BookTile'
import { toBookItem } from '@/lib/books'
import { ARTICLE_CATEGORIES, COURSE_LEVELS, LESSON_CATEGORIES, labelOf } from '@/lib/constants'
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
  const bilingual = Array.isArray(l.content) && l.content.some((b: any) => b?.blockType === 'matn' || b?.blockType === 'hadith')
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
        {l.summary || l.definitionAr ? <span className="tag-soft">конспект</span> : null}
        {l.files?.length ? <span className="tag-soft">файлы</span> : null}
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
  return <BookTile b={toBookItem(book)} />
}
