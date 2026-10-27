import type { Payload, PayloadRequest } from 'payload'

import module01 from '../data/arabic/module-01.json'

/*
 * Уроки авторского учебника арабского языка (курс «Арабский язык» ступени Тамхиди, задача 50).
 * Текст уроков — материал владельца (документы «Урок N…»), перенесён без изменений; упражнения — задания с проверкой.
 * Вызывается миграцией (один раз на базе владельца) и демо-наполнением. Урок, который уже есть (по адресу), не трогается;
 * курс меняется, только если поля ещё как в стартовой программе — правки владельца не перезаписываются.
 */

type Module = { module: string; lessons: ({ slug: string; title: string } & Record<string, unknown>)[] }

export const ARABIC_MODULES: Module[] = [module01 as Module]

export const ARABIC_COURSE_SLUG = 'stupen-1-01-arabic'

// Стартовая программа (src/seed/program.ts до задачи 50) — меняем только эти значения
const OLD = {
  title: 'Арабский язык: первый год',
  scope: 'Учебник Мухаммада Багауддина — полностью, первый год курса.',
  bookAuthor: 'Мухаммад Багауддин',
  book: 'uchebnik-arabskogo-bagauddin',
}
export const NEW_COURSE = {
  title: 'Арабский язык для чтения религиозных текстов',
  scope: 'Авторский учебник академии: 120 уроков, от именного предложения до разбора оригинальных матнов.',
  bookAuthor: 'Авторский учебник академии',
}

const idOf = (x: unknown) => (x && typeof x === 'object' ? (x as { id: number | string }).id : (x as number | string))

export async function installArabicLessons(payload: Payload, req?: Partial<PayloadRequest>) {
  const opts = { req, overrideAccess: true } as const
  const created: { module: string; ids: (number | string)[] }[] = []
  for (const m of ARABIC_MODULES) {
    const ids: (number | string)[] = []
    for (const l of m.lessons) {
      const found = await payload.find({ collection: 'lessons', where: { slug: { equals: l.slug } }, limit: 1, depth: 0, ...opts })
      const doc = found.docs[0] ?? (await payload.create({ collection: 'lessons', data: l as never, ...opts }))
      ids.push(doc.id)
    }
    created.push({ module: m.module, ids })
  }

  const res = await payload.find({ collection: 'courses', where: { slug: { equals: ARABIC_COURSE_SLUG } }, limit: 1, depth: 0, ...opts })
  const course = res.docs[0] as Record<string, any> | undefined
  if (!course) return payload.logger.info('Курс арабского Тамхиди не найден — уроки созданы без курса.')

  const modules: { id?: string; title: string; lessons: (number | string)[] }[] = (course.modules ?? []).map((m: any) => ({
    id: m.id,
    title: m.title,
    lessons: (m.lessons ?? []).map(idOf),
  }))
  const inCourse = new Set(modules.flatMap((m) => m.lessons.map(String)))
  for (const c of created) {
    const missing = c.ids.filter((id) => !inCourse.has(String(id)))
    if (!missing.length) continue
    const mod = modules.find((m) => m.title === c.module)
    if (mod) mod.lessons.push(...missing)
    else modules.push({ title: c.module, lessons: missing })
  }

  const data: Record<string, unknown> = { modules }
  if (course.title === OLD.title) data.title = NEW_COURSE.title
  if (course.scope === OLD.scope) {
    data.scope = NEW_COURSE.scope
    if (course.description === OLD.scope) data.description = NEW_COURSE.scope
  }
  if (course.bookAuthor === OLD.bookAuthor) data.bookAuthor = NEW_COURSE.bookAuthor
  // Учебник Багауддина больше не учебник курса (в библиотеке книга остаётся)
  const old = await payload.find({ collection: 'books', where: { slug: { equals: OLD.book } }, limit: 1, depth: 0, ...opts })
  const oldId = old.docs[0]?.id
  const books = (course.books ?? []).map(idOf)
  if (oldId !== undefined && books.some((b: unknown) => String(b) === String(oldId))) data.books = books.filter((b: unknown) => String(b) !== String(oldId))

  await payload.update({ collection: 'courses', id: course.id, data: data as never, ...opts })
  payload.logger.info('Уроки арабского добавлены в курс Тамхиди.')
}
