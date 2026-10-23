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

// Демо-перевод суры для проверки раздела «Коран» (заглушка, не перевод владельца)
const demoSurah = await payload.find({ collection: 'quran-translations', where: { surah: { equals: 114 } }, limit: 1 })
if (!demoSurah.docs.length) {
  await payload.create({
    collection: 'quran-translations',
    data: {
      surah: 114,
      translator: 'Образец',
      basmala: 'Образец перевода басмалы',
      // Тема отрывка над аятом 4 (задача 40, заглушка)
      topics: [{ from: 4, title: 'Образец темы аятов' }],
      ayahs: Array.from({ length: 6 }, (_, i) => ({
        number: i + 1,
        text: `Образец: перевод аята ${i + 1} [пояснение в квадратных скобках] и основной текст (уточнение в круглых скобках).`,
        // У аята 1 — все четыре пояснения, у аята 2 — только толкование (задача 33)
        comment: i < 2 ? (doc(paragraph('Образец толкования аята. Здесь будет пояснение владельца.')) as never) : null,
        occasion: i === 0 ? (doc(paragraph('Образец: причина ниспослания аята.')) as never) : null,
        connection: i === 0 ? (doc(paragraph('Образец: связь с предыдущим аятом.')) as never) : null,
        reflection: i === 0 ? (doc(paragraph('Образец: размышление над аятом.')) as never) : null,
      })),
    },
  })
  payload.logger.info('Демо-перевод суры 114 создан.')
}

// Демо-сведения о суре (задача 31, заглушка, не текст владельца): у 114 три пункта из четырёх, у 113 запись скрыта
const demoInfo = await payload.find({ collection: 'surah-info', where: { surah: { in: [113, 114] } }, limit: 2 })
if (!demoInfo.docs.length) {
  const sample = (what: string) => doc(paragraph(`Образец: здесь владелец пишет ${what}.`)) as never
  await payload.create({
    collection: 'surah-info',
    data: { surah: 114, nameInfo: sample('о названии суры'), goals: sample('о целях суры'), revelation: sample('о месте ниспослания'), virtues: sample('хадис о достоинстве суры') },
  })
  await payload.create({ collection: 'surah-info', data: { surah: 113, isPublished: false, goals: sample('о целях суры') } })
  payload.logger.info('Демо-сведения о сурах 113 и 114 созданы.')
}

// Раздел «Хадисы» (задача 37): темы, книги и главы создаёт миграция, здесь — два хадиса для проверки вида.
// Арабский текст — по «معالم السنة النبوية» (т. 1, с. 29 и 31, хадисы № 1 и № 4), перевод и разъяснение — образец.
// Главы-«أبواب» книги «Ислам и иман» создаются только здесь, чтобы CI проверял показ хадисов по главам.
const islamBook = await payload.find({ collection: 'hadith-books', where: { slug: { equals: 'islam-i-iman' } }, limit: 1 })
const hadithCount = await payload.count({ collection: 'hadiths' })
if (islamBook.docs.length && !hadithCount.totalDocs) {
  const book = islamBook.docs[0].id
  const bab1 = await payload.create({ collection: 'hadith-sections', data: { book, order: 1, title: 'Столпы ислама и имана', titleAr: 'أركان الإسلام والإيمان' } })
  const bab2 = await payload.create({ collection: 'hadith-sections', data: { book, order: 2, title: 'Искренность и намерение', titleAr: 'الإخلاص والنية' } })
  const rich = (t: string) => doc(paragraph(t)) as never
  await payload.create({
    collection: 'hadiths',
    data: {
      book,
      section: bab1.id,
      number: 1,
      arabic:
        'عَن ابْنِ عُمَرَ قَالَ: قَالَ رَسُولُ اللهِ ﷺ: (بُنِيَ الْإِسْلَامُ عَلَىٰ خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَٰهَ إِلَّا اللهُ وَأَنَّ مُحَمَّداً رَسُولُ اللهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَالحَجِّ، وَصَوْمِ رَمَضَانَ).',
      translation:
        'Образец перевода. Передают со слов Ибн ‘Умара, что Посланник Аллаха ﷺ сказал: «Ислам построен на пяти [столпах]: свидетельстве, что нет божества, кроме Аллаха, и что Мухаммад — посланник Аллаха, совершении молитвы, выплате закята, хадже и посте в [месяц] Рамадан».',
      source: rich('Передали аль-Бухари (№ 8) и Муслим (№ 16). В «Ма‘алим ас-Сунна» — хадис № 1 (т. 1, с. 29).'),
      grade: rich('Достоверный (сахих): хадис передан в обоих «Сахихах», в книге помечен «ق» (متفق عليه).'),
      explanation: rich('Образец: здесь владелец пишет разъяснение хадиса.'),
    },
  })
  await payload.create({
    collection: 'hadiths',
    data: {
      book,
      section: bab2.id,
      number: 4,
      arabic:
        'عَنْ عُمَرَ بْنِ الخَطَّابِ رضي الله عنه قَالَ: سَمِعْتُ النَّبِيَّ ﷺ يَقُولُ: (يَا أَيُّهَا النَّاسُ! إِنَّمَا الْأَعْمَالُ بِالنِّيَّةِ، وَإِنَّمَا لِامْرِئٍ مَا نَوَىٰ، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللهِ وَرَسُولِهِ، فَهِجْرَتُهُ إِلَى اللهِ وَرَسُولِهِ، وَمَنْ هَاجَرَ إِلَىٰ دُنْيَا يُصِيبُهَا، أَوْ امْرَأَةٍ يَتَزَوَّجُهَا، فَهِجْرَتُهُ إِلَىٰ مَا هَاجَرَ إِلَيْهِ).',
      translation:
        'Образец перевода. Передают, что ‘Умар ибн аль-Хаттаб (да будет доволен им Аллах) сказал: «Я слышал, как Пророк ﷺ говорил: “О люди! Поистине, дела [оцениваются] по намерению, и, поистине, каждому человеку — то, что он намеревался. У того, чьё переселение было к Аллаху и Его посланнику, переселение — к Аллаху и Его посланнику, а у того, кто переселился ради мирского, которое он получит, или ради женщины, на которой женится, переселение — к тому, ради чего он переселился”».',
      source: rich('Передали аль-Бухари (№ 6953) и Муслим (№ 1907). В «Ма‘алим ас-Сунна» — хадис № 4 (т. 1, с. 31).'),
      grade: rich('Достоверный (сахих): хадис передан в обоих «Сахихах», в книге помечен «ق» (متفق عليه).'),
    },
  })
  // Скрытый хадис: на сайте его быть не должно
  await payload.create({
    collection: 'hadiths',
    data: { book, number: 99, isPublished: false, arabic: 'Образец: скрытый текст', translation: 'Образец: скрытый хадис' },
  })
  payload.logger.info('Демо-хадисы созданы.')
}

payload.logger.info('Готово.')
process.exit(0)
