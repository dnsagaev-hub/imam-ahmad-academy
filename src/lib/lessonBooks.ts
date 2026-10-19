import type { Where } from 'payload'

import { toBookItem, type BookItem } from './books'
import { flattenCourse, type CourseDoc, type Id } from './learning'
import { getPayloadClient } from './payload'
import { getCourses } from './queries'

/*
 * Уроки по книгам. Книга урока — поле «Книга» в уроке; если оно пустое, а урок входит в курс, —
 * первая книга курса («Учебники из библиотеки»). Урок без книги показывается в блоке «Другие уроки».
 */

export type LessonKind = 'audio' | 'video' | 'text'

const idOf = (v: unknown): string | null => {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'object') return 'id' in v ? String((v as { id: Id }).id) : null
  return String(v)
}

/** Урок → курс (первый по порядку курсов) с номером урока в нём и id книги урока. */
export function lessonContext(lessons: Record<string, any>[], courses: CourseDoc[]) {
  const courseOf = new Map<string, { title: string; slug: string; number: number; bookId: string | null }>()
  for (const c of courses) {
    const first = Array.isArray(c.books) ? idOf(c.books[0]) : null
    for (const f of flattenCourse(c)) {
      const k = String(f.lesson.id)
      if (!courseOf.has(k)) courseOf.set(k, { title: c.title, slug: String(c.slug ?? ''), number: f.number, bookId: first })
    }
  }
  const bookIdOf = new Map<string, string>()
  for (const l of lessons) {
    const b = idOf(l.book) ?? courseOf.get(String(l.id))?.bookId ?? null
    if (b) bookIdOf.set(String(l.id), b)
  }
  return { courseOf, bookIdOf }
}

/** Опубликованные книги по списку id (скрытая книга не показывается — её уроки попадут в «Другие уроки»). */
export async function getBooksByIds(ids: string[]): Promise<Map<string, BookItem>> {
  const unique = [...new Set(ids)]
  if (!unique.length) return new Map()
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'books',
    where: { and: [{ isPublished: { equals: true } }, { id: { in: unique } }] },
    sort: 'order',
    depth: 1,
    limit: unique.length,
  })
  return new Map(res.docs.map((d) => [String(d.id), toBookItem(d as Record<string, any>)]))
}

export type ShelfBook = BookItem & { count: number }

/** Полка: книги, по которым есть уроки из списка, в порядке библиотеки, с числом уроков. */
export function shelfOf<T>(items: T[], bookOf: (i: T) => BookItem | null): ShelfBook[] {
  const map = new Map<string, ShelfBook>()
  for (const i of items) {
    const b = bookOf(i)
    if (!b) continue
    const cur = map.get(b.id)
    if (cur) cur.count++
    else map.set(b.id, { ...b, count: 1 })
  }
  return [...map.values()].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'ru'))
}

const kindWhere: Record<LessonKind, Where[]> = {
  audio: [{ audio: { exists: true } }],
  video: [{ videoUrl: { exists: true } }, { videoUrl: { not_equals: '' } }],
  text: [{ isText: { equals: true } }],
}

/** Сколько опубликованных уроков каждого вида есть по книге (для страницы книги в библиотеке). */
export async function getBookLessonCounts(bookId: Id): Promise<Record<LessonKind, number>> {
  const payload = await getPayloadClient()
  const courses = await getCourses()
  const out: Record<LessonKind, number> = { audio: 0, video: 0, text: 0 }
  for (const kind of Object.keys(kindWhere) as LessonKind[]) {
    const res = await payload.find({
      collection: 'lessons',
      where: { and: [{ isPublished: { equals: true } }, ...kindWhere[kind]] },
      depth: 0,
      limit: 2000,
      pagination: false,
      select: { book: true },
    })
    const { bookIdOf } = lessonContext(res.docs as Record<string, any>[], courses)
    out[kind] = [...bookIdOf.values()].filter((b) => b === String(bookId)).length
  }
  return out
}
