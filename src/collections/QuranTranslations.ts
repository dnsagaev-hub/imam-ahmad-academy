import path from 'path'
import { APIError, type CollectionConfig } from 'payload'

import { adminOnly, publishedOrAdmin } from '../access'
import { publishedField } from '../fields/published'
import { checkAyahNumbers, parseSurahDocx } from '../lib/docx'
import { AYAH_NOTES, getSurah, keepNotes } from '../lib/quran'

// Ошибка показывается в админке всплывающим сообщением. Имя задано явно: после сборки имена классов
// сжимаются, и без имени Payload заменяет текст на «An unknown error occurred».
const fail = (message: string) => {
  const e = new APIError(message, 400, undefined, true)
  e.name = 'QuranFileError'
  return e
}

/** Что не так с файлом для этой суры (или null, если всё верно). */
function docxProblem(buf: Buffer, s: { n: number; ru: string; ayahs: number }): string | null {
  let parsed
  try {
    parsed = parseSurahDocx(buf)
  } catch (e) {
    return (e as Error).message
  }
  if (!parsed.ayahs.length)
    return parsed.autoNumbered
      ? 'Номера аятов в файле поставлены автоматическим списком Word. Наберите номера текстом («1. Перевод…») или в Word: выделить список → «Нумерация» → выключить и вписать номера.'
      : 'В файле не найдено ни одного аята. Каждый аят — отдельный абзац, начинается с номера: «1. Перевод…».'
  if (parsed.stray) return `В файле есть абзац перевода без номера ${parsed.stray}. Соедините его с аятом или поставьте номер.`
  const errors = checkAyahNumbers(parsed.ayahs.map((a) => a.number), s.ayahs)
  return errors.length ? `Файл не подходит к суре ${s.n} «${s.ru}» (${s.ayahs} аятов): ${errors.join('; ')}.` : null
}

type Ayah = { number?: number | null; text?: string | null } & Record<string, unknown>

const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

/**
 * Перевод одной суры. Владелец загружает свой файл Word: аяты «N. текст» разбираются в список «Аяты».
 * Пояснения к аятам (толкование, причина ниспослания, связь, размышление) пишутся в админке и при повторной
 * загрузке файла сохраняются.
 * Арабский текст здесь не хранится — он постоянный (src/data/quran).
 */
export const QuranTranslations: CollectionConfig = {
  slug: 'quran-translations',
  labels: { singular: 'Перевод суры', plural: 'Переводы сур' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'translator', 'isPublished', 'updatedAt'],
    group: 'Коран',
    description:
      'Укажите номер суры и загрузите файл Word: каждый аят — абзац «1. Перевод…». Основной текст на сайте будет жирным, пояснения в [ ] и ( ) — обычным. Толкование, причина ниспослания, связь с предыдущим аятом и размышление — у аята в списке «Аяты» ниже. Много сур одним файлом (например, 78–114) — на сайте по адресу /quran/import.',
  },
  defaultSort: 'surah',
  access: {
    read: publishedOrAdmin,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  upload: {
    staticDir: path.resolve(process.cwd(), 'media/quran-docx'),
    mimeTypes: [DOCX],
    filesRequiredOnCreate: false,
  },
  fields: [
    {
      name: 'surah',
      label: 'Номер суры',
      type: 'number',
      required: true,
      unique: true,
      min: 1,
      max: 114,
      admin: { description: 'От 1 до 114. Для одной суры — одна запись.' },
    },
    { name: 'title', type: 'text', admin: { hidden: true } },
    publishedField,
    {
      name: 'translator',
      label: 'Переводчик (подпись на странице суры)',
      type: 'text',
      defaultValue: 'Дэни Сагаев',
      admin: { description: 'На сайте: «Перевод, комментарий и редакция — …»' },
    },
    { name: 'basmala', label: 'Перевод басмалы', type: 'text', admin: { description: 'Заполняется из файла, если там есть «С именем Аллаха…»' } },
    {
      name: 'ayahs',
      label: 'Аяты',
      labels: { singular: 'Аят', plural: 'Аяты' },
      type: 'array',
      admin: { initCollapsed: true },
      fields: [
        { name: 'number', label: 'Номер аята', type: 'number', required: true, min: 1 },
        { name: 'text', label: 'Перевод', type: 'textarea', required: true },
        // Пояснения: у аята на сайте — кнопка на каждое заполненное (порядок и подписи — AYAH_NOTES)
        ...AYAH_NOTES.map((f) => ({ name: f.name, label: `${f.label} (кнопка «${f.short}» у аята)`, type: 'richText' as const })),
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        const s = getSurah(Number(data.surah))
        if (!s) throw fail('Номер суры — от 1 до 114.')
        data.title = `${s.n}. ${s.ru}`

        // Новый файл Word: переводы аятов берутся из него, комментарии остаются прежними
        const file = req.file
        if (file?.data && file.name?.toLowerCase().endsWith('.docx')) {
          const problem = docxProblem(file.data, s)
          if (problem) throw fail(problem)
          const parsed = parseSurahDocx(file.data)
          // Пояснения к аятам: сначала из этого же сохранения, затем из сохранённой записи
          const old = new Map<number, Ayah>(((originalDoc?.ayahs ?? []) as Ayah[]).map((a) => [Number(a.number), a]))
          for (const a of (data.ayahs ?? []) as Ayah[]) if (AYAH_NOTES.some((f) => a[f.name])) old.set(Number(a.number), a)
          data.ayahs = parsed.ayahs.map((a) => ({ number: a.number, text: a.text, ...keepNotes(old.get(a.number)) }))
          if (parsed.basmala) data.basmala = parsed.basmala
          return data
        }

        // Правка вручную: номера аятов тоже должны совпадать с сурой
        const ayahs = (data.ayahs ?? []) as Ayah[]
        if (ayahs.length) {
          const errors = checkAyahNumbers(ayahs.map((a) => Number(a.number)), s.ayahs)
          if (errors.length) throw fail(`Аяты не совпадают с сурой ${s.n} «${s.ru}» (${s.ayahs} аятов): ${errors.join('; ')}.`)
          data.ayahs = [...ayahs].sort((a, b) => Number(a.number) - Number(b.number))
        }
        return data
      },
    ],
  },
}
