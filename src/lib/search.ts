import { ARTICLE_CATEGORIES, TEXT_CATEGORIES, labelOf } from './constants'
import { getPayloadClient } from './payload'
import { SURAHS, fatihaAyahs, stripAyahMark } from './quran'
import { getSurahs } from './quranData'

/*
 * Поиск по сайту (задача 49). Текст всех разделов собирается из базы в память сервера и обновляется
 * не реже раза в минуту; ищется без огласовок, вида алифа, «ё» и окончаний (см. `normalize`, `queryWords`).
 * Скрытое (без галочки «Опубликовано») не попадает в поиск. Тесты уроков не читаются вовсе
 * (`select` уроков без вопросов), поэтому верные ответы сюда не попадают.
 */

export const SEARCH_GROUPS = [
  { value: 'quran', label: 'Коран' },
  { value: 'hadith', label: 'Хадисы' },
  { value: 'fiqh', label: 'Фикх' },
  { value: 'courses', label: 'Курсы' },
  { value: 'lessons', label: 'Уроки' },
  { value: 'articles', label: 'Статьи и вопросы' },
  { value: 'library', label: 'Библиотека' },
] as const
export type SearchGroup = (typeof SEARCH_GROUPS)[number]['value']

/** Кусок текста: одно поле (перевод, арабский текст, абзац описания). */
type Part = { text: string; ar: boolean }
type Entry = {
  group: SearchGroup
  title: string
  titleAr?: string
  /** Где это на сайте: «Хадисы · Ислам и иман». */
  where: string
  href: string
  parts: Part[]
  key: string
  titleKey: string
}

export type Snippet = { ar: boolean; pieces: { text: string; mark: boolean }[] }
export type SearchHit = { group: SearchGroup; title: string; titleAr?: string; where: string; href: string; snippet: Snippet | null }

/* ---------- Нормализация ---------- */

// Огласовки, знаки мусхафа, татвиль и алиф (во всех видах): у мусхафа и обычного письма алиф часто расходится
const AR_DROP = /[ؐ-ًؚ-ٰٟۖ-ۭـاأإآٱ]/
const PUNCT_DROP = /[‘’'ʼ`«»"“”„\-‐–—­]/
const AR_MAP: Record<string, string> = { 'ى': 'ي', 'ة': 'ه', 'ؤ': 'و', 'ئ': 'ي', 'ё': 'е' }

/** Строка для сравнения и номер исходного знака для каждого её знака (чтобы выделить найденное в тексте). */
function normalizeMapped(s: string): { t: string; map: number[] } {
  let t = ''
  const map: number[] = []
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (AR_DROP.test(c) || PUNCT_DROP.test(c)) continue
    let lower = c.toLowerCase()
    if (lower.length !== 1) lower = c
    lower = AR_MAP[lower] ?? lower
    if (/\s/.test(lower)) lower = ' '
    t += lower
    map.push(i)
  }
  return { t, map }
}

export const normalize = (s: string) => normalizeMapped(s).t

const isArabic = (s: string) => {
  const ar = (s.match(/[؀-ۿ]/g) ?? []).length
  const other = (s.match(/[a-zA-Zа-яА-ЯёЁ]/g) ?? []).length
  return ar > other
}

const ENDINGS2 = /(ами|ями|ого|его|ому|ему|ах|ях|ов|ев|ам|ям|ом|ем|ой|ей|ий|ый|ая|яя|ое|ее|ую|юю)$/
const ENDINGS1 = /[аеиоуыэюяйь]$/

/** Слова запроса: без «аль-» в начале, без окончаний у русских слов от 5 букв; короче 2 знаков — отбрасываются. */
export function queryWords(q: string): string[] {
  const words = q
    .slice(0, 100)
    .split(/\s+/)
    .map((w) => w.replace(/^(аль|ал|ан|ар|ас|аш|ат|аз|ад|ль)[-‐–]/i, ''))
    .map(normalize)
    .map((w) => w.trim())
    .map((w) => {
      if (!/^[а-я]+$/.test(w) || w.length < 5) return w
      if (w.length >= 6 && ENDINGS2.test(w)) return w.replace(ENDINGS2, '')
      return w.replace(ENDINGS1, '')
    })
    .filter((w) => w.length >= 2)
  return [...new Set(words)].slice(0, 6)
}

/* ---------- Текст из полей ---------- */

const SKIP_KEYS = new Set(['id', 'blockType', 'blockName', 'kind', 'image', 'file', 'url', 'videoUrl', 'audio', 'thumbnail', 'slug', 'category', 'level', 'order', 'number', 'isPublished', 'createdAt', 'updatedAt'])

