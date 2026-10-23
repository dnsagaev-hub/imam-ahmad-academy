import type { CollectionConfig, Field } from 'payload'

import { adminOnly, publishedOrAdmin } from '../access'
import { publishedField } from '../fields/published'
import { slugField } from '../fields/slug'

/*
 * Раздел «Хадисы»: темы → книги → главы → хадисы (деление — по книге Салиха аш-Шами «معالم السنة النبوية»:
 * مقصد — тема, كتاب — книга, فصل/باب — глава). Всё наполняет владелец в админке.
 */

/** Кнопки под хадисом: имя поля и подпись (порядок кнопок — этот же). Пустая кнопка не показывается. */
export const HADITH_PARTS = [
  { name: 'source', label: 'Источник' },
  { name: 'grade', label: 'Степень достоверности' },
  { name: 'explanation', label: 'Разъяснение' },
] as const

const order: Field = {
  name: 'order',
  label: 'Порядок',
  type: 'number',
  defaultValue: 1,
  admin: { position: 'sidebar', description: 'Чем меньше число, тем выше в списке. Обычно — номер по книге.' },
}

const titleAr: Field = {
  name: 'titleAr',
  label: 'Название по-арабски',
  type: 'text',
  admin: { description: 'Как в книге, например: الكتاب الأول: الإسلام والإيمان → «الإسلام والإيمان».' },
}

export const HadithTopics: CollectionConfig = {
  slug: 'hadith-topics',
  labels: { singular: 'Тема', plural: 'Темы' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'isPublished'],
    group: 'Хадисы',
    description: 'Первая страница раздела «Хадисы» — список тем (в книге «Ма‘алим ас-Сунна» это «مقاصد»: Акыда, Знание и его источники…).',
  },
  defaultSort: 'order',
  access: { read: publishedOrAdmin, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'title', label: 'Название темы', type: 'text', required: true },
    titleAr,
    order,
    slugField(),
    publishedField,
    { name: 'books', label: 'Книги этой темы', type: 'join', collection: 'hadith-books', on: 'topic', defaultSort: 'order' },
  ],
}

export const HadithBooks: CollectionConfig = {
  slug: 'hadith-books',
  labels: { singular: 'Книга', plural: 'Книги' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'topic', 'order', 'isPublished'],
    group: 'Хадисы',
    description: 'Книга внутри темы (в «Ма‘алим ас-Сунна» — «كتاب», например «Ислам и иман»). На странице книги хадисы идут подряд по главам.',
  },
  defaultSort: 'order',
  access: { read: publishedOrAdmin, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'title', label: 'Название книги', type: 'text', required: true },
    titleAr,
    { name: 'topic', label: 'Тема', type: 'relationship', relationTo: 'hadith-topics', required: true, index: true },
    order,
    slugField(),
    publishedField,
    { name: 'sections', label: 'Главы этой книги', type: 'join', collection: 'hadith-sections', on: 'book', defaultSort: 'order' },
    { name: 'hadiths', label: 'Хадисы этой книги', type: 'join', collection: 'hadiths', on: 'book', defaultSort: 'number' },
  ],
}

export const HadithSections: CollectionConfig = {
  slug: 'hadith-sections',
  labels: { singular: 'Глава', plural: 'Главы' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'book', 'order'],
    group: 'Хадисы',
    description: 'Глава внутри книги («فصل» или «باب»). Необязательна: в книге без глав хадисы идут одним списком.',
  },
  defaultSort: 'order',
  access: { read: () => true, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'title', label: 'Название главы', type: 'text', required: true },
    titleAr,
    { name: 'book', label: 'Книга', type: 'relationship', relationTo: 'hadith-books', required: true, index: true },
    order,
  ],
}

export const Hadiths: CollectionConfig = {
  slug: 'hadiths',
  labels: { singular: 'Хадис', plural: 'Хадисы' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'book', 'section', 'isPublished'],
    group: 'Хадисы',
    description:
      'Справа на сайте — арабский текст с огласовками, слева — перевод. Под хадисом кнопки «Источник», «Степень достоверности», «Разъяснение»: пустая кнопка не показывается.',
  },
  defaultSort: 'number',
  access: { read: publishedOrAdmin, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'book', label: 'Книга', type: 'relationship', relationTo: 'hadith-books', required: true, index: true },
    {
      name: 'section',
      label: 'Глава',
      type: 'relationship',
      relationTo: 'hadith-sections',
      // Только главы выбранной книги
      filterOptions: ({ data }) => (data?.book ? { book: { equals: data.book } } : true),
      admin: { description: 'Необязательно. Сначала выберите книгу — здесь появятся её главы.' },
    },
    {
      name: 'number',
      label: 'Номер хадиса в книге',
      type: 'number',
      required: true,
      min: 1,
      admin: { description: 'По нему хадисы идут по порядку; показывается в кружке рядом с переводом.' },
    },
    { name: 'title', type: 'text', admin: { hidden: true } },
    publishedField,
    {
      name: 'arabic',
      label: 'Арабский текст (с огласовками)',
      type: 'textarea',
      required: true,
      admin: { rtl: true, description: 'Текст хадиса из сборника, дословно.' },
    },
    {
      name: 'translation',
      label: 'Перевод',
      type: 'textarea',
      required: true,
      admin: { description: 'Основной текст на сайте — жирный, пояснения в [ ] и ( ) — обычным, как в Коране.' },
    },
    { name: 'source', label: 'Источник (кнопка «Источник»)', type: 'richText', admin: { description: 'Сборник и номер хадиса, например: «Передал Муслим (№ 8)».' } },
    { name: 'grade', label: 'Степень достоверности (кнопка «Степень достоверности»)', type: 'richText', admin: { description: 'Например: «Достоверный (сахих)» или «О достоверности есть разногласия: …».' } },
    { name: 'explanation', label: 'Разъяснение (кнопка «Разъяснение»)', type: 'richText' },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        const id = typeof data.book === 'object' && data.book ? data.book.id : data.book
        let book = ''
        if (id) {
          try {
            book = ((await req.payload.findByID({ collection: 'hadith-books', id, depth: 0, req })) as { title?: string }).title ?? ''
          } catch {
            /* книга удалена — название без неё */
          }
        }
        data.title = `${book ? `${book} · ` : ''}хадис ${data.number ?? ''}`.trim()
        return data
      },
    ],
  },
}
