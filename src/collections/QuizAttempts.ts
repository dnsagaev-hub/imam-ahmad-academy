import type { CollectionConfig } from 'payload'

import { adminOnly, adminOrOwn } from '../access'

/** Результаты тестов. Создаются только сервером сайта после проверки ответов. */
export const QuizAttempts: CollectionConfig = {
  slug: 'quiz-attempts',
  labels: { singular: 'Результат теста', plural: 'Результаты тестов' },
  admin: {
    defaultColumns: ['user', 'lesson', 'score', 'passed', 'createdAt'],
    group: 'Ученики',
  },
  defaultSort: '-createdAt',
  access: {
    read: adminOrOwn('user'),
    create: () => false,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'user', label: 'Ученик', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'lesson', label: 'Урок', type: 'relationship', relationTo: 'lessons', required: true, index: true },
    { name: 'course', label: 'Курс', type: 'relationship', relationTo: 'courses' },
    { name: 'score', label: 'Балл, %', type: 'number', required: true },
    { name: 'correctCount', label: 'Верных ответов', type: 'number' },
    { name: 'totalCount', label: 'Всего вопросов', type: 'number' },
    { name: 'passed', label: 'Сдан', type: 'checkbox', defaultValue: false, index: true },
    { name: 'attempt', label: 'Попытка №', type: 'number' },
    { name: 'answers', label: 'Ответы', type: 'json' },
  ],
}
