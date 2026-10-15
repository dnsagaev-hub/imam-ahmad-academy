import type { CollectionConfig } from 'payload'

import { adminOnly, publishedOrAdmin } from '../access'
import { publishedField } from '../fields/published'
import { slugField } from '../fields/slug'
import { ARTICLE_CATEGORIES } from '../lib/constants'

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Статья', plural: 'Статьи и вопросы' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'kind', 'publishedAt', 'isPublished'],
    group: 'Материалы',
  },
  defaultSort: '-publishedAt',
  access: {
    read: publishedOrAdmin,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'title', label: 'Заголовок', type: 'text', required: true },
    slugField(),
    publishedField,
    {
      name: 'category',
      label: 'Рубрика',
      type: 'select',
      required: true,
      options: [...ARTICLE_CATEGORIES],
      admin: { position: 'sidebar' },
    },
    {
      name: 'kind',
      label: 'Тип',
      type: 'select',
      defaultValue: 'article',
      options: [
        { label: 'Статья', value: 'article' },
        { label: 'Разбор вопроса', value: 'question' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      label: 'Дата публикации',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { displayFormat: 'dd.MM.yyyy' } },
    },
    { name: 'excerpt', label: 'Краткое описание (для карточки)', type: 'textarea', required: true },
    { name: 'content', label: 'Текст статьи', type: 'richText', required: true },
  ],
}
