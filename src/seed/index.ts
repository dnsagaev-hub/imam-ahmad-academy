/*
 * Демо-наполнение: настройки сайта и небольшой курс из двух уроков с тестами.
 * Запуск: npm run seed  (повторный запуск ничего не дублирует)
 * Демо-курс можно потом удалить или скрыть в админке.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { SAMPLE_ARTICLES } from './sampleArticles'
import { SAMPLE_BOOKS } from './sampleBooks'
import { tayammum, usulAhmad, waterTypes, type SampleLesson } from './sampleLessons'

const text = (t: string) => ({ type: 'text', text: t, version: 1, format: 0, detail: 0, mode: 'normal', style: '' })
const paragraph = (t: string) => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  children: [text(t)],
})
const bullets = (items: string[]) => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children: items.map((t, i) => ({
    type: 'listitem',
    value: i + 1,
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: [text(t)],
  })),
})
const doc = (...children: object[]) => ({
  root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children },
})

const payload = await getPayload({ config })

await payload.updateGlobal({
  slug: 'settings',
  data: {
    heroTitle: 'Изучайте ханбалитский фикх последовательно — урок за уроком',
    heroText:
      'Последовательное изучение ханбалитского мазхаба: уроки по матнам, тест после каждого занятия и личный кабинет с вашим прогрессом.',
    aboutTitle: 'Знание — по ступеням, как учили в мадрасах мазхаба',
    aboutText: '[Текст об академии: цели, преподаватели, методика обучения — заполните в админке.]',
  } as any,
})

// Библиотека: сначала книги, затем связи «шарх → матн»
const bookIds: Record<string, number | string> = {}
for (const b of SAMPLE_BOOKS) {
  const found = await payload.find({ collection: 'books', where: { slug: { equals: b.slug } }, limit: 1, depth: 0 })
  if (found.totalDocs > 0) {
    bookIds[b.slug] = found.docs[0].id
    continue
  }
  const { base: _base, ...data } = b
  const doc = await payload.create({ collection: 'books', data: { ...data, language: 'ar', isPublished: true } as any })
  bookIds[b.slug] = doc.id
}
for (const b of SAMPLE_BOOKS) {
  if (b.base && bookIds[b.base]) {
    await payload.update({ collection: 'books', id: bookIds[b.slug], data: { baseBook: bookIds[b.base] } as any })
  }
}
payload.logger.info(`Библиотека: ${SAMPLE_BOOKS.length} книг.`)

const exists = await payload.find({ collection: 'courses', where: { slug: { equals: 'demo-fikh-ochischeniya' } }, limit: 1 })

if (exists.totalDocs === 0) {
  const lesson1 = await payload.create({
    collection: 'lessons',
    data: {
      title: 'Что такое тахара',
      slug: 'demo-chto-takoe-tahara',
      category: 'fiqh',
      duration: '[30:00]',
      definitionAr: 'الطهارة: ارتفاع الحدث وما في معناه، وزوال الخبث',
      definitionRu: 'Тахара — снятие состояния осквернения (хадас) и того, что ему подобно, и удаление нечистоты.',
      summary: doc(
        paragraph('[Демо-урок. Замените текст конспекта в админке.]'),
        bullets([
          'В языке «тахара» означает чистоту и очищение от загрязнений.',
          'В шариате — снятие хадаса и удаление нечистоты (наджаса).',
        ]),
      ),
      passingScore: 70,
      questions: [
        {
          question: 'Что означает слово «тахара» в языке?',
          options: [{ text: 'Чистота, очищение от загрязнений' }, { text: 'Омовение водой' }, { text: 'Намерение' }],
          correct: 1,
          explanation: 'В языке «тахара» — это чистота и освобождение от загрязнений.',
        },
        {
          question: 'Что такое тахара в шариатском смысле?',
          options: [
            { text: 'Только мытьё рук перед едой' },
            { text: 'Снятие хадаса и удаление нечистоты (наджаса)' },
            { text: 'Любое мытьё тела' },
          ],
          correct: 2,
          explanation: 'Шариатская тахара — снятие состояния осквернения (хадас) и удаление нечистоты (наджаса).',
        },
      ],
    } as any,
  })

  const createSample = (l: SampleLesson) =>
    payload.create({
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
      } as any,
    })

  const water = await createSample(waterTypes)
  const lesson2 = await createSample(tayammum)
  // Отдельный текстовый урок (не входит в курс) — раздел «Введение в мазхаб»
  await createSample(usulAhmad)

  await payload.create({
    collection: 'courses',
    data: {
      title: 'Фикх очищения (демо-курс)',
      slug: 'demo-fikh-ochischeniya',
      level: 'beginner',
      order: 1,
      bookTitleAr: 'أخصر المختصرات',
      bookAuthor: 'Ибн Бальбан',
      book: bookIds['ahsar-al-muhtasarat'],
      description:
        '[Демо-курс, чтобы посмотреть, как работает обучение. Замените или скройте его, когда добавите свои курсы.]',
      teacher: '[Имя преподавателя]',
      duration: '[≈ 1,5 часа]',
      modules: [
        { title: 'Введение в книгу очищения и виды воды', lessons: [lesson1.id, water.id] },
        { title: 'Таяммум', lessons: [lesson2.id] },
      ],
    } as any,
  })
  payload.logger.info('Демо-курс создан.')
} else {
  payload.logger.info('Демо-курс уже есть — пропускаю.')
}

for (const a of SAMPLE_ARTICLES) {
  const found = await payload.find({ collection: 'articles', where: { slug: { equals: a.slug } }, limit: 1 })
  if (found.totalDocs > 0) continue
  await payload.create({
    collection: 'articles',
    data: { ...a, isPublished: true, publishedAt: new Date().toISOString() } as any,
  })
  payload.logger.info(`Пример «${a.title}» добавлен.`)
}

payload.logger.info('Готово.')
process.exit(0)