function lexicalText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as { type?: string; text?: string; children?: unknown[] }
  if (typeof n.text === 'string') return n.text
  return (n.children ?? []).map(lexicalText).join(n.type === 'list' ? ' ' : '')
}

/** Все тексты значения поля: строки, блоки урока, текст редактора (по абзацам). */
function texts(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') {
    if (v.trim()) out.push(v.trim())
  } else if (Array.isArray(v)) {
    for (const x of v) texts(x, out)
  } else if (v && typeof v === 'object') {
    const root = (v as { root?: { children?: unknown[] } }).root
    if (root) {
      for (const ch of root.children ?? []) {
        const t = lexicalText(ch).trim()
        if (t) out.push(t)
      }
    } else {
      for (const [k, x] of Object.entries(v)) if (!SKIP_KEYS.has(k)) texts(x, out)
    }
  }
  return out
}

const parts = (...values: unknown[]): Part[] => values.flatMap((v) => texts(v)).map((text) => ({ text, ar: isArabic(text) }))

/** `textOnly` — название лишь подпись места («Сура 1, аят 2»): ищется только текст, иначе слово «Фатиха» нашло бы все аяты. */
function entry(e: Omit<Entry, 'key' | 'titleKey'>, textOnly = false): Entry {
  const titleKey = textOnly ? '' : normalize(`${e.title} ${e.titleAr ?? ''}`)
  return { ...e, titleKey, key: `${titleKey} ${normalize(e.parts.map((p) => p.text).join('\n'))}` }
}

/* ---------- Сбор материалов ---------- */

type Doc = Record<string, any>
const published = { isPublished: { equals: true } }

let quranArabic: string[][] | null = null
async function loadQuranArabic(): Promise<string[][]> {
  if (quranArabic) return quranArabic
  const all: string[][] = []
  for (const s of SURAHS) {
    const mushaf = (await import(`@/data/quran/${s.n}.json`)).default as string[]
    all.push(s.n === 1 ? fatihaAyahs(mushaf).ayahs.map(stripAyahMark) : mushaf.map(stripAyahMark))
  }
  quranArabic = all
  return all
}

