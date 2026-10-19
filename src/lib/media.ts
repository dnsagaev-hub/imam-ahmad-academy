import { toEmbedUrl } from './video'
import { LESSON_CATEGORIES, labelOf } from './constants'
import type { CourseDoc, LessonDoc } from './learning'
import { getBooksByIds, lessonContext } from './lessonBooks'
import { getCourses, getLessons, mediaUrl } from './queries'

/* Данные для разделов «Аудиоуроки» и «Видеоуроки». В браузер уходят только эти поля (без ответов тестов). */

export type MediaItem = {
  id: string
  title: string
  slug: string
  category: string
  categoryLabel: string
  duration: string | null
  seconds: number
  audioUrl: string | null
  thumbUrl: string | null
  videoUrl: string | null
  courseTitle: string | null
  courseSlug: string | null
  lessonNumber: number | null
  hasTest: boolean
  hasFiles: boolean
  hasNotes: boolean
  bookId: string | null
  excerpt: string | null
  teacher: string | null
  createdAt: string
}

/** «46:20» или «1:05:30» → секунды. */
export function parseDuration(d?: string | null): number {
  if (!d) return 0
  const parts = d.replace(/[^\d:]/g, '').split(':').map(Number)
  if (parts.some((n) => Number.isNaN(n))) return 0
  return parts.reduce((acc, n) => acc * 60 + n, 0)
}

/** 9000 → «2 ч 30 мин» */
export function formatTotal(seconds: number): string {
  const m = Math.round(seconds / 60)
  if (m < 60) return `${m} мин`
  return `${Math.floor(m / 60)} ч ${m % 60} мин`
}

export async function getMediaItems(kind: 'audio' | 'video') {
  const [lessons, courses] = await Promise.all([getLessons({ kind, limit: 1000 }), getCourses()])

  const { courseOf, bookIdOf } = lessonContext(lessons as Record<string, any>[], courses as CourseDoc[])
  const books = await getBooksByIds([...bookIdOf.values()])

  const items: MediaItem[] = (lessons as (LessonDoc & Record<string, any>)[]).map((l) => {
    const c = courseOf.get(String(l.id))
    return {
      id: String(l.id),
      title: l.title,
      slug: String(l.slug ?? ''),
      category: String(l.category ?? ''),
      categoryLabel: labelOf(LESSON_CATEGORIES, l.category),
      duration: l.duration ?? null,
      seconds: parseDuration(l.duration),
      audioUrl: mediaUrl(l.audio),
      thumbUrl: mediaUrl(l.thumbnail),
      videoUrl: toEmbedUrl(typeof l.videoUrl === 'string' ? l.videoUrl : null),
      courseTitle: c?.title ?? null,
      courseSlug: c?.slug ?? null,
      lessonNumber: c?.number ?? null,
      hasTest: Boolean(l.questions?.length),
      hasFiles: Boolean(l.files?.length),
      hasNotes: Boolean(l.summary || l.definitionAr),
      bookId: books.has(bookIdOf.get(String(l.id)) ?? '') ? bookIdOf.get(String(l.id))! : null,
      excerpt: l.excerpt ?? null,
      teacher: l.teacher ?? null,
      createdAt: String(l.createdAt ?? ''),
    }
  })

  const counts: Record<string, number> = {}
  for (const i of items) counts[i.category] = (counts[i.category] ?? 0) + 1

  return { items, counts, courses, books }
}

/** Порядок уроков одной книги: по номеру в курсе, затем от старых к новым. */
export function byStudyOrder<T extends { lessonNumber?: number | null; createdAt?: unknown }>(a: T, b: T) {
  return (a.lessonNumber ?? 1e9) - (b.lessonNumber ?? 1e9) || String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? ''))
}
