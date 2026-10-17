import type { Payload } from 'payload'

import { SAMPLE_ARTICLES } from './sampleArticles'
import { PROGRAM_BOOKS, PROGRAM_COURSES, programCourseSlug } from './program'
import { SAMPLE_BOOKS } from './sampleBooks'
import { SAMPLE_LESSONS } from './sampleLessons'

/*
 * Стартовое наполнение для настоящего сайта: каталог библиотеки, три текстовых урока
 * (со сверенными цитатами) и два примера в «Статьях и вопросах».
 * Повторный запуск ничего не дублирует. Демо-курс сюда не входит.
 * На хостинге включается переменной SEED_STARTER=true (после первого запуска её можно удалить).
 */

export const ALL_BOOKS = [...SAMPLE_BOOKS, ...PROGRAM_BOOKS]

export async function seedLibrary(payload: Payload) {
  const ids: Record<string, number | string> = {}
  for (const b of ALL_BOOKS) {
    const found = await payload.find({ collection: 'books', where: { slug: { equals: b.slug } }, limit: 1, depth: 0 })
    if (found.totalDocs > 0) {
      const doc = found.docs[0] as Record<string, any>
      ids[b.slug] = doc.id
      // Ступень книги следует учебной программе
      if ((doc.level ?? null) !== (b.level ?? null)) {
        await payload.update({ collection: 'books', id: doc.id, data: { level: b.level ?? null } as any })
      }
      continue
    }
    const { base: _base, ...data } = b
    const doc = await payload.create({ collection: 'books', data: { language: 'ar', ...data, isPublished: true } as any })
    ids[b.slug] = doc.id
  }
  for (const b of ALL_BOOKS) {
    if (b.base && ids[b.base]) {
      await payload.update({ collection: 'books', id: ids[b.slug], data: { baseBook: ids[b.base] } as any })
    }
  }
  payload.logger.info(`Библиотека: ${ALL_BOOKS.length} книг.`)
  return ids
}

export async function seedArticles(payload: Payload) {
  for (const a of SAMPLE_ARTICLES) {
    const found = await payload.find({ collection: 'articles', where: { slug: { equals: a.slug } }, limit: 1 })
    if (found.totalDocs > 0) continue
    await payload.create({
      collection: 'articles',
      data: { ...a, isPublished: true, publishedAt: new Date().toISOString() } as any,
    })
    payload.logger.info(`Пример «${a.title}» добавлен.`)
  }
}

export async function seedTextLessons(payload: Payload) {
  const ids: Record<string, number | string> = {}
  for (const l of SAMPLE_LESSONS) {
    const found = await payload.find({ collection: 'lessons', where: { slug: { equals: l.slug } }, limit: 1, depth: 0 })
    if (found.totalDocs > 0) {
      ids[l.slug] = found.docs[0].id
      continue
    }
    const doc = await payload.create({
      collection: 'lessons',
      data: {
        title: l.title,
        slug: l.slug,
        category: l.category,
        excerpt: l.excerpt,
        sourceRef: l.sourceRef,
        content: l.content,
        passingScore: 70,
        questions: l.questions,
        isPublished: true,
      } as any,
    })
    ids[l.slug] = doc.id
  }
  return ids
}

/** Курсы учебной программы (4 ступени, 44 дисциплины) — пока без уроков. */
export async function seedProgram(payload: Payload, bookIds: Record<string, number | string>) {
  let created = 0
  for (const c of PROGRAM_COURSES) {
    const slug = programCourseSlug(c)
    const found = await payload.find({ collection: 'courses', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    if (found.totalDocs > 0) continue
    const first = ALL_BOOKS.find((b) => b.slug === c.books[0])
    await payload.create({
      collection: 'courses',
      data: {
        title: c.title,
        slug,
        level: c.level,
        order: c.no,
        discipline: c.discipline,
        status: c.status ?? 'approved',
        description: c.scope,
        scope: c.scope,
        books: c.books.map((s) => bookIds[s]).filter(Boolean),
        bookTitleAr: first?.titleAr || '',
        bookAuthor: first?.author || '',
        modules: [],
        isPublished: true,
      } as any,
    })
    created += 1
  }
  payload.logger.info(`Программа: создано курсов — ${created} из ${PROGRAM_COURSES.length}.`)
}

export async function seedStarter(payload: Payload) {
  const bookIds = await seedLibrary(payload)
  await seedProgram(payload, bookIds)
  await seedTextLessons(payload)
  await seedArticles(payload)
  payload.logger.info('Стартовое наполнение готово.')
}
