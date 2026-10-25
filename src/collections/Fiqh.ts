import { APIError, type CollectionConfig, type Field } from 'payload'

import { adminOnly, publishedOrAdmin } from '../access'
import { publishedField } from '../fields/published'
import { slugField } from '../fields/slug'

/*
 * Раздел «Фикх»: части → книги → разделы (абвабы) → текст по абзацам. Деление и арабский текст — по «Зад аль-Мустакни‘»
 * аль-Хаджжави (كتاب — книга, باب — раздел). Переводы, пояснения, темы, введение и схему наполняет владелец в админке.
 */

/** Кнопки под абзацем: имя поля и подпись (порядок кнопок — этот же). Пустая кнопка не показывается. */
export const FIQH_NOTES = [
  { name: 'explanation', label: 'Разъяснение' },
  { name: 'evidence', label: 'Доводы' },
  { name: 'otherOpinion', label: 'Второе мнение' },
  { name: 'question', label: 'Доп. вопрос' },
  { name: 'fatwa', label: 'Фетва' },
] as const

export type FiqhNoteName = (typeof FIQH_NOTES)[number]['name']

// Ошибка показывается в админке всплывающим сообщением (имя задано явно — см. QuranTranslations)
const fail = (message: string) => {
  const e = new APIError(message, 400, undefined, true)
  e.name = 'FiqhChapterError'
  return e
}

const order: Field = {
  name: 'order',
  label: 'Порядок',
  type: 'number',
  defaultValue: 1,
  admin: { position: 'sidebar', description: 'Чем меньше число, тем выше в списке. Обычно — номер по «Зад аль-Мустакни‘».' },
}

const titleAr: Field = {
  name: 'titleAr',
  label: 'Название по-арабски',
  type: 'text',
  admin: { rtl: true, description: 'Как в книге, например: كتاب الطهارة или باب الآنية.' },
}

export const FiqhParts: CollectionConfig = {
  slug: 'fiqh-parts',
  labels: { singular: 'Часть', plural: 'Части' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'isPublished'],
    group: 'Фикх',
    description: 'Первая страница раздела «Фикх» — шесть частей: Поклонение, Имущественные отношения, Наследство…',
  },
  defaultSort: 'order',
  access: { read: publishedOrAdmin, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'title', label: 'Название части', type: 'text', required: true },
    titleAr,
    order,
    slugField(),
    publishedField,
    { name: 'books', label: 'Книги этой части', type: 'join', collection: 'fiqh-books', on: 'part', defaultSort: 'order' },
  ],
}

export const FiqhBooks: CollectionConfig = {
  slug: 'fiqh-books',
  labels: { singular: 'Книга', plural: 'Книги' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'part', 'order', 'isPublished'],
    group: 'Фикх',
    description: 'Книга внутри части (в «Зад аль-Мустакни‘» — «كتاب», например «Книга очищения»).',
  },
  defaultSort: 'order',
  access: { read: publishedOrAdmin, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'title', label: 'Название книги', type: 'text', required: true },
    titleAr,
    { name: 'part', label: 'Часть', type: 'relationship', relationTo: 'fiqh-parts', required: true, index: true },
    order,
    slugField(),
    publishedField,
    { name: 'chapters', label: 'Разделы этой книги', type: 'join', collection: 'fiqh-chapters', on: 'book', defaultSort: 'order' },
  ],
}

export const FiqhChapters: CollectionConfig = {
  slug: 'fiqh-chapters',
  labels: { singular: 'Раздел', plural: 'Разделы' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'book', 'order', 'isPublished'],
    group: 'Фикх',
    description:
      'Раздел книги («باب»). На странице раздела абзацы идут подряд: справа арабский текст, слева перевод, под переводом кнопки «Разъяснение», «Доводы», «Второе мнение», «Доп. вопрос», «Фетва» — пустая кнопка не показывается. В шапке — кнопки «Введение в раздел» и «Схема раздела».',
  },
  defaultSort: 'order',
  access: { read: publishedOrAdmin, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'title', label: 'Название раздела', type: 'text', required: true },
    titleAr,
    { name: 'book', label: 'Книга', type: 'relationship', relationTo: 'fiqh-books', required: true, index: true },
    {
      name: 'order',
      label: 'Номер раздела в книге',
      type: 'number',
      required: true,
      min: 1,
      admin: { position: 'sidebar', description: 'По нему идёт список разделов и адрес страницы (…/tahara/2 — второй раздел).' },
    },
    publishedField,
    {
      name: 'intro',
      label: 'Введение в раздел (кнопка «Введение в раздел»)',
      type: 'richText',
    },
    {
      name: 'scheme',
      label: 'Схема раздела — картинка (кнопка «Схема раздела»)',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { contains: 'image' } },
      admin: { description: 'Картинка со схемой. Открывается в окне, по нажатию — крупно в новой вкладке.' },
    },
    { name: 'schemeNote', label: 'Схема раздела — пояснение под картинкой', type: 'richText' },
    {
      name: 'topics',
      label: 'Темы раздела',
      labels: { singular: 'Тема', plural: 'Темы' },
      type: 'array',
      admin: {
        description:
          'Где в разделе начинается новая тема: номер первого абзаца и название темы. На сайте название стоит подписью над этим абзацем (как темы аятов в суре). Сначала здесь стоят «Фасль» — деление самой книги (فصل); их можно переименовать.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'from', label: 'С абзаца №', type: 'number', required: true, min: 1, admin: { width: '25%' } },
            { name: 'title', label: 'Тема', type: 'text', required: true, admin: { width: '75%' } },
          ],
        },
      ],
    },
    {
      name: 'sentences',
      label: 'Текст по абзацам',
      labels: { singular: 'Абзац', plural: 'Абзацы' },
      type: 'array',
      admin: {
        initCollapsed: true,
        description: 'Номер абзаца на сайте — его место в этом списке (первый — 1). Порядок меняется перетаскиванием.',
      },
      fields: [
        { name: 'arabic', label: 'Арабский текст', type: 'textarea', required: true, admin: { rtl: true } },
        {
          name: 'translation',
          label: 'Перевод',
          type: 'textarea',
          admin: { description: 'Основной текст на сайте — жирный, пояснения в [ ] и ( ) — обычным, как в Коране.' },
        },
        ...FIQH_NOTES.map((f) => ({ name: f.name, label: `${f.label} (кнопка «${f.label}» под абзацем)`, type: 'richText' as const })),
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Темы: номер абзаца — в пределах раздела, по порядку
        const count = ((data.sentences ?? []) as unknown[]).length
        const topics = (data.topics ?? []) as { from?: number | null }[]
        const wrong = topics.filter((t) => !Number.isInteger(Number(t.from)) || Number(t.from) < 1 || Number(t.from) > count)
        if (wrong.length) throw fail(`Темы раздела: в разделе ${count} абзацев, а указан абзац ${wrong.map((t) => t.from ?? '—').join(', ')}.`)
        if (topics.length) data.topics = [...topics].sort((a, b) => Number(a.from) - Number(b.from))
        return data
      },
    ],
  },
}