async function collect(): Promise<Entry[]> {
  const payload = await getPayloadClient()
  const find = async (collection: string, where: object, select?: object): Promise<Doc[]> => {
    try {
      const res = await payload.find({ collection: collection as never, where: where as never, select: select as never, depth: 0, pagination: false })
      return res.docs as Doc[]
    } catch {
      return []
    }
  }
  const [surahs, arabic, translations, hTopics, hBooks, hadiths, fParts, fBooks, fChapters, courses, lessons, articles, books] = await Promise.all([
    getSurahs(),
    loadQuranArabic(),
    find('quran-translations', published, { surah: true, ayahs: { number: true, text: true } }),
    find('hadith-topics', published, { slug: true, title: true }),
    find('hadith-books', published, { slug: true, title: true, titleAr: true, topic: true, order: true }),
    find('hadiths', published, { book: true, number: true, arabic: true, translation: true }),
    find('fiqh-parts', published, { slug: true, title: true, order: true }),
    find('fiqh-books', published, { slug: true, title: true, titleAr: true, part: true, order: true }),
    find('fiqh-chapters', published, { book: true, order: true, title: true, titleAr: true, topics: true, sentences: { arabic: true, translation: true } }),
    find('courses', published, { slug: true, title: true, description: true, teacher: true, bookTitleAr: true, bookAuthor: true, modules: { title: true }, order: true }),
    // Только поля текста: тест урока (вопросы и верные ответы) сюда не читается
    find('lessons', published, { slug: true, title: true, category: true, excerpt: true, sourceRef: true, content: true, body: true, definitionAr: true, definitionRu: true, summary: true, teacher: true }),
    find('articles', published, { slug: true, title: true, kind: true, category: true, excerpt: true, question: true, shortAnswer: true, sourceRef: true, blocks: true, body: true }),
    find('books', published, { slug: true, title: true, titleAr: true, author: true, authorAr: true, description: true, about: true, order: true }),
  ])
  const out: Entry[] = []

  // Коран: названия сур, затем аяты (перевод и арабский текст)
  for (const s of surahs) {
    out.push(entry({ group: 'quran', title: `Сура ${s.n} «${s.ru}»`, titleAr: s.ar, where: 'Коран', href: `/quran/${s.n}`, parts: parts(s.meaning) }))
  }
  const tr = new Map<number, Map<number, string>>()
  for (const t of translations) tr.set(Number(t.surah), new Map(((t.ayahs ?? []) as Doc[]).map((a) => [Number(a.number), String(a.text ?? '')])))
  for (const s of surahs) {
    const ayahs = arabic[s.n - 1] ?? []
    ayahs.forEach((ar, i) => {
      const no = i + 1
      out.push(
        entry({
          group: 'quran',
          title: `Сура ${s.n} «${s.ru}», аят ${no}`,
          where: 'Коран',
          href: `/quran/${s.n}#a${no}`,
          parts: [...parts(tr.get(s.n)?.get(no)), { text: ar, ar: true }],
        }, true),
      )
    })
  }

  // Хадисы: книги и хадисы (только из опубликованных тем и книг)
  const topics = new Map(hTopics.map((t) => [String(t.id), t]))
  const hb = new Map<string, Doc>()
  for (const b of [...hBooks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))) {
    const t = topics.get(String(b.topic))
    if (!t) continue
    hb.set(String(b.id), { ...b, topicDoc: t })
    out.push(entry({ group: 'hadith', title: `Книга «${b.title}»`, titleAr: b.titleAr ?? undefined, where: `Хадисы · ${t.title}`, href: `/hadith/${t.slug}/${b.slug}`, parts: [] }))
  }
  const hOrder = [...hb.keys()]
  for (const h of [...hadiths].sort((a, b) => hOrder.indexOf(String(a.book)) - hOrder.indexOf(String(b.book)) || a.number - b.number)) {
    const b = hb.get(String(h.book))
    if (!b) continue
    out.push(
      entry({
        group: 'hadith',
        title: `Хадис № ${h.number}`,
        where: `Хадисы · ${b.topicDoc.title} · ${b.title}`,
        href: `/hadith/${b.topicDoc.slug}/${b.slug}#h${h.number}`,
        parts: parts(h.translation, h.arabic),
      }, true),
    )
  }

  // Фикх: разделы (название, темы) и абзацы текста
  const fp = new Map(fParts.map((p) => [String(p.id), p]))
  const fb = new Map<string, Doc>()
  for (const b of fBooks) {
    const p = fp.get(String(b.part))
    if (p) fb.set(String(b.id), { ...b, partDoc: p })
  }
  const bookRank = (b: Doc) => (b.partDoc.order ?? 0) * 1000 + (b.order ?? 0)
  const chapters = fChapters.filter((c) => fb.has(String(c.book))).sort((a, b) => bookRank(fb.get(String(a.book))!) - bookRank(fb.get(String(b.book))!) || a.order - b.order)
  for (const c of chapters) {
    const b = fb.get(String(c.book))!
    const base = `/fiqh/${b.partDoc.slug}/${b.slug}/${c.order}`
    const where = `Фикх · ${b.partDoc.title} · ${b.title}`
    out.push(entry({ group: 'fiqh', title: c.title, titleAr: c.titleAr ?? undefined, where, href: base, parts: parts(((c.topics ?? []) as Doc[]).map((t) => t.title)) }))
    ;((c.sentences ?? []) as Doc[]).forEach((s, i) => {
      out.push(entry({ group: 'fiqh', title: `${c.title}, абзац ${i + 1}`, where, href: `${base}#p${i + 1}`, parts: parts(s.translation, s.arabic) }, true))
    })
  }

  // Курсы, уроки, статьи, библиотека
  for (const c of [...courses].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))) {
    out.push(
      entry({
        group: 'courses',
        title: c.title,
        titleAr: c.bookTitleAr ?? undefined,
        where: 'Курсы',
        href: `/courses/${c.slug}`,
        parts: parts(c.description, c.teacher, c.bookAuthor, ((c.modules ?? []) as Doc[]).map((m) => m.title)),
      }),
    )
  }
  for (const l of lessons) {
    const cat = TEXT_CATEGORIES.some((c) => c.value === l.category) ? labelOf(TEXT_CATEGORIES, l.category) : null
    out.push(
      entry({
        group: 'lessons',
        title: l.title,
        where: cat ? `Уроки · ${cat}` : 'Уроки',
        href: `/lessons/${l.slug}`,
        parts: parts(l.excerpt, l.definitionRu, l.definitionAr, l.content, l.body, l.summary, l.teacher, l.sourceRef),
      }),
    )
  }
  for (const a of articles) {
    const cat = ARTICLE_CATEGORIES.some((c) => c.value === a.category) ? labelOf(ARTICLE_CATEGORIES, a.category) : null
    out.push(
      entry({
        group: 'articles',
        title: a.title,
        where: [a.kind === 'question' ? 'Разбор вопроса' : 'Статья', cat].filter(Boolean).join(' · '),
        href: `/articles/${a.slug}`,
        parts: parts(a.excerpt, a.question, a.shortAnswer, a.blocks, a.body, a.sourceRef),
      }),
    )
  }
  for (const b of [...books].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))) {
    out.push(
      entry({
        group: 'library',
        title: b.title,
        titleAr: b.titleAr ?? undefined,
        where: ['Библиотека', b.author].filter(Boolean).join(' · '),
        href: `/library/${b.slug}`,
        parts: parts(b.author, b.authorAr, b.description, b.about),
      }),
    )
  }
  return out
}

