import type { Payload, PayloadRequest } from 'payload'

import { ARABIC_COURSE_SLUG } from './arabicLessons'

/*
 * Дополнительные курсы к основному курсу арабского языка (задача 55, список владельца 05.11.2026).
 * Названия, арабские названия, уровни и число уроков — от владельца. Курсы создаются пустыми: уроки добавляются
 * в админке так же, как у основного курса (вкладка урока «Урок арабского»).
 * Вызывается миграцией (один раз на базе владельца), демо- и стартовым наполнением. Курс, который уже есть
 * (по адресу), не трогается — правки владельца не перезаписываются.
 */

type Extra = {
  slug: string
  title: string
  titleAr: string
  level: 'beginner' | 'intermediate' | 'advanced'
  levelNote?: string
  planned: string
  description: string
}

export const ARABIC_EXTRA_COURSES: Extra[] = [
  {
    slug: 'arabic-dop-01-fonetika',
    title: 'Фонетика арабского языка',
    titleAr: 'عِلْمُ الْأَصْوَاتِ',
    level: 'beginner',
    planned: '12–15',
    description: 'Звуки арабского языка и их верное произношение.',
  },
  {
    slug: 'arabic-dop-02-orfografiya',
    title: 'Арабская орфография',
    titleAr: 'الْإِمْلَاءُ',
    level: 'beginner',
    planned: '12–16',
    description: 'Правила арабского письма.',
  },
  {
    slug: 'arabic-dop-03-morfologiya',
    title: 'Практическая морфология',
    titleAr: 'الصَّرْفُ التَّطْبِيقِيُّ',
    level: 'beginner',
    planned: '20–25',
    description: 'Строение арабского слова на практике.',
  },
  {
    slug: 'arabic-dop-04-irab',
    title: 'Практический синтаксический разбор',
    titleAr: 'الْإِعْرَابُ التَّطْبِيقِيُّ',
    level: 'beginner',
    planned: '20',
    description: 'Синтаксический разбор (и‘раб) предложений на практике.',
  },
  {
    slug: 'arabic-dop-05-chtenie',
    title: 'Чтение и понимание текстов',
    titleAr: 'الْقِرَاءَةُ وَفَهْمُ الْمَقْرُوءِ',
    level: 'beginner',
    planned: '30–40',
    description: 'Чтение арабских текстов и понимание прочитанного.',
  },
  {
    slug: 'arabic-dop-06-audirovanie',
    title: 'Аудирование',
    titleAr: 'الِاسْتِمَاعُ',
    level: 'beginner',
    planned: '20–30',
    description: 'Понимание арабской речи на слух.',
  },
  {
    slug: 'arabic-dop-07-razgovornyi',
    title: 'Разговорный литературный арабский',
    titleAr: 'الْمُحَادَثَةُ',
    level: 'beginner',
    planned: '20–30',
    description: 'Устная речь на литературном арабском языке.',
  },
  {
    slug: 'arabic-dop-08-pismennaya-rech',
    title: 'Письменная речь',
    titleAr: 'التَّعْبِيرُ وَالْإِنْشَاءُ',
    level: 'beginner',
    planned: '15–20',
    description: 'Изложение своих мыслей на арабском языке в письменной форме.',
  },
  {
    slug: 'arabic-dop-09-slovoobrazovanie',
    title: 'Словообразование и работа со словарями',
    titleAr: 'الِاشْتِقَاقُ وَاسْتِخْدَامُ الْمَعَاجِمِ',
    level: 'intermediate',
    planned: '12–16',
    description: 'Образование слов от корня и поиск слов в арабских словарях.',
  },
  {
    slug: 'arabic-dop-10-yazyk-korana',
    title: 'Язык Корана',
    titleAr: 'لُغَةُ الْقُرْآنِ الْكَرِيمِ',
    level: 'intermediate',
    planned: '20–30',
    description: 'Арабский язык Корана: слова и обороты.',
  },
  {
    slug: 'arabic-dop-11-balagha',
    title: 'Арабская риторика',
    titleAr: 'الْبَلَاغَةُ',
    level: 'advanced',
    planned: '20–25',
    description: 'Арабская риторика (балага).',
  },
  {
    slug: 'arabic-dop-12-turath',
    title: 'Чтение классической исламской литературы',
    titleAr: 'قِرَاءَةُ النُّصُوصِ التُّرَاثِيَّةِ',
    level: 'intermediate',
    levelNote: 'Средний → продвинутый',
    planned: '20–30',
    description: 'Чтение классических книг исламских наук в оригинале.',
  },
]

/** Создаёт дополнительные курсы арабского, которых ещё нет; без основного курса ничего не делает. */
export async function installArabicExtraCourses(payload: Payload, req?: Partial<PayloadRequest>) {
  const opts = { req, overrideAccess: true as const }
  const main = await payload.find({ collection: 'courses', where: { slug: { equals: ARABIC_COURSE_SLUG } }, limit: 1, depth: 0, ...opts })
  const parent = main.docs[0]
  if (!parent) return
  let created = 0
  for (const [i, c] of ARABIC_EXTRA_COURSES.entries()) {
    const found = await payload.find({ collection: 'courses', where: { slug: { equals: c.slug } }, limit: 1, depth: 0, ...opts })
    if (found.totalDocs > 0) continue
    await payload.create({
      collection: 'courses',
      data: {
        title: c.title,
        slug: c.slug,
        level: c.level,
        levelNote: c.levelNote ?? '',
        plannedLessons: c.planned,
        parentCourse: parent.id,
        order: i + 1,
        discipline: 'arabic',
        status: 'approved',
        description: c.description,
        bookTitleAr: c.titleAr,
        modules: [],
        isPublished: true,
      } as any,
      ...opts,
    })
    created += 1
  }
  if (created) payload.logger.info(`Дополнительные курсы арабского: создано ${created} из ${ARABIC_EXTRA_COURSES.length}.`)
}
