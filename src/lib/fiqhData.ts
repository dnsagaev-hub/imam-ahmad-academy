import { getPayloadClient } from './payload'
import { plural } from './quran'

/* Запросы раздела «Фикх». Скрытое (без галочки «Опубликовано») не показывается, а у ученика доступ
   к коллекциям и так ограничен опубликованным (publishedOrAdmin). */

export type FiqhPart = { id: number | string; title: string; titleAr?: string | null; slug: string; order?: number | null }
export type FiqhBook = FiqhPart & { part: number | string }
export type FiqhSentence = { id?: string | null; arabic: string; translation?: string | null } & Record<string, unknown>
export type FiqhChapter = {
  id: number | string
  title: string
  titleAr?: string | null
  order: number
  intro?: unknown
  scheme?: unknown
  schemeNote?: unknown
  topics?: { from: number; title: string }[] | null
  sentences?: FiqhSentence[] | null
}

export const booksWord = (n: number) => `${n} ${plural(n, ['книга', 'книги', 'книг'])}`
export const chaptersWord = (n: number) => `${n} ${plural(n, ['раздел', 'раздела', 'разделов'])}`
export const paragraphsWord = (n: number) => `${n} ${plural(n, ['абзац', 'абзаца', 'абзацев'])}`

const published = { isPublished: { equals: true } }

type ChapterStat = { id: number | string; book: number | string; title: string; titleAr?: string | null; order: number; sentences: number; translated: number }

/** Разделы книг без текста: только число абзацев и сколько из них переведено. */
async function chapterStats(books: (number | string)[]): Promise<ChapterStat[]> {
  if (!books.length) return []
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'fiqh-chapters',
    where: { and: [published, { book: { in: books } }] },
    select: { book: true, title: true, titleAr: true, order: true, sentences: { translation: true } },
    sort: 'order',
    depth: 0,
    pagination: false,
  })
  return (res.docs as unknown as (Omit<ChapterStat, 'sentences' | 'translated'> & { sentences?: { translation?: string | null }[] | null })[]).map((c) => ({
    ...c,
    sentences: c.sentences?.length ?? 0,
    translated: (c.sentences ?? []).filter((s) => s.translation?.trim()).length,
  }))
}

async function findPart(slug: string) {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'fiqh-parts', where: { and: [published, { slug: { equals: slug } }] }, depth: 0, limit: 1 })
  return res.docs[0] as unknown as FiqhPart | undefined
}

async function partBooks(partId: number | string) {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'fiqh-books', where: { and: [published, { part: { equals: partId } }] }, sort: 'order', depth: 0, pagination: false })
  return res.docs as unknown as FiqhBook[]
}

/** Части с числом книг (пустые тоже — с пометкой «Готовится»). */
export async function getFiqhParts() {
  try {
    const payload = await getPayloadClient()
    const [parts, books] = await Promise.all([
      payload.find({ collection: 'fiqh-parts', where: published, sort: 'order', depth: 0, pagination: false }),
      payload.find({ collection: 'fiqh-books', where: published, select: { part: true }, depth: 0, pagination: false }),
    ])
    const list = books.docs as unknown as { part: number | string }[]
    return (parts.docs as unknown as FiqhPart[]).map((p) => ({ ...p, books: list.filter((b) => String(b.part) === String(p.id)).length }))
  } catch {
    return []
  }
}

/** Часть со своими книгами (у книги — число разделов и переведено ли что-нибудь). */
export async function getFiqhPart(slug: string) {
  const part = await findPart(slug)
  if (!part) return null
  const books = await partBooks(part.id)
  const stats = await chapterStats(books.map((b) => b.id))
  return {
    part,
    books: books.map((b) => {
      const own = stats.filter((c) => String(c.book) === String(b.id))
      return { ...b, chapters: own.length, translated: own.reduce((n, c) => n + c.translated, 0) }
    }),
  }
}

/** Книга со списком своих разделов. */
export async function getFiqhBook(partSlug: string, bookSlug: string) {
  const part = await findPart(partSlug)
  if (!part) return null
  const books = await partBooks(part.id)
  const at = books.findIndex((b) => b.slug === bookSlug)
  if (at < 0) return null
  const book = books[at]
  return { part, book, chapters: await chapterStats([book.id]), prev: books[at - 1] ?? null, next: books[at + 1] ?? null }
}

/** Раздел с текстом; соседние разделы — в пределах книги. */
export async function getFiqhChapter(partSlug: string, bookSlug: string, n: number) {
  const data = await getFiqhBook(partSlug, bookSlug)
  if (!data) return null
  const at = data.chapters.findIndex((c) => c.order === n)
  if (at < 0) return null
  const payload = await getPayloadClient()
  const chapter = (await payload.findByID({ collection: 'fiqh-chapters', id: data.chapters[at].id, depth: 1 })) as unknown as FiqhChapter
  return { ...data, chapter, prev: data.chapters[at - 1] ?? null, next: data.chapters[at + 1] ?? null }
}
