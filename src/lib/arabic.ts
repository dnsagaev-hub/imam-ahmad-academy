/*
 * Арабский текст для курса арабского языка: снятие огласовки по этапам курса,
 * разбиение на слова и поиск слова в словаре курса с учётом приставок и окончаний
 * (و، ف، ب، ل، ك، ال… и ـه، ـها، ـنا، ـون, ـات…). Работает и на сервере, и в браузере.
 */

// Огласовки, танвин, шадда, сукун, мадда, надстрочный алиф и коранические знаки
const MARKS = /[ً-ٰٟۖ-ۭ]/g
const TATWEEL = /ـ/g
const IS_MARK = /[ً-ٰٟۖ-ۭ]/
const WORD = /([ء-غف-يٱ-ۓً-ٰٟۖ-ۭـ]+)/

export type Stage = 'full' | 'endings' | 'none'

export const stripMarks = (s: string) => s.replace(MARKS, '').replace(TATWEEL, '')

/** Огласовка только на последней букве слова: «кита̄бу» → «كتابُ». */
export function keepEndings(word: string): string {
  const chars = Array.from(word)
  let last = chars.length - 1
  while (last >= 0 && IS_MARK.test(chars[last])) last -= 1
  return chars.map((ch, i) => (i < last && IS_MARK.test(ch) ? '' : ch)).join('')
}

/** Этап огласовки урока: настройка урока или номер урока в курсе (1–50 полная, 51–85 окончания, с 86 без). */
export function stageFor(setting: string | null | undefined, lessonNumber: number | undefined): Stage {
  if (setting === 'full' || setting === 'endings' || setting === 'none') return setting
  const n = lessonNumber ?? 1
  if (n <= 50) return 'full'
  if (n <= 85) return 'endings'
  return 'none'
}

export function showStage(text: string, stage: Stage): string {
  if (stage === 'full') return text
  if (stage === 'none') return stripMarks(text)
  return tokenize(text)
    .map((t) => (t.word ? keepEndings(t.text) : t.text))
    .join('')
}

/** Текст по кусочкам: слова и всё, что между ними (пробелы, знаки препинания). */
export function tokenize(text: string): { text: string; word: boolean }[] {
  return text
    .split(WORD)
    .filter((t) => t !== '')
    .map((t) => ({ text: t, word: WORD.test(t) && stripMarks(t).length > 0 }))
}

/** Слово для сравнения: без огласовки, алиф с хамзой → ا, ى → ي. */
export function normalize(word: string): string {
  return stripMarks(word)
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/[^ء-ي]/g, '')
}

const PREFIX_1 = ['و', 'ف']
const PREFIX_2 = ['ب', 'ل', 'ك', 'س']
const SUFFIXES = ['هما', 'كما', 'هم', 'هن', 'كم', 'كن', 'ها', 'نا', 'ني', 'ه', 'ك', 'ي']
const ENDINGS = ['تان', 'تين', 'ان', 'ين', 'ون', 'ات', 'وا', 'تم', 'تن', 'ت', 'ا', 'ن']

/** Варианты слова без приставок и окончаний: сначала самые близкие к написанному. */
export function candidates(word: string): string[] {
  const w = normalize(word)
  const out: string[] = []
  const add = (s: string, min: number, fem = false) => {
    if (s.length < min) return
    if (!out.includes(s)) out.push(s)
    // ة перед окончанием пишется как ت: مدرستنا → مدرسة; у ـات множественного ة пропадает: مدرسات → مدرسة
    const f = s.endsWith('ت') ? s.slice(0, -1) + 'ة' : fem ? s + 'ة' : ''
    if (f && s.length > 2 && !out.includes(f)) out.push(f)
  }
  const stems = new Set<string>([w])
  for (const p of PREFIX_1) if (w.startsWith(p) && w.length > 3) stems.add(w.slice(1))
  for (const s of [...stems]) {
    for (const p of PREFIX_2) if (s.startsWith(p) && s.length > 3) stems.add(s.slice(1))
    if (s.startsWith('لل') && s.length > 4) stems.add('ال' + s.slice(2))
  }
  for (const s of [...stems]) if (s.startsWith('ال') && s.length > 3) stems.add(s.slice(2))
  const list = [...stems]
  list.forEach((s, i) => add(s, i === 0 ? 1 : 3))
  // союз перед коротким служебным словом: وَمَنْ، وَمَا، فَلَا
  if (w.length === 3 && PREFIX_1.includes(w[0])) add(w.slice(1), 2)
  for (const s of list) {
    for (const suf of SUFFIXES) {
      if (!s.endsWith(suf)) continue
      const base = s.slice(0, -suf.length)
      add(base, 2)
      for (const e of ENDINGS) if (base.endsWith(e)) add(base.slice(0, -e.length), 2, e.startsWith('ت') || e === 'ات')
    }
    for (const e of ENDINGS) if (s.endsWith(e)) add(s.slice(0, -e.length), 2, e.startsWith('ت') || e === 'ات')
    // женский род прилагательного: جديدة → جديد
    if (s.endsWith('ة')) add(s.slice(0, -1), 2)
  }
  return out
}

