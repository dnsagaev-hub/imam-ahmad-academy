'use server'

import { revalidatePath } from 'next/cache'

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
  const payload = await getPayloadClient()
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

  const course = await findCourseForLesson(payload, lesson.id)
  const progress = await getProgress(payload, user.id)
  if (course && !canOpenLesson(course, lesson.id, progress)) {
    return { ok: false as const, error: 'Этот урок ещё закрыт: сначала сдайте тест предыдущего урока.' }
  }
  const attempt = (progress.attempts.get(String(lesson.id)) ?? 0) + 1

  await payload.create({
    collection: 'quiz-attempts',
    overrideAccess: true,
    data: {
      user: user.id,
      lesson: lesson.id,
      course: course?.id,
      score,
      correctCount,
      totalCount: total,
      passed,
      attempt,
      answers,
    } as any,
  })

  revalidatePath('/cabinet')
  if (course?.slug) revalidatePath(`/courses/${course.slug}`)

  return { ok: true as const, saved: true, score, passed, correctCount, total, passing, review, attempt }
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
