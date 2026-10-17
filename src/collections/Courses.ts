import type { CollectionConfig } from 'payload'

import { adminOnly, publishedOrAdmin } from '../access'
import { publishedField } from '../fields/published'
import { slugField } from '../fields/slug'
import { COURSE_LEVELS, COURSE_STATUSES, DISCIPLINES } from '../lib/constants'

export const Courses: CollectionConfig = {
  slug: 'courses',
  labels: { singular: 'Курс', plural: 'Курсы' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'level', 'discipline', 'order', 'isPublished'],
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
      label: 'Ступень',
      type: 'select',
      required: true,
      defaultValue: 'prep',
      options: COURSE_LEVELS.map(({ label, value }) => ({ label, value })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'discipline',
      label: 'Дисциплина',
      type: 'select',
      options: DISCIPLINES.map(({ label, value }) => ({ label, value })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      label: 'Статус в программе',
      type: 'select',
      defaultValue: 'approved',
      options: COURSE_STATUSES.map(({ label, value }) => ({ label, value })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      label: 'Номер в ступени',
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar', description: 'Номер дисциплины в программе ступени (01, 02…)' },
    },
    {
      type: 'row',
      fields: [
        { name: 'bookTitleAr', label: 'Название книги (арабский)', type: 'text', admin: { width: '50%' } },
        { name: 'bookAuthor', label: 'Автор книги', type: 'text', admin: { width: '50%' } },
      ],
    },
    // Старое поле (одна книга) — оставлено, чтобы не терять данные при обновлении базы; заменено полем «Учебники»
    {
      name: 'book',
      type: 'relationship',
      relationTo: 'books',
      admin: { hidden: true },
    },
    {
      name: 'books',
      label: 'Учебники из библиотеки',
      type: 'relationship',
      relationTo: 'books',
      hasMany: true,
      admin: { description: 'Матн и шарх (или несколько учебников). На странице книги появится ссылка на курс' },
    },
    {
      name: 'scope',
      label: 'Объём изучения',
      type: 'textarea',
      admin: { description: 'Например: «Полностью», «Суры 103–114», «Избранные главы»' },
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
