import type { Payload } from 'payload'

/* Логика обучения: порядок уроков, открытие следующего урока, прогресс и уровни ученика. */

export type Id = number | string

export type LessonDoc = {
  id: Id
  title: string
  slug?: string | null
  duration?: string | null
  category?: string | null
  isPublished?: boolean | null
  videoUrl?: string | null
  audio?: unknown
  questions?: { question: string; options?: { text: string }[] | null; correct?: number | null; explanation?: string | null }[] | null
  passingScore?: number | null
  [key: string]: unknown
}

export type CourseDoc = {
  id: Id
  title: string
  slug?: string | null
  level?: string | null
  order?: number | null
  modules?: { id?: string | null; title: string; lessons?: (LessonDoc | Id)[] | null }[] | null
  [key: string]: unknown
}

export type FlatLesson = {
  lesson: LessonDoc
  number: number // сквозной номер урока в курсе, с 1
  moduleIndex: number
  moduleTitle: string
}

export type Progress = {
  passed: Set<string>
  bestScore: Map<string, number>
  attempts: Map<string, number>
  history: {
    id: Id
    lessonId: string
    lessonTitle: string
    courseTitle: string
    score: number
    passed: boolean
    attempt: number
    createdAt: string
  }[]
}

const key = (id: Id) => String(id)

const isPopulated = (l: LessonDoc | Id): l is LessonDoc => typeof l === 'object' && l !== null

/** Все опубликованные уроки курса по порядку прохождения. */
export function flattenCourse(course: CourseDoc): FlatLesson[] {
  const out: FlatLesson[] = []
  let n = 0
  ;(course.modules ?? []).forEach((m, moduleIndex) => {
    ;(m.lessons ?? []).filter(isPopulated).forEach((lesson) => {
      if (lesson.isPublished === false) return
      n += 1
      out.push({ lesson, number: n, moduleIndex, moduleTitle: m.title })
    })
  })
  return out
}

/** Облегчённая копия курса для браузера: только порядок, названия и адреса уроков (без ответов тестов). */
export function toLeanCourse(course: CourseDoc): CourseDoc {
  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    level: course.level,
    order: course.order,
    modules: (course.modules ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      lessons: (m.lessons ?? []).filter(isPopulated).map((l) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        duration: l.duration ?? null,
        isPublished: l.isPublished,
        hasTest: Boolean(l.questions?.length) || Boolean((l as any).arabic?.tasks?.length),
      })),
    })),
  }
}

export const emptyProgress = (): Progress => ({
  passed: new Set(),
  bestScore: new Map(),
  attempts: new Map(),
  history: [],
})

/** Все результаты тестов ученика. */
export async function getProgress(payload: Payload, userId: Id | null | undefined): Promise<Progress> {
  const progress = emptyProgress()
  if (!userId) return progress
  const res = await payload.find({
    collection: 'quiz-attempts',
    where: { user: { equals: userId } },
    sort: '-createdAt',
    limit: 2000,
    depth: 1,
    overrideAccess: true,
  })
  for (const a of res.docs as any[]) {
    const lessonId = key(typeof a.lesson === 'object' ? a.lesson?.id : a.lesson)
    if (a.passed) progress.passed.add(lessonId)
    progress.bestScore.set(lessonId, Math.max(progress.bestScore.get(lessonId) ?? 0, a.score ?? 0))
    progress.attempts.set(lessonId, (progress.attempts.get(lessonId) ?? 0) + 1)
    progress.history.push({
      id: a.id,
      lessonId,
      lessonTitle: typeof a.lesson === 'object' ? a.lesson?.title ?? '' : '',
      courseTitle: typeof a.course === 'object' ? a.course?.title ?? '' : '',
      score: a.score ?? 0,
      passed: Boolean(a.passed),
      attempt: a.attempt ?? 1,
      createdAt: a.createdAt,
    })
  }
  return progress
}

export type LessonState = 'done' | 'current' | 'locked'

