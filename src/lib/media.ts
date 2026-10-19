import { toEmbedUrl } from './video'
import { LESSON_CATEGORIES, labelOf } from './constants'
import { flattenCourse, type CourseDoc, type LessonDoc } from './learning'
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

  const courseOf = new Map<string, { title: string; slug: string; number: number }>()
  for (const c of courses as CourseDoc[]) {
    for (const f of flattenCourse(c)) {
      const k = String(f.lesson.id)
      if (!courseOf.has(k)) courseOf.set(k, { title: c.title, slug: String(c.slug ?? ''), number: f.number })
    }
  }

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
      excerpt: l.excerpt ?? null,
      teacher: l.teacher ?? null,
      createdAt: String(l.createdAt ?? ''),
    }
  })

  const counts: Record<string, number> = {}
  for (const i of items) counts[i.category] = (counts[i.category] ?? 0) + 1

  return { items, counts, courses }
}
