import type { CollectionConfig } from 'payload'

import { adminOnly, publishedOrAdmin } from '../access'
import { publishedField } from '../fields/published'
import { BOOK_CATEGORIES } from '../lib/constants'

export const Books: CollectionConfig = {
  slug: 'books',
  labels: { singular: 'Книга', plural: 'Библиотека' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'category', 'isPublished'],
    group: 'Материалы',
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
    { name: 'author', label: 'Автор', type: 'text' },
    publishedField,
    {
      name: 'category',
      label: 'Раздел',
      type: 'select',
      required: true,
      options: [...BOOK_CATEGORIES],
      admin: { position: 'sidebar' },
    },
    { name: 'order', label: 'Порядок', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
    { name: 'description', label: 'Описание', type: 'textarea' },
    { name: 'file', label: 'Файл книги (PDF)', type: 'upload', relationTo: 'media', required: true },
  ],
}
