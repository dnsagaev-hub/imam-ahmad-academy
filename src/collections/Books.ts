import type { CollectionConfig } from 'payload'

import { adminOnly, publishedOrAdmin } from '../access'
import { publishedField } from '../fields/published'
import { slugField } from '../fields/slug'
import { BOOK_CATEGORIES, BOOK_KINDS, BOOK_LANGS, BOOK_LEVELS } from '../lib/constants'

export const Books: CollectionConfig = {
  slug: 'books',
  labels: { singular: 'Книга', plural: 'Библиотека' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'kind', 'category', 'level', 'isPublished'],
    group: 'Материалы',
    description:
      'Загружайте только книги, которые разрешено распространять (старые издания без авторских прав, разрешение издателя или свои материалы). Для остальных достаточно ссылки на электронную библиотеку.',
  },
  defaultSort: 'order',
  access: {
    read: publishedOrAdmin,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'title', label: 'Название (русский)', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'titleAr', label: 'Название (арабский)', type: 'text', admin: { width: '50%' } },
      ],
    },
    slugField('title'),
    publishedField,
    {
      type: 'row',
      fields: [
        { name: 'author', label: 'Автор', type: 'text', admin: { width: '40%' } },
        { name: 'authorAr', label: 'Автор (арабский)', type: 'text', admin: { width: '40%' } },
        {
          name: 'authorDeath',
          label: 'Год смерти, хиджра',
          type: 'number',
          admin: { width: '20%', description: 'Например, 1083' },
        },
      ],
    },
    {
      name: 'category',
      label: 'Раздел',
      type: 'select',
      required: true,
      options: BOOK_CATEGORIES.map(({ label, value }) => ({ label, value })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'kind',
      label: 'Вид книги',
      type: 'select',
      required: true,
      defaultValue: 'matn',
      options: BOOK_KINDS.map(({ label, value }) => ({ label, value })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'level',
      label: 'Ступень',
      type: 'select',
      options: BOOK_LEVELS.map(({ label, value }) => ({ label, value })),
      admin: { position: 'sidebar', description: 'По ступеням строится «Путь изучения» на странице библиотеки' },
    },
    {
      name: 'language',
      label: 'Язык',
      type: 'select',
      defaultValue: 'ar',
      options: BOOK_LANGS.map(({ label, value }) => ({ label, value })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'isMutamad',
      label: 'Опорная книга мазхаба',
      type: 'checkbox',
      admin: { position: 'sidebar', description: 'Книги, по которым определяется основное мнение (му‘тамад)' },
    },
    { name: 'order', label: 'Порядок', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
    {
      name: 'baseBook',
      label: 'Это шарх (хашия, перевод) на книгу',
      type: 'relationship',
      relationTo: 'books',
      admin: { condition: (_, d) => ['sharh', 'hashiya', 'translation'].includes(d?.kind) },
    },
    { name: 'description', label: 'Коротко о книге (для карточки)', type: 'textarea', required: true },
    {
      name: 'about',
      label: 'Подробнее: чем ценна книга, как её изучать',
      type: 'textarea',
      admin: { description: 'Абзацы разделяйте пустой строкой' },
    },
    {
      type: 'row',
      fields: [
        { name: 'edition', label: 'Издание (тахкик, издательство, год)', type: 'text', admin: { width: '75%' } },
        { name: 'pages', label: 'Страниц', type: 'number', admin: { width: '25%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'cover', label: 'Обложка (необязательно)', type: 'upload', relationTo: 'media', admin: { width: '50%' } },
        {
          name: 'file',
          label: 'Файл книги (PDF)',
          type: 'upload',
          relationTo: 'media',
          admin: { width: '50%', description: 'Можно не загружать, если есть ссылка ниже' },
        },
      ],
    },
    {
      name: 'links',
      label: 'Читать онлайн',
      type: 'array',
      labels: { singular: 'Ссылка', plural: 'Ссылки' },
      admin: { description: 'Например, страница книги на shamela.ws или app.turath.io' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', label: 'Название', type: 'text', required: true, admin: { width: '35%' } },
            { name: 'url', label: 'Адрес', type: 'text', required: true, admin: { width: '65%' } },
          ],
        },
      ],
    },
  ],
}
