import type { Payload } from 'payload'

import { SAMPLE_ARTICLES } from './sampleArticles'
import { SAMPLE_BOOKS } from './sampleBooks'
import { SAMPLE_LESSONS } from './sampleLessons'

/*
 * Стартовое наполнение для настоящего сайта: каталог библиотеки, три текстовых урока
 * (со сверенными цитатами) и два примера в «Статьях и вопросах».
 * Повторный запуск ничего не дублирует. Демо-курс сюда не входит.
 * На хостинге включается переменной SEED_STARTER=true (после первого запуска её можно удалить).
 */

export async function seedLibrary(payload: Payload) {
  const ids: Record<string, number | string> = {}
  for (const b of SAMPLE_BOOKS) {
    const found = await payload.find({ collection: 'books', where: { slug: { equals: b.slug } }, limit: 1, depth: 0 })
    if (found.totalDocs > 0) {
      ids[b.slug] = found.docs[0].id
      continue
    }
    const { base: _base, ...data } = b
    const doc = await payload.create({ collection: 'books', data: { ...data, language: 'ar', isPublished: true } as any })
    ids[b.slug] = doc.id
  }
  for (const b of SAMPLE_BOOKS) {
    if (b.base && ids[b.base]) {
      await payload.update({ collection: 'books', id: ids[b.slug], data: { baseBook: ids[b.base] } as any })
    }
  }
  payload.logger.info(`Библиотека: ${SAMPLE_BOOKS.length} книг.`)
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

export async function seedStarter(payload: Payload) {
  await seedLibrary(payload)
  await seedTextLessons(payload)
  await seedArticles(payload)
  payload.logger.info('Стартовое наполнение готово.')
}
