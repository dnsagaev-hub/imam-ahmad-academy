'use server'

import { revalidatePath } from 'next/cache'

import { sameAnswer } from '@/lib/arabic'
import { REGISTRATION_ENABLED } from '@/lib/config'
import { canOpenLesson, findCourseForLesson, getProgress, type LessonDoc } from '@/lib/learning'
import { getCurrentUser, getPayloadClient } from '@/lib/payload'

async function loadLesson(lessonId: string | number): Promise<LessonDoc | null> {
  const payload = await getPayloadClient()
  try {
    const lesson = (await payload.findByID({
      collection: 'lessons',
      id: lessonId,
      depth: 0,
      overrideAccess: true,
    })) as unknown as LessonDoc
    if (!lesson || lesson.isPublished === false) return null
    return lesson
  } catch {
    return null
  }
}

/** Проверка одного ответа: верно ли и пояснение. Верный ответ хранится только на сервере. */
export async function checkAnswer(lessonId: string | number, questionIndex: number, choice: number) {
  const lesson = await loadLesson(lessonId)
  const q = lesson?.questions?.[questionIndex]
  if (!q) return { ok: false as const, error: 'Вопрос не найден' }
  const correctIndex = (q.correct ?? 1) - 1
  return {
    ok: true as const,
    isCorrect: choice === correctIndex,
    correctIndex,
    explanation: q.explanation ?? '',
  }
}

/** Итог теста: считает балл, сохраняет результат в кабинет ученика. */
export async function submitQuiz(lessonId: string | number, answers: number[]) {
  // Без регистрации результаты хранит браузер ученика, сервер только проверяет ответы
  const user = REGISTRATION_ENABLED ? await getCurrentUser() : null
  const lesson = await loadLesson(lessonId)
  if (!lesson) return { ok: false as const, error: 'Урок не найден' }

  const questions = lesson.questions ?? []
  const total = questions.length
  const correctCount = questions.filter((q, i) => answers[i] === (q.correct ?? 1) - 1).length
  const score = total ? Math.round((correctCount / total) * 100) : 100
  const passing = lesson.passingScore ?? 70
  const passed = score >= passing

  const review = questions.map((q, i) => ({
    question: q.question,
    correctText: q.options?.[(q.correct ?? 1) - 1]?.text ?? '',
    isCorrect: answers[i] === (q.correct ?? 1) - 1,
  }))

  if (!user) {
    return { ok: true as const, saved: false, score, passed, correctCount, total, passing, review, attempt: 1 }
  }
  const saved = await saveAttempt(user.id, lesson, { score, correctCount, total, passed, answers })
  if (!saved.ok) return saved
  return { ok: true as const, saved: true, score, passed, correctCount, total, passing, review, attempt: saved.attempt }
}

/** Результат теста — в кабинет ученика (только с регистрацией). */
async function saveAttempt(
  userId: string | number,
  lesson: LessonDoc,
  r: { score: number; correctCount: number; total: number; passed: boolean; answers: unknown },
) {
  const payload = await getPayloadClient()
  const course = await findCourseForLesson(payload, lesson.id)
  const progress = await getProgress(payload, userId)
  if (course && !canOpenLesson(course, lesson.id, progress)) {
    return { ok: false as const, error: 'Этот урок ещё закрыт: сначала сдайте тест предыдущего урока.' }
  }
  const attempt = (progress.attempts.get(String(lesson.id)) ?? 0) + 1

  await payload.create({
    collection: 'quiz-attempts',
    overrideAccess: true,
    data: {
      user: userId,
      lesson: lesson.id,
      course: course?.id,
      score: r.score,
      correctCount: r.correctCount,
      totalCount: r.total,
      passed: r.passed,
      attempt,
      answers: r.answers,
    } as any,
  })

  revalidatePath('/cabinet')
  if (course?.slug) revalidatePath(`/courses/${course.slug}`)
  return { ok: true as const, attempt }
}

/* ---------- Задания урока арабского ---------- */

export type TaskAnswer = { choice?: number; text?: string; pairs?: string[]; picked?: number[] }

const AUTO_KINDS = new Set(['choice', 'input', 'match', 'order'])

