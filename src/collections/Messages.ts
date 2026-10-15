import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access'

/** Вопросы из формы «Связаться с нами». */
export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: { singular: 'Вопрос', plural: 'Вопросы с сайта' },
  admin: {
    useAsTitle: 'topic',
    defaultColumns: ['name', 'email', 'topic', 'status', 'createdAt'],
    group: 'Ученики',
  },
  defaultSort: '-createdAt',
  access: {
    read: adminOnly,
    create: () => false, // только через форму на сайте
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'name', label: 'Имя', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'topic', label: 'Тема', type: 'text', required: true },
    { name: 'text', label: 'Вопрос', type: 'textarea', required: true },
    {
      name: 'status',
      label: 'Статус',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'Новый', value: 'new' },
        { label: 'Отвечен', value: 'answered' },
        { label: 'Опубликован разбор', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'note', label: 'Заметка для себя', type: 'textarea', admin: { position: 'sidebar' } },
  ],
}
