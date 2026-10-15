// Справочники, которые используются и в админке, и на сайте.

export const LESSON_CATEGORIES = [
  { label: 'Введение в мазхаб', value: 'madhhab' },
  { label: 'Фикх', value: 'fiqh' },
  { label: 'Хадис', value: 'hadith' },
  { label: 'Усуль аль-фикх', value: 'usul' },
  { label: 'Правила фикха', value: 'qawaid' },
  { label: 'Арабский язык', value: 'arabic' },
  { label: 'Наука о хадисах', value: 'mustalah' },
  { label: 'Наука о Коране', value: 'quran' },
] as const

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
