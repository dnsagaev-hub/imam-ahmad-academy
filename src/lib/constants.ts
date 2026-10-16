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

/** Рубрики аудио- и видеоуроков (без «Акыды» — она только в текстовых уроках). */
export const MEDIA_CATEGORIES = LESSON_CATEGORIES.filter((c) => c.value !== 'aqida')

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
  { label: 'Хадис', value: 'hadith' },
  { label: 'Сира', value: 'sira' },
  { label: 'Ахляк и очищение души', value: 'akhlaq' },
  { label: 'Арабский язык', value: 'arabic' },
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
  { label: 'Мубтади — начальная ступень', short: 'Мубтади', value: 'beginner' },
  { label: 'Мутавассит — средняя ступень', short: 'Мутавассит', value: 'intermediate' },
  { label: 'Мунтахи — продвинутая ступень', short: 'Мунтахи', value: 'advanced' },
  { label: 'Для сверки (не по ступеням)', short: 'Для сверки', value: 'reference' },
] as const

export const BOOK_LANGS = [
  { label: 'Арабский', value: 'ar' },
  { label: 'Русский', value: 'ru' },
  { label: 'Арабский + русский', value: 'ar-ru' },
] as const

export const COURSE_LEVELS = [
  { label: 'Начальный', value: 'beginner' },
  { label: 'Средний', value: 'intermediate' },
  { label: 'Продвинутый', value: 'advanced' },
] as const

export const STUDENT_LEVELS = [
  { key: 'mubtadi', name: 'Мубтади', ar: 'مبتدئ', desc: 'Начинающий' },
  { key: 'mutawassit', name: 'Мутавассит', ar: 'متوسط', desc: 'Средний' },
  { key: 'muntahi', name: 'Мунтахи', ar: 'منتهٍ', desc: 'Продвинутый' },
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