// Собранный текст держится минуту: новое из админки появляется в поиске не позже чем через минуту
const TTL = 60_000
let store: { at: number; entries: Promise<Entry[]> } | null = null

function entries(): Promise<Entry[]> {
  if (!store || Date.now() - store.at > TTL) {
    const next = { at: Date.now(), entries: collect() }
    // Ошибка сбора не запоминается: следующий запрос попробует снова
    next.entries.catch(() => {
      if (store === next) store = null
    })
    store = next
  }
  return store.entries
}

/* ---------- Поиск и отрывок ---------- */

const WINDOW = 110

function snippet(e: Entry, words: string[]): Snippet | null {
  for (const w of words) {
    for (const p of e.parts) {
      const { t, map } = normalizeMapped(p.text)
      const at = t.indexOf(w)
      if (at < 0) continue
      // Окно вокруг найденного, по границам слов
      const from = map[at]
      let start = Math.max(0, from - WINDOW)
      let end = Math.min(p.text.length, from + WINDOW)
      if (start > 0) start = p.text.indexOf(' ', start) + 1 || start
      if (end < p.text.length) end = p.text.lastIndexOf(' ', end) > from ? p.text.lastIndexOf(' ', end) : end
      const text = p.text.slice(start, end)
      // Выделение всех слов запроса в окне
      const n = normalizeMapped(text)
      const marks = new Array<boolean>(text.length).fill(false)
      for (const word of words) {
        for (let k = n.t.indexOf(word); k >= 0; k = n.t.indexOf(word, k + word.length)) {
          let a = n.map[k]
          let b = n.map[k + word.length - 1] + 1
          // Выделяется слово целиком: алиф перед ним («ال») и окончание с огласовками после
          while (a > 0 && /[اأإآٱ]/.test(text[a - 1])) a--
          while (b < text.length && /[\p{L}\p{M}ـ]/u.test(text[b])) b++
          for (let x = a; x < b; x++) marks[x] = true
        }
      }
      const pieces: Snippet['pieces'] = []
      for (let x = 0; x < text.length; x++) {
        const last = pieces[pieces.length - 1]
        if (last && last.mark === marks[x]) last.text += text[x]
        else pieces.push({ text: text[x], mark: marks[x] })
      }
      if (start > 0) pieces.unshift({ text: '… ', mark: false })
      if (end < p.text.length) pieces.push({ text: ' …', mark: false })
      return { ar: p.ar, pieces }
    }
  }
  return null
}

export type SearchResult = { words: string[]; counts: Record<SearchGroup, number>; hits: Record<SearchGroup, SearchHit[]> }

/** Материалы, где есть все слова запроса; сначала те, где слова в названии, дальше — по порядку на сайте. */
export async function search(q: string, limit: number): Promise<SearchResult> {
  const words = queryWords(q)
  const counts = Object.fromEntries(SEARCH_GROUPS.map((g) => [g.value, 0])) as Record<SearchGroup, number>
  const hits = Object.fromEntries(SEARCH_GROUPS.map((g) => [g.value, [] as SearchHit[]])) as Record<SearchGroup, SearchHit[]>
  if (!words.length) return { words, counts, hits }
  const found = new Map<SearchGroup, { e: Entry; inTitle: boolean }[]>()
  for (const e of await entries()) {
    if (!words.every((w) => e.key.includes(w))) continue
    const list = found.get(e.group) ?? []
    list.push({ e, inTitle: words.every((w) => e.titleKey.includes(w)) })
    found.set(e.group, list)
  }
  for (const [group, list] of found) {
    counts[group] = list.length
    const sorted = [...list.filter((x) => x.inTitle), ...list.filter((x) => !x.inTitle)].slice(0, limit)
    hits[group] = sorted.map(({ e, inTitle }) => ({
      group,
      title: e.title,
      titleAr: e.titleAr,
      where: e.where,
      href: e.href,
      snippet: inTitle && !e.parts.length ? null : snippet(e, words),
    }))
  }
  return { words, counts, hits }
}
