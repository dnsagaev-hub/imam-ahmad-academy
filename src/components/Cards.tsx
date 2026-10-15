import Link from 'next/link'

import { ARTICLE_CATEGORIES, BOOK_CATEGORIES, COURSE_LEVELS, LESSON_CATEGORIES, labelOf } from '@/lib/constants'
import type { CourseDoc, LessonDoc } from '@/lib/learning'
import { lessonCount, lessonsWord, mediaUrl } from '@/lib/queries'

import { PlayIcon } from './Icons'

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

export function AudioRow({ lesson }: { lesson: LessonDoc }) {
  const url = mediaUrl(lesson.audio)
  return (
    <div className="audio-row">
      <span className="round-play" aria-hidden="true">
        <PlayIcon />
      </span>
      <div className="info">
        <Link className="title" href={`/lessons/${lesson.slug}`}>
          {lesson.title}
        </Link>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
          {labelOf(LESSON_CATEGORIES, lesson.category)}
          {lesson.duration ? ` · ${lesson.duration}` : ''}
        </div>
      </div>
      {url ? (
        <audio controls preload="none" src={url} aria-label={`Слушать: ${lesson.title}`}>
          <a href={url}>Скачать MP3</a>
        </audio>
      ) : null}
    </div>
  )
}

export function VideoCard({ lesson }: { lesson: LessonDoc }) {
  const testCount = lesson.questions?.length ?? 0
  return (
    <Link href={`/lessons/${lesson.slug}`} className="card lift video-card">
      <div className="video-thumb">
        <span className="play">
          <PlayIcon size={24} color="#0B1F3A" />
        </span>
        {lesson.duration ? <span className="dur">{lesson.duration}</span> : null}
      </div>
      <div className="video-body">
        <span className="tag">{labelOf(LESSON_CATEGORIES, lesson.category)}</span>
        <h3>{lesson.title}</h3>
        {testCount ? <span style={{ fontSize: 13, color: 'var(--muted)' }}>После урока: тест из {testCount} вопросов</span> : null}
      </div>
    </Link>
  )
}

export function ArticleCard({ article }: { article: Record<string, any> }) {
  const kind = article.kind === 'question' ? 'Разбор вопроса' : 'Статья'
  return (
    <article className="card lift article-card">
      <span className="tag">
        {labelOf(ARTICLE_CATEGORIES, article.category)} · {kind}
      </span>
      <h3>
        <Link href={`/articles/${article.slug}`}>{article.title}</Link>
      </h3>
      <p>{article.excerpt}</p>
      <Link href={`/articles/${article.slug}`} style={{ marginTop: 6, fontWeight: 700, fontSize: 14 }}>
        Читать →
      </Link>
    </article>
  )
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
