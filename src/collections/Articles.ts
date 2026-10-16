import type { CollectionConfig } from 'payload'

import { adminOnly, publishedOrAdmin } from '../access'
import { LESSON_BLOCKS } from '../blocks/lessonBlocks'
import { publishedField } from '../fields/published'
import { slugField } from '../fields/slug'
import { ARTICLE_CATEGORIES } from '../lib/constants'

/**
 * Статьи и разборы вопросов.
 * Разбор вопроса = вопрос (как его задали) + краткий ответ + подробный разбор из тех же блоков,
 * что и текстовые уроки (текст книги с переводом, пояснения, термины, пометки, итоги).
 */
export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Статья / разбор', plural: 'Статьи и вопросы' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'category', 'publishedAt', 'isPublished'],
    group: 'Материалы',
  },
  defaultSort: '-publishedAt',
  access: {
    read: publishedOrAdmin,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [
      // Примерное время чтения (≈180 слов в минуту)
      ({ data, originalDoc }) => {
        const parts = [data?.question ?? originalDoc?.question, data?.shortAnswer ?? originalDoc?.shortAnswer, data?.blocks ?? originalDoc?.blocks, data?.body ?? originalDoc?.body]
        const words = JSON.stringify(parts).split(/\s+/).length
        data.readingMinutes = Math.max(1, Math.round(words / 180))
        return data
      },
    ],
  },
  fields: [
    { name: 'title', label: 'Заголовок', type: 'text', required: true },
    slugField(),
    publishedField,
    {
      name: 'kind',
      label: 'Тип',
      type: 'select',
      required: true,
      defaultValue: 'article',
      options: [
        { label: 'Статья', value: 'article' },
        { label: 'Разбор вопроса', value: 'question' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'category',
      label: 'Рубрика',
      type: 'select',
      required: true,
      options: [...ARTICLE_CATEGORIES],
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      label: 'Дата публикации',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { displayFormat: 'dd.MM.yyyy' } },
    },
    { name: 'readingMinutes', type: 'number', admin: { hidden: true } },
    { name: 'excerpt', label: 'Краткое описание (для карточки)', type: 'textarea', required: true },
    {
      name: 'question',
      label: 'Вопрос (как его задали)',
      type: 'textarea',
      admin: {
        condition: (data) => data?.kind === 'question',
        description: 'Без имён и личных подробностей спрашивающего.',
      },
    },
    {
      name: 'shortAnswer',
      label: 'Краткий ответ',
      type: 'textarea',
      admin: {
        condition: (data) => data?.kind === 'question',
        description: 'Одно-два предложения — суть ответа. Подробный разбор — в блоках ниже.',
      },
    },
    { name: 'sourceRef', label: 'Источники', type: 'text' },
    {
      name: 'blocks',
      label: 'Разбор / текст статьи (блоки)',
      type: 'blocks',
      blocks: LESSON_BLOCKS,
    },
    {
      name: 'body',
      label: 'Свободный текст (если блоки не нужны)',
      type: 'richText',
    },
  ],
}