/** Слово словаря для подсказок (уходит в браузер — только то, что ученик и так видит в словаре). */
export type LexEntry = {
  w: string // слово с огласовкой
  t: string // перевод
  r?: string // корень
  pl?: string // множественное число
  v?: string // три формы глагола
  n: number // урок, где слово введено
  f: string[] // формы для поиска (без огласовки)
  fv: string[] // те же формы с огласовкой — чтобы отличить كُتُب «книги» от كَتَبَ «написал»
}

export type ArabicWord = {
  word: string
  translation: string
  root?: string | null
  plural?: string | null
  past?: string | null
  present?: string | null
  masdar?: string | null
  forms?: string | null
}

const PRESENT_PREFIXES = ['ي', 'ت', 'ن', 'ا']

/** Все формы слова, по которым его узнаёт подсказка. */
export function wordForms(w: ArabicWord): string[] {
  const raw = [w.word, w.plural, w.past, w.present, w.masdar, ...String(w.forms ?? '').split(/[,،;]/)]
  const forms = new Set<string>()
  for (const r of raw) {
    const n = normalize(String(r ?? '').trim())
    if (!n) continue
    forms.add(n)
    if (n.startsWith('ال') && n.length > 3) forms.add(n.slice(2))
  }
  // мудари‘ во всех лицах: يكتب → تكتب، نكتب، أكتب
  const present = normalize(String(w.present ?? ''))
  if (present.length > 2 && PRESENT_PREFIXES.includes(present[0])) {
    for (const p of PRESENT_PREFIXES) forms.add(p + present.slice(1))
  }
  return [...forms]
}

export function verbForms(w: ArabicWord): string | undefined {
  const parts = [w.past, w.present, w.masdar].map((x) => String(x ?? '').trim()).filter(Boolean)
  return parts.length ? parts.join(' — ') : undefined
}

export function toLexEntry(w: ArabicWord, lesson: number): LexEntry {
  return {
    w: w.word,
    t: w.translation,
    r: w.root ?? undefined,
    pl: w.plural ?? undefined,
    v: verbForms(w),
    n: lesson,
    f: wordForms(w),
    fv: [w.word, w.plural, w.past, w.present, w.masdar, ...String(w.forms ?? '').split(/[,،;]/)]
      .map((x) => String(x ?? '').trim())
      .filter((x) => x && x !== stripMarks(x)),
  }
}

/** Указатель «форма → слова». */
export type LexIndex = { entries: LexEntry[]; map: Map<string, number[]> }

export function buildIndex(entries: LexEntry[]): LexIndex {
  const map = new Map<string, number[]>()
  entries.forEach((e, i) =>
    e.f.forEach((f) => {
      const list = map.get(f) ?? []
      if (!list.includes(i)) list.push(i)
      map.set(f, list)
    }),
  )
  return { entries, map }
}

// Буквы слова с их огласовками: «كَتَبَ» → [к+а, т+а, б+а]
function lettersWithMarks(s: string): { ch: string; m: string }[] {
  const out: { ch: string; m: string }[] = []
  for (const c of Array.from(s.replace(TATWEEL, ''))) {
    if (IS_MARK.test(c)) {
      if (out.length) out[out.length - 1].m += c
    } else if (/[\u0621-\u064A]/.test(c)) out.push({ ch: normalize(c), m: '' })
  }
  return out
}

// Насколько огласовка слова в тексте совпадает с огласовкой формы словаря (без последней буквы — там окончание)
function vowelScore(token: string, e: LexEntry): number {
  const t = lettersWithMarks(token)
  if (!t.some((x) => x.m)) return 0
  const tLetters = t.map((x) => x.ch).join('')
  let best = 0
  for (const form of e.fv) {
    const f = lettersWithMarks(form.replace(/^(ال|اَل|ٱل)/, ''))
    if (f.length < 2) continue
    const at = tLetters.indexOf(f.slice(0, 2).map((x) => x.ch).join(''))
    if (at < 0) continue
    let score = 0
    for (let i = 0; i < f.length - 1 && at + i < t.length; i += 1) {
      if (t[at + i].ch !== f[i].ch) break
      if (t[at + i].m && f[i].m) score += t[at + i].m === f[i].m ? 1 : -1
    }
    best = Math.max(best, score)
  }
  return best
}

export function lookup(index: LexIndex, word: string): number | undefined {
  for (const c of candidates(word)) {
    const list = index.map.get(c)
    if (!list) continue
    if (list.length === 1) return list[0]
    // Одинаковое написание у разных слов — выбираем по огласовке, при равенстве — слово из более раннего урока
    let pick = list[0]
    let best = -Infinity
    for (const i of list) {
      const sc = vowelScore(word, index.entries[i])
      if (sc > best) {
        best = sc
        pick = i
      }
    }
    return pick
  }
  return undefined
}

/** Проверка ответа «вписать»: без огласовки, регистра, лишних пробелов и знаков препинания. */
export function sameAnswer(a: string, b: string): boolean {
  const clean = (s: string) =>
    stripMarks(s)
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/[.,!?;:«»"'()\-—–،؟؛]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  return clean(a) !== '' && clean(a) === clean(b)
}

/** Перемешивание, одинаковое при каждом показе страницы (чтобы сервер и браузер совпадали). */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  const rnd = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
  const out = [...items]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  // Если случайно вышел исходный порядок — сдвигаем, чтобы задание не решалось само
  if (out.length > 1 && out.every((x, i) => x === items[i])) out.push(out.shift() as T)
  return out
}
