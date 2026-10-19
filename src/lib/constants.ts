// Справочники, которые используются и в админке, и на сайте.

/** Все рубрики уроков (для выбора в админке и для текстовых уроков). */
export const LESSON_CATEGORIES = [
  { label: 'Введение в мазхаб', value: 'madhhab' },
  { label: 'Акыда', value: 'aqida' },
  { label: 'Фикх', value: 'fiqh' },
  { label: 'Хадис', value: 'hadith' },
  { label: 'Усуль аль-фикх', value: 'usul' },
  { label: 'Правила фикха', value: 'qawaid' },
  { label: 'Арабский язык', value: 'arabic' },
  { label: 'Наука о хадисах', value: 'mustalah' },
  { label: 'Наука о Коране', value: 'quran' },
  { label: 'Сира', value: 'sira' },
  { label: 'Ахляк и очищение души', value: 'akhlaq' },
] as const

/** Рубрики аудио- и видеоуроков (те же, что у всех уроков; «Акыда» добавлена по решению владельца, задача 9). */
export const MEDIA_CATEGORIES = LESSON_CATEGORIES

/** Рубрики текстовых уроков. */
export const TEXT_CATEGORIES = LESSON_CATEGORIES

export const ARTICLE_CATEGORIES = [
  { label: 'Введение в мазхаб', value: 'madhhab' },
  { label: 'Вероучение', value: 'aqida' },
  { label: 'Фикх', value: 'fiqh' },
  { label: 'Биографии учёных', value: 'biographies' },
  { label: 'Усуль аль-фикх', value: 'usul' },
  { label: 'Правила фикха', value: 'qawaid' },
  { label: 'Разборы аятов', value: 'ayat' },
  { label: 'Разборы хадисов', value: 'hadith' },
] as const

export const BOOK_CATEGORIES = [
  { label: 'Введение в мазхаб', value: 'madhhab' },
  { label: 'Фикх', value: 'fiqh' },
  { label: 'Усуль аль-фикх', value: 'usul' },
  { label: 'Правила фикха', value: 'qawaid' },
  { label: 'Акыда', value: 'aqida' },
  { label: 'Коран и тафсир', value: 'quran' },
  { label: 'Хадис', value: 'hadith' },
  { label: 'Сира', value: 'sira' },
  { label: 'Адаб и азкары', value: 'adab' },
  { label: 'Ахляк и очищение души', value: 'akhlaq' },
  { label: 'Арабский язык', value: 'arabic' },
  { label: 'Логика (мантык)', value: 'mantiq' },
  { label: 'Другое', value: 'other' },
] as const

/** Вид книги: матн, шарх и т. д. */
export const BOOK_KINDS = [
  { label: 'Матн', value: 'matn', hint: 'Основной текст для заучивания и изучения' },
  { label: 'Шарх', value: 'sharh', hint: 'Разъяснение матна' },
  { label: 'Хашия', value: 'hashiya', hint: 'Примечания к шарху' },
  { label: 'Справочник', value: 'reference', hint: 'Большие книги для сверки' },
  { label: 'Перевод', value: 'translation', hint: 'Перевод на русский язык' },
  { label: 'Пособие', value: 'textbook', hint: 'Учебные материалы академии' },
] as const

/** Ступень, на которой изучают книгу. */
export const BOOK_LEVELS = [
  { label: 'I. Подготовительная ступень', short: 'I ступень', value: 'prep' },
  { label: 'II. Начальная ступень', short: 'II ступень', value: 'beginner' },
  { label: 'III. Средняя ступень', short: 'III ступень', value: 'intermediate' },
  { label: 'IV. Продвинутая ступень', short: 'IV ступень', value: 'advanced' },
  { label: 'Для сверки (вне программы)', short: 'Для сверки', value: 'reference' },
] as const

export const BOOK_LANGS = [
  { label: 'Арабский', value: 'ar' },
  { label: 'Русский', value: 'ru' },
  { label: 'Арабский + русский', value: 'ar-ru' },
] as const

