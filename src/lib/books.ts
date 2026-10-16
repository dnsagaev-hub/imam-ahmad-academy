import { BOOK_CATEGORIES, BOOK_KINDS, BOOK_LANGS, BOOK_LEVELS, labelOf } from './constants'

/** Лёгкая версия книги для списков и клиентских компонентов. */
export type BookItem = {
  id: string
  slug: string
  title: string
  titleAr: string
  author: string
  authorAr: string
  authorDeath: number | null
  category: string
  categoryLabel: string
  kind: string
  kindLabel: string
  level: string
  levelLabel: string
  language: string
  languageLabel: string
  isMutamad: boolean
  description: string
  coverUrl: string | null
  hasPdf: boolean
  hasLinks: boolean
  baseId: string | null
  baseTitle: string
  order: number
}

const url = (m: unknown): string | null =>
  m && typeof m === 'object' && 'url' in m ? (((m as { url?: string | null }).url ?? null) as string | null) : null

export function toBookItem(b: Record<string, any>): BookItem {
  const base = b.baseBook && typeof b.baseBook === 'object' ? b.baseBook : null
  return {
    id: String(b.id),
    slug: b.slug ?? String(b.id),
    title: b.title ?? '',
    titleAr: b.titleAr ?? '',
    author: b.author ?? '',
    authorAr: b.authorAr ?? '',
    authorDeath: typeof b.authorDeath === 'number' ? b.authorDeath : null,
    category: b.category ?? 'other',
    categoryLabel: labelOf(BOOK_CATEGORIES, b.category),
    kind: b.kind ?? 'matn',
    kindLabel: labelOf(BOOK_KINDS, b.kind ?? 'matn'),
    level: b.level ?? '',
    levelLabel: BOOK_LEVELS.find((l) => l.value === b.level)?.short ?? '',
    language: b.language ?? 'ar',
    languageLabel: labelOf(BOOK_LANGS, b.language ?? 'ar'),
    isMutamad: Boolean(b.isMutamad),
    description: b.description ?? '',
    coverUrl: url(b.cover),
    hasPdf: Boolean(url(b.file)),
    hasLinks: Array.isArray(b.links) && b.links.length > 0,
    baseId: b.baseBook ? String(base ? base.id : b.baseBook) : null,
    baseTitle: base?.title ?? '',
    order: typeof b.order === 'number' ? b.order : 10,
  }
}

/** «ум. 1083 г. х.» */
export const deathLabel = (y: number | null | undefined) => (y ? `ум. ${y} г. х.` : '')

/** Путь изучения: для каждой ступени — матны и их шархи. */
export function studyPath(items: BookItem[], category = 'fiqh') {
  const levels = ['beginner', 'intermediate', 'advanced'] as const
  return levels
    .map((level) => {
      const matns = items
        .filter((b) => b.category === category && b.level === level && b.kind === 'matn')
        .sort((a, b) => a.order - b.order)
      return {
        level,
        label: BOOK_LEVELS.find((l) => l.value === level)!.short,
        matns: matns.map((m) => ({
          matn: m,
          commentaries: items.filter((c) => c.baseId === m.id && c.kind !== 'translation').sort((a, b) => a.order - b.order),
          translations: items.filter((c) => c.baseId === m.id && c.kind === 'translation'),
        })),
      }
    })
    .filter((s) => s.matns.length > 0)
}
