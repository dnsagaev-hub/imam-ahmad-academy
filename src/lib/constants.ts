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
  { label: 'Фикх', value: 'fiqh' },
  { label: 'Усуль', value: 'usul' },
  { label: 'Акида', value: 'aqida' },
  { label: 'Хадис', value: 'hadith' },
  { label: 'Арабский язык', value: 'arabic' },
  { label: 'Другое', value: 'other' },
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
