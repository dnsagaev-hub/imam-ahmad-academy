import type { Where } from 'payload'

import type { CourseDoc, LessonDoc } from './learning'
import { getPayloadClient } from './payload'

/* Запросы к базе для страниц сайта. Скрытые (неопубликованные) материалы не показываются. */

const published: Where = { isPublished: { equals: true } }

export type MediaDoc = { id: number | string; url?: string | null; filename?: string | null; alt?: string | null; mimeType?: string | null }

export const mediaUrl = (m: unknown): string | null =>
  m && typeof m === 'object' && 'url' in m ? ((m as MediaDoc).url ?? null) : null

export async function getSettings() {
  const payload = await getPayloadClient()
  return (await payload.findGlobal({ slug: 'settings', depth: 0 })) as Record<string, any>
}

export async function getCourses(level?: string) {
  const payload = await getPayloadClient()
  const where: Where = level ? { and: [published, { level: { equals: level } }] } : published
  const res = await payload.find({ collection: 'courses', where, sort: 'order', depth: 1, limit: 100 })
  return res.docs as unknown as CourseDoc[]
}

export async function getCourseBySlug(slug: string) {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'courses',
    where: { and: [published, { slug: { equals: slug } }] },
    depth: 2,
    limit: 1,
  })
  return (res.docs[0] as unknown as CourseDoc) ?? null
}

export async function getLessonBySlug(slug: string) {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'lessons',
    where: { and: [published, { slug: { equals: slug } }] },
    depth: 1,
    limit: 1,
  })
  return (res.docs[0] as unknown as LessonDoc) ?? null
}

export async function getLessons(opts: { kind: 'audio' | 'video'; category?: string; limit?: number }) {
  const payload = await getPayloadClient()
  const and: Where[] = [published]
  if (opts.kind === 'audio') and.push({ audio: { exists: true } })
  else and.push({ videoUrl: { exists: true } }, { videoUrl: { not_equals: '' } })
  if (opts.category) and.push({ category: { equals: opts.category } })
  const res = await payload.find({
    collection: 'lessons',
    where: { and },
    sort: '-createdAt',
    depth: 1,
    limit: opts.limit ?? 60,
  })
  return res.docs as unknown as LessonDoc[]
}

export async function getArticles(opts: { category?: string; limit?: number } = {}) {
  const payload = await getPayloadClient()
  const where: Where = opts.category ? { and: [published, { category: { equals: opts.category } }] } : published
  const res = await payload.find({ collection: 'articles', where, sort: '-publishedAt', depth: 0, limit: opts.limit ?? 60 })
  return res.docs as Record<string, any>[]
}

export async function getArticleBySlug(slug: string) {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'articles',
    where: { and: [published, { slug: { equals: slug } }] },
    depth: 1,
    limit: 1,
  })
  return (res.docs[0] as Record<string, any>) ?? null
}

export async function getBooks(opts: { category?: string; limit?: number } = {}) {
  const payload = await getPayloadClient()
  const where: Where = opts.category ? { and: [published, { category: { equals: opts.category } }] } : published
  const res = await payload.find({ collection: 'books', where, sort: 'order', depth: 1, limit: opts.limit ?? 100 })
  return res.docs as Record<string, any>[]
}

/** Курс → количество опубликованных уроков. */
export function lessonCount(course: CourseDoc): number {
  return (course.modules ?? []).reduce(
    (n, m) => n + (m.lessons ?? []).filter((l) => typeof l === 'object' && (l as LessonDoc).isPublished !== false).length,
    0,
  )
}

export function plural(n: number, forms: [string, string, string]): string {
  const a = Math.abs(n) % 100
  const b = a % 10
  if (a > 10 && a < 20) return forms[2]
  if (b > 1 && b < 5) return forms[1]
  if (b === 1) return forms[0]
  return forms[2]
}

export const lessonsWord = (n: number) => `${n} ${plural(n, ['урок', 'урока', 'уроков'])}`
