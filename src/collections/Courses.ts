import type { CollectionConfig } from 'payload'

import { adminOnly, publishedOrAdmin } from '../access'
import { publishedField } from '../fields/published'
import { slugField } from '../fields/slug'
import { COURSE_LEVELS } from '../lib/constants'

export const Courses: CollectionConfig = {
  slug: 'courses',
  labels: { singular: 'Курс', plural: 'Курсы' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'level', 'order', 'isPublished'],
    group: 'Обучение',
    description:
      'Курс состоит из модулей, модуль — из уроков. Ученик проходит уроки по порядку: следующий открывается после сдачи теста.',
  },
  defaultSort: 'order',
  access: {
    read: publishedOrAdmin,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'title', label: 'Название курса', type: 'text', required: true },
    slugField(),
    publishedField,
    {
      name: 'level',
      label: 'Уровень',
      type: 'select',
      required: true,
      defaultValue: 'beginner',
      options: [...COURSE_LEVELS],
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      label: 'Порядок в списке',
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar', description: 'Чем меньше число, тем выше курс в списке' },
    },
    {
      type: 'row',
      fields: [
        { name: 'bookTitleAr', label: 'Название книги (арабский)', type: 'text', admin: { width: '50%' } },
        { name: 'bookAuthor', label: 'Автор книги', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      name: 'book',
      label: 'Книга из библиотеки',
      type: 'relationship',
      relationTo: 'books',
      admin: { description: 'Тогда на странице книги появится ссылка на этот курс' },
    },
    { name: 'description', label: 'Краткое описание', type: 'textarea', required: true },
    {
      type: 'row',
      fields: [
        { name: 'teacher', label: 'Преподаватель', type: 'text', admin: { width: '50%' } },
        { name: 'duration', label: 'Длительность (например, «≈ 20 часов»)', type: 'text', admin: { width: '50%' } },
      ],
    },
    { name: 'teacherBio', label: 'О преподавателе', type: 'textarea' },
    { name: 'teacherPhoto', label: 'Фото преподавателя', type: 'upload', relationTo: 'media' },
    {
      name: 'modules',
      label: 'Модули курса',
      labels: { singular: 'Модуль', plural: 'Модули' },
      type: 'array',
      minRows: 1,
      admin: {
        description: 'Порядок модулей и уроков внутри них = порядок прохождения. Перетаскивайте, чтобы поменять.',
      },
      fields: [
        { name: 'title', label: 'Название модуля', type: 'text', required: true },
        {
          name: 'lessons',
          label: 'Уроки модуля (по порядку)',
          type: 'relationship',
          relationTo: 'lessons',
          hasMany: true,
        },
      ],
    },
    {
      name: 'materials',
      label: 'Материалы курса',
      labels: { singular: 'Материал', plural: 'Материалы' },
      type: 'array',
      fields: [
        { name: 'label', label: 'Название', type: 'text', required: true },
        { name: 'file', label: 'Файл', type: 'upload', relationTo: 'media', required: true },
      ],
    },
  ],
}
