import { getPayloadClient } from './payload'
import { plural } from './quran'

/* Запросы раздела «Хадисы». Скрытое (без галочки «Опубликовано») не показывается, а у ученика доступ
   к коллекциям и так ограничен опубликованным (publishedOrAdmin). */

export type HadithTopic = { id: number | string; title: string; titleAr?: string | null; slug: string; order?: number | null }
export type HadithBook = HadithTopic & { topic: number | string }
export type HadithSection = { id: number | string; title: string; titleAr?: string | null; order?: number | null }
export type Hadith = {
  id: number | string
  number: number
  section?: number | string | null
  arabic: string
  translation: string
  source?: unknown
  grade?: unknown
  explanation?: unknown
}

export const books = (n: number) => `${n} ${plural(n, ['книга', 'книги', 'книг'])}`
export const hadiths = (n: number) => `${n} ${plural(n, ['хадис', 'хадиса', 'хадисов'])}`
export const chapters = (n: number) => `${n} ${plural(n, ['глава', 'главы', 'глав'])}`

const published = { isPublished: { equals: true } }

/** Сколько опубликованных хадисов в каждой книге (id книги → число). */
async function hadithCounts(books: (number | string)[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  if (!books.length) return counts
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'hadiths',
    where: { and: [published, { book: { in: books } }] },
    select: { book: true },
    depth: 0,
    pagination: false,
  })
  for (const h of res.docs as { book: number | string }[]) counts.set(String(h.book), (counts.get(String(h.book)) ?? 0) + 1)
  return counts
}

async function allBooks(): Promise<HadithBook[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'hadith-books', where: published, sort: 'order', depth: 0, pagination: false })
  return res.docs as unknown as HadithBook[]
}

/** Темы с числом книг и хадисов (пустые тоже — с пометкой «Готовится»). */
export async function getHadithTopics() {
  try {
    const payload = await getPayloadClient()
    const [topics, books] = await Promise.all([
      payload.find({ collection: 'hadith-topics', where: published, sort: 'order', depth: 0, pagination: false }),
      allBooks(),
    ])
    const counts = await hadithCounts(books.map((b) => b.id))
    return (topics.docs as unknown as HadithTopic[]).map((t) => {
      const own = books.filter((b) => String(b.topic) === String(t.id))
      return { ...t, books: own.length, hadiths: own.reduce((n, b) => n + (counts.get(String(b.id)) ?? 0), 0) }
    })
  } catch {
    return []
  }
}

export async function getHadithTopic(slug: string) {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'hadith-topics', where: { and: [published, { slug: { equals: slug } }] }, depth: 0, limit: 1 })
  const topic = res.docs[0] as unknown as HadithTopic | undefined
  if (!topic) return null
  const books = await payload.find({
    collection: 'hadith-books',
    where: { and: [published, { topic: { equals: topic.id } }] },
    sort: 'order',
    depth: 0,
    pagination: false,
  })
  const list = books.docs as unknown as HadithBook[]
  const [counts, sections] = await Promise.all([
    hadithCounts(list.map((b) => b.id)),
    list.length
      ? payload.find({ collection: 'hadith-sections', where: { book: { in: list.map((b) => b.id) } }, select: { book: true }, depth: 0, pagination: false })
      : Promise.resolve({ docs: [] }),
  ])
  const sectionCount = (id: number | string) => (sections.docs as { book: number | string }[]).filter((s) => String(s.book) === String(id)).length
  return { topic, books: list.map((b) => ({ ...b, hadiths: counts.get(String(b.id)) ?? 0, sections: sectionCount(b.id) })) }
}

/** Книга со своими главами и хадисами (по номеру). */
export async function getHadithBook(topicSlug: string, bookSlug: string) {
  const payload = await getPayloadClient()
  const t = await payload.find({ collection: 'hadith-topics', where: { and: [published, { slug: { equals: topicSlug } }] }, depth: 0, limit: 1 })
  const topic = t.docs[0] as unknown as HadithTopic | undefined
  if (!topic) return null
  const b = await payload.find({
    collection: 'hadith-books',
    where: { and: [published, { slug: { equals: bookSlug } }, { topic: { equals: topic.id } }] },
    depth: 0,
    limit: 1,
  })
  const book = b.docs[0] as unknown as HadithBook | undefined
  if (!book) return null
  const [sections, hadiths, siblings] = await Promise.all([
    payload.find({ collection: 'hadith-sections', where: { book: { equals: book.id } }, sort: 'order', depth: 0, pagination: false }),
    payload.find({ collection: 'hadiths', where: { and: [published, { book: { equals: book.id } }] }, sort: 'number', depth: 0, pagination: false }),
    payload.find({ collection: 'hadith-books', where: { and: [published, { topic: { equals: topic.id } }] }, sort: 'order', depth: 0, pagination: false }),
  ])
  const list = siblings.docs as unknown as HadithBook[]
  const at = list.findIndex((x) => String(x.id) === String(book.id))
  return {
    topic,
    book,
    sections: sections.docs as unknown as HadithSection[],
    hadiths: hadiths.docs as unknown as Hadith[],
    prev: at > 0 ? list[at - 1] : null,
    next: at >= 0 && at < list.length - 1 ? list[at + 1] : null,
  }
}
