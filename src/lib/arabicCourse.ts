import { buildIndex, lookup, seededShuffle, stageFor, stripMarks, toLexEntry, tokenize, type ArabicWord, type LexEntry, type Stage } from './arabic'
import { ARABIC_TASK_KINDS } from './constants'
import { flattenCourse, type CourseDoc, type LessonDoc } from './learning'
import { mediaUrl } from './queries'

/*
 * Курс арабского языка целиком: словарь курса (сквозной реестр слов), повторы слов в следующих уроках
 * и проверка «закрытого словаря» — какие слова урока ещё не введены ни в одном словаре до него.
 */

export type ArabicData = {
  stage?: string | null
  isReview?: boolean | null
  words?: (ArabicWord & { id?: string | null; tag?: string | null; theme?: string | null; image?: unknown; audio?: unknown; note?: string | null })[] | null
  grammarTitle?: string | null
  grammar?: string | null
  grammarExamples?: { arabic: string; translation?: string | null }[] | null
  sentences?: { arabic: string; translation?: string | null }[] | null
  textTitle?: string | null
  text?: string | null
  textTranslation?: string | null
  textSource?: string | null
  tasks?: Record<string, any>[] | null
}

export const arabicOf = (lesson: LessonDoc): ArabicData => ((lesson as any).arabic ?? {}) as ArabicData

export function isArabicLesson(lesson: LessonDoc): boolean {
  const a = arabicOf(lesson)
  return Boolean(a.words?.length || a.sentences?.length || a.tasks?.length || a.text?.trim())
}

export type CourseWord = {
  key: string
  word: string
  translation: string
  root?: string
  plural?: string
  past?: string
  present?: string
  masdar?: string
  forms?: string
  tag?: string
  theme?: string
  note?: string
  image?: string | null
  lesson: number
  lessonSlug: string
  lessonTitle: string
}

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

/** Весь арабский текст урока, где ученик встречает слова: предложения, примеры, текст, задания. */
export function lessonArabicText(a: ArabicData): string {
  const parts: string[] = []
  for (const e of a.grammarExamples ?? []) parts.push(e.arabic)
  for (const s of a.sentences ?? []) parts.push(s.arabic)
  if (a.textTitle) parts.push(a.textTitle)
  if (a.text) parts.push(a.text)
  for (const t of a.tasks ?? []) {
    parts.push(String(t.material ?? ''), String(t.prompt ?? ''))
    for (const o of t.options ?? []) parts.push(String(o.text ?? ''))
    for (const p of t.pairs ?? []) parts.push(String(p.left ?? ''), String(p.right ?? ''))
    if (t.kind === 'order' || t.kind === 'vowel' || t.kind === 'toAr') parts.push(String(t.answer ?? ''))
  }
  return parts.join('\n')
}

export type ArabicCourse = {
  lessons: { number: number; slug: string; title: string; lesson: LessonDoc; stage: Stage }[]
  words: CourseWord[]
}

export function buildArabicCourse(course: CourseDoc): ArabicCourse {
  const lessons: ArabicCourse['lessons'] = []
  const words: CourseWord[] = []
  for (const f of flattenCourse(course)) {
    if (!isArabicLesson(f.lesson)) continue
    const a = arabicOf(f.lesson)
    const slug = String(f.lesson.slug ?? '')
    lessons.push({ number: f.number, slug, title: f.lesson.title, lesson: f.lesson, stage: stageFor(a.stage, f.number) })
    ;(a.words ?? []).forEach((w, i) => {
      if (!str(w.word) || !str(w.translation)) return
      words.push({
        key: `${f.lesson.id}:${w.id ?? i}`,
        word: w.word.trim(),
        translation: w.translation.trim(),
        root: str(w.root),
        plural: str(w.plural),
        past: str(w.past),
        present: str(w.present),
        masdar: str(w.masdar),
        forms: str(w.forms),
        tag: str(w.tag),
        theme: str(w.theme),
        note: str(w.note),
        image: mediaUrl(w.image),
        lesson: f.number,
        lessonSlug: slug,
        lessonTitle: f.lesson.title,
      })
    })
  }
  return { lessons, words }
}

/** Словарь для подсказок: слова этого урока и всех предыдущих. */
export function lexiconUpTo(ac: ArabicCourse, lessonNumber: number): LexEntry[] {
  return ac.words.filter((w) => w.lesson <= lessonNumber).map((w) => toLexEntry(w, w.lesson))
}

export type WordUsage = { repeats: Map<string, number[]>; unknown: Map<number, string[]> }

/**
 * Где слова повторяются (номера уроков после урока, где слово введено) и какие слова урока
 * не нашлись в словаре курса до этого урока включительно (проверка закрытого словаря).
 */
export function wordUsage(ac: ArabicCourse): WordUsage {
  const entries = ac.words.map((w) => toLexEntry(w, w.lesson))
  const repeats = new Map<string, number[]>()
  const unknown = new Map<number, string[]>()
  for (const l of ac.lessons) {
    const known = buildIndex(entries.filter((e) => e.n <= l.number))
    const knownWords = ac.words.filter((w) => w.lesson <= l.number)
    const seen = new Set<string>()
    const missing = new Set<string>()
    for (const t of tokenize(lessonArabicText(arabicOf(l.lesson)))) {
      if (!t.word) continue
      const i = lookup(known, t.text)
      if (i === undefined) missing.add(t.text.replace(/[ً-ٰٟ]/g, ''))
      else seen.add(knownWords[i].key)
    }
    for (const key of seen) {
      const w = ac.words.find((x) => x.key === key)
      if (!w || w.lesson >= l.number) continue
      repeats.set(key, [...(repeats.get(key) ?? []), l.number])
    }
    if (missing.size) unknown.set(l.number, [...missing])
  }
  return { repeats, unknown }
}

/** Задания для браузера: без ответов; пары и слова для «собрать предложение» — перемешаны. */
export function clientTasks(lessonId: string | number, a: ArabicData) {
  return (a.tasks ?? []).map((t, i) => {
    const kind = String(t.kind ?? 'choice')
    const answer = String(t.answer ?? '').trim()
    const seed = `${lessonId}:${i}`
    return {
      kind,
      prompt: String(t.prompt ?? ''),
      material: kind === 'vowel' ? String(t.material ?? '').trim() || stripMarks(answer) : String(t.material ?? ''),
      options: kind === 'choice' ? (t.options ?? []).map((o: any) => String(o.text ?? '')) : undefined,
      left: kind === 'match' ? (t.pairs ?? []).map((p: any) => String(p.left ?? '')) : undefined,
      right: kind === 'match' ? seededShuffle([...new Set<string>((t.pairs ?? []).map((p: any) => String(p.right ?? '')))], seed) : undefined,
      chips: kind === 'order' ? seededShuffle(answer.split(/\s+/).filter(Boolean), seed) : undefined,
      auto: ARABIC_TASK_KINDS.find((k) => k.value === kind)?.auto ?? false,
    }
  })
}