/** Четыре ступени учебной программы академии (сводная редакция от 17.10.2026). */
export const COURSE_LEVELS = [
  {
    label: 'Подготовительный',
    stage: 'подготовительная',
    value: 'prep',
    roman: 'I',
    ar: 'التمهيدي',
    stageAr: 'المرحلة التمهيدية',
    name: 'Тамхиди',
    task: 'Введение в исламские науки, арабский язык и основы поклонения',
    about: 'Первое знакомство с исламскими науками, чтением Корана, арабским языком, поклонением и нравственным воспитанием.',
  },
  {
    label: 'Начальный',
    stage: 'начальная',
    value: 'beginner',
    roman: 'II',
    ar: 'المبتدئ',
    stageAr: 'المرحلة المبتدئة',
    name: 'Мубтади',
    task: 'Начальные систематические матны и языковая база',
    about: 'Систематическое освоение небольших матнов, закрепление поклонения, знакомство с прочими разделами фикха и укрепление языка.',
  },
  {
    label: 'Средний',
    stage: 'средняя',
    value: 'intermediate',
    roman: 'III',
    ar: 'المتوسط',
    stageAr: 'المرحلة المتوسطة',
    name: 'Мутавассит',
    task: 'Освоение основных дисциплин и терминологии классических текстов',
    about: 'Первое цельное освоение классического ханбалитского матна и фундаментальных дисциплин, необходимых для углублённого чтения.',
  },
  {
    label: 'Продвинутый',
    stage: 'продвинутая',
    value: 'advanced',
    roman: 'IV',
    ar: 'المتقدم',
    stageAr: 'المرحلة المتقدمة',
    name: 'Мутакаддим',
    task: 'Углублённые комментарии и подготовка к последующей специализации',
    about: 'Углублённое изучение классических комментариев, взаимосвязи правовых источников и методов самостоятельной работы с арабской научной литературой.',
  },
] as const

/** Дисциплины программы. */
export const DISCIPLINES = [
  { label: 'Фикх', value: 'fiqh' },
  { label: 'Фикх поклонения', value: 'fiqh-ibadat' },
  { label: 'Усуль аль-фикх', value: 'usul' },
  { label: 'Правовые правила', value: 'qawaid' },
  { label: 'Коран и таджвид', value: 'tajwid' },
  { label: 'Тафсир', value: 'tafsir' },
  { label: 'Хадисы', value: 'hadith' },
  { label: 'Хадисы законоположений', value: 'ahkam' },
  { label: 'Науки о хадисах', value: 'mustalah' },
  { label: 'Акыда', value: 'aqida' },
  { label: 'Введение в мазхаб', value: 'madhhab' },
  { label: 'Методология мазхаба', value: 'madhhab-method' },
  { label: 'Арабский язык', value: 'arabic' },
  { label: 'Нахв', value: 'nahw' },
  { label: 'Сарф', value: 'sarf' },
  { label: 'Балага', value: 'balagha' },
  { label: 'Чтение и словарь', value: 'reading' },
  { label: 'Мантык', value: 'mantiq' },
  { label: 'Сира', value: 'sira' },
  { label: 'Адаб', value: 'adab' },
  { label: 'Азкары', value: 'adhkar' },
  { label: 'Тазкия', value: 'tazkiya' },
] as const

/** Статус позиции в программе. */
export const COURSE_STATUSES = [
  { label: 'Утверждено', value: 'approved' },
  { label: 'Рабочий выбор', value: 'working' },
  { label: 'Пособие в разработке', value: 'draft' },
] as const

/** Шкала успеха ученика — по ступеням программы. */
export const STUDENT_LEVELS = [
  { key: 'tamhidi', name: 'Тамхиди', ar: 'تمهيدي', desc: 'Подготовительный' },
  { key: 'mubtadi', name: 'Мубтади', ar: 'مبتدئ', desc: 'Начинающий' },
  { key: 'mutawassit', name: 'Мутавассит', ar: 'متوسط', desc: 'Средний' },
  { key: 'mutaqaddim', name: 'Мутакаддим', ar: 'متقدم', desc: 'Продвинутый' },
] as const

export function labelOf(
  list: readonly { label: string; value: string }[],
  value: string | null | undefined,
): string {
  return list.find((i) => i.value === value)?.label ?? ''
}

/** Арабские названия рубрик — для обложек видео без картинки. */
export const CATEGORY_AR: Record<string, string> = {
  madhhab: 'المذهب الحنبلي',
  aqida: 'العقيدة',
  fiqh: 'الفقه',
  hadith: 'الحديث',
  usul: 'أصول الفقه',
  qawaid: 'القواعد الفقهية',
  arabic: 'اللغة العربية',
  mustalah: 'مصطلح الحديث',
  quran: 'علوم القرآن',
  sira: 'السيرة النبوية',
  akhlaq: 'الأخلاق والتزكية',
}