export type CourseState = {
  lessons: (FlatLesson & { state: LessonState; score?: number })[]
  doneCount: number
  total: number
  percent: number
  currentLesson?: FlatLesson
  averageScore: number | null
  completed: boolean
}

/** Какие уроки пройдены, какой текущий, какие закрыты. */
export function courseState(course: CourseDoc, progress: Progress): CourseState {
  const flat = flattenCourse(course)
  let currentFound = false
  let currentLesson: FlatLesson | undefined
  const scores: number[] = []
  const lessons = flat.map((f) => {
    const id = key(f.lesson.id)
    if (progress.passed.has(id)) {
      const score = progress.bestScore.get(id)
      if (typeof score === 'number') scores.push(score)
      return { ...f, state: 'done' as LessonState, score }
    }
    if (!currentFound) {
      currentFound = true
      currentLesson = f
      return { ...f, state: 'current' as LessonState }
    }
    return { ...f, state: 'locked' as LessonState }
  })
  const doneCount = lessons.filter((l) => l.state === 'done').length
  const total = lessons.length
  return {
    lessons,
    doneCount,
    total,
    percent: total ? Math.round((doneCount / total) * 100) : 0,
    currentLesson,
    averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
    completed: total > 0 && doneCount === total,
  }
}

/** Можно ли ученику открыть этот урок курса: первый урок открыт всем, остальные — после сдачи предыдущего. */
export function canOpenLesson(course: CourseDoc, lessonId: Id, progress: Progress): boolean {
  const flat = flattenCourse(course)
  const idx = flat.findIndex((f) => key(f.lesson.id) === key(lessonId))
  if (idx <= 0) return true
  return progress.passed.has(key(flat[idx - 1].lesson.id)) || progress.passed.has(key(lessonId))
}

/** Курс, в который входит урок (если входит). */
export async function findCourseForLesson(payload: Payload, lessonId: Id): Promise<CourseDoc | null> {
  const res = await payload.find({
    collection: 'courses',
    depth: 1,
    limit: 200,
    overrideAccess: true,
    where: { isPublished: { equals: true } },
  })
  for (const c of res.docs as unknown as CourseDoc[]) {
    if (flattenCourse(c).some((f) => key(f.lesson.id) === key(lessonId))) return c
  }
  return null
}

/** Порядок ступеней программы. */
export const STAGE_ORDER = ['prep', 'beginner', 'intermediate', 'advanced'] as const

/**
 * Уровень ученика по ступеням программы (Тамхиди → Мубтади → Мутавассит → Мутакаддим):
 * следующий уровень присваивается, когда пройдены все курсы (с уроками) текущей ступени
 * и средний балл тестов не ниже 80%. Ступень, где ещё нет курсов с уроками, дальше не пускает.
 */
export function studentLevel(courses: CourseDoc[], progress: Progress) {
  const states = courses.map((c) => ({ c, s: courseState(c, progress) })).filter((x) => x.s.total > 0)
  const byLevel = (lvl: string) => states.filter((x) => x.c.level === lvl)
  const allDone = (lvl: string) => {
    const list = byLevel(lvl)
    return list.length > 0 && list.every((x) => x.s.completed)
  }
  const scores = [...progress.bestScore.values()]
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  let index = 0
  while (index < STAGE_ORDER.length - 1 && allDone(STAGE_ORDER[index]) && avg >= 80) index += 1

  const current = byLevel(STAGE_ORDER[index])
  const toNext =
    index === STAGE_ORDER.length - 1
      ? 100
      : Math.round(current.reduce((a, x) => a + x.s.percent, 0) / Math.max(current.length, 1))
  return {
    index,
    toNextPercent: toNext,
    averageScore: scores.length ? Math.round(avg) : null,
    beginnerDone: byLevel(STAGE_ORDER[index]).filter((x) => x.s.completed).length,
    completedCourses: states.filter((x) => x.s.completed).length,
  }
}