function gradeTask(t: Record<string, any>, a: TaskAnswer | undefined) {
  const kind = String(t.kind ?? 'choice')
  const options: string[] = (t.options ?? []).map((o: any) => String(o.text ?? ''))
  const pairs: { left: string; right: string }[] = (t.pairs ?? []).map((p: any) => ({ left: String(p.left ?? ''), right: String(p.right ?? '') }))
  const answers = String(t.answer ?? '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)
  let key = String(t.answer ?? '').trim()
  let isCorrect: boolean | undefined
  if (kind === 'choice') {
    const correctIndex = (Number(t.correct) || 1) - 1
    key = options[correctIndex] ?? ''
    isCorrect = a?.choice === correctIndex
  } else if (kind === 'match') {
    key = pairs.map((p) => `${p.left} — ${p.right}`).join('\n')
    isCorrect = pairs.length > 0 && pairs.every((p, i) => sameAnswer(a?.pairs?.[i] ?? '', p.right))
  } else if (kind === 'input') {
    key = answers.join(' / ')
    isCorrect = answers.some((x) => sameAnswer(a?.text ?? '', x))
  } else if (kind === 'order') {
    isCorrect = sameAnswer(a?.text ?? '', key)
  }
  return { kind, auto: AUTO_KINDS.has(kind), isCorrect, key, explanation: String(t.explanation ?? '') }
}

/** Проверка одного задания: верно ли (для заданий с проверкой) и ключ. Ключ хранится только на сервере. */
export async function checkArabicTask(lessonId: string | number, index: number, answer: TaskAnswer) {
  const lesson = await loadLesson(lessonId)
  const t = (lesson as any)?.arabic?.tasks?.[index]
  if (!t) return { ok: false as const, error: 'Задание не найдено' }
  return { ok: true as const, ...gradeTask(t, answer) }
}

/**
 * Итог заданий. Задания с проверкой сервер проверяет заново, остальные ученик отметил сам по ключу.
 * Если у урока есть тест (вкладка «Тест»), задания — тренировка и в прогресс не идут.
 */
export async function submitArabicTasks(lessonId: string | number, answers: TaskAnswer[], selfMarks: boolean[]) {
  const lesson = await loadLesson(lessonId)
  if (!lesson) return { ok: false as const, error: 'Урок не найден' }
  const tasks: Record<string, any>[] = (lesson as any).arabic?.tasks ?? []
  const results = tasks.map((t, i) => {
    const g = gradeTask(t, answers[i])
    return g.auto ? Boolean(g.isCorrect) : Boolean(selfMarks[i])
  })
  const total = tasks.length
  const correctCount = results.filter(Boolean).length
  const score = total ? Math.round((correctCount / total) * 100) : 100
  const passing = lesson.passingScore ?? 70
  const passed = score >= passing
  const counts = !(lesson.questions ?? []).length

  const user = REGISTRATION_ENABLED && counts ? await getCurrentUser() : null
  if (!user) return { ok: true as const, saved: false, counts, score, passed, correctCount, total, passing }
  const saved = await saveAttempt(user.id, lesson, { score, correctCount, total, passed, answers: results })
  if (!saved.ok) return saved
  return { ok: true as const, saved: true, counts, score, passed, correctCount, total, passing }
}

/** Для уроков без теста: «Отметить урок пройденным». */
export async function markLessonComplete(lessonId: string | number) {
  if (!REGISTRATION_ENABLED) return { ok: false as const, error: 'Прогресс сохраняется в браузере' }
  const user = await getCurrentUser()
  if (!user) return { ok: false as const, error: 'Войдите, чтобы сохранять прогресс' }
  return submitQuiz(lessonId, [])
}

/** Настройки профиля в личном кабинете. */
export async function updateProfile(_prev: unknown, formData: FormData) {
  if (!REGISTRATION_ENABLED) return { ok: false, message: 'Регистрация выключена.' }
  const user = await getCurrentUser()
  if (!user) return { ok: false, message: 'Войдите заново.' }
  const name = String(formData.get('name') ?? '').trim().slice(0, 80)
  if (!name) return { ok: false, message: 'Укажите имя.' }
  const payload = await getPayloadClient()
  await payload.update({
    collection: 'users',
    id: user.id,
    overrideAccess: true,
    data: { name, notifyNewLessons: formData.get('notify') === 'on' } as any,
  })
  revalidatePath('/cabinet')
  return { ok: true, message: 'Сохранено.' }
}

/** Форма «Связаться с нами». */
export async function sendMessage(_prev: unknown, formData: FormData) {
  // Без регистрации сайт не собирает персональные данные — форма выключена
  if (!REGISTRATION_ENABLED) return { ok: false, message: 'Форма выключена. Напишите нам в Telegram или на почту.' }
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const topic = String(formData.get('topic') ?? '').trim()
  const text = String(formData.get('text') ?? '').trim()
  const consent = formData.get('consent') === 'on'

  if (!name || !email || !text) return { ok: false, message: 'Заполните имя, email и вопрос.' }
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, message: 'Проверьте адрес email.' }
  if (!consent) return { ok: false, message: 'Нужно согласие на обработку персональных данных.' }
  if (text.length > 5000) return { ok: false, message: 'Вопрос слишком длинный.' }

  const payload = await getPayloadClient()
  await payload.create({
    collection: 'messages',
    overrideAccess: true,
    data: { name, email, topic: topic || 'Вопрос', text, status: 'new' } as any,
  })
  return { ok: true, message: 'Спасибо! Вопрос отправлен — ответ придёт на вашу почту.' }
}
