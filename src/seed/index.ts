/*
 * Демо-наполнение: настройки сайта и небольшой курс из двух уроков с тестами.
 * Запуск: npm run seed  (повторный запуск ничего не дублирует)
 * Демо-курс можно потом удалить или скрыть в админке.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { seedArticles, seedLibrary, seedProgram, seedTextLessons } from './starter'

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

const bookIds = await seedLibrary(payload)
const lessonIds = await seedTextLessons(payload, bookIds)
await seedProgram(payload, bookIds)

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

  const water = { id: lessonIds['vidy-vody'] }
  const lesson2 = { id: lessonIds['demo-tayammum'] }

  await payload.create({
    collection: 'courses',
    data: {
      title: 'Фикх очищения (демо-курс)',
      slug: 'demo-fikh-ochischeniya',
      level: 'intermediate',
      discipline: 'fiqh',
      order: 0,
      bookTitleAr: 'أخصر المختصرات',
      bookAuthor: 'Ибн Бальбан',
      books: [bookIds['ahsar-al-muhtasarat']],
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

await seedArticles(payload)

payload.logger.info('Готово.')
process.exit(0)
