import type { CollectionConfig } from 'payload'

import { adminOnly, adminOnlyField, publishedOrAdmin } from '../access'
import { publishedField } from '../fields/published'
import { slugField } from '../fields/slug'
import { LESSON_CATEGORIES } from '../lib/constants'

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  labels: { singular: 'Урок', plural: 'Уроки' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'isPublished', 'updatedAt'],
    group: 'Обучение',
    description:
      'Урок может входить в курс (добавьте его в модуль на странице курса) или быть отдельным аудио/видеоуроком.',
  },
  access: {
    read: publishedOrAdmin,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'title', label: 'Название урока', type: 'text', required: true },
    slugField(),
    publishedField,
    {
      name: 'category',
      label: 'Раздел',
      type: 'select',
      required: true,
      defaultValue: 'fiqh',
      options: [...LESSON_CATEGORIES],
      admin: { position: 'sidebar', description: 'В какой рубрике показывать урок (аудио, видео, текстовые уроки)' },
    },
    {
      name: 'duration',
      label: 'Длительность',
      type: 'text',
      admin: { position: 'sidebar', placeholder: '46:20' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Видео и аудио',
          fields: [
            {
              name: 'videoUrl',
              label: 'Ссылка на видео для встраивания',
              type: 'text',
              admin: {
                description:
                  'Kinescope: https://kinescope.io/embed/… · VK Видео: https://vk.com/video_ext.php?… · Rutube: https://rutube.ru/play/embed/…',
              },
            },
            { name: 'audio', label: 'Аудиофайл (MP3)', type: 'upload', relationTo: 'media' },
            {
              name: 'thumbnail',
              label: 'Обложка видео (картинка 16:9)',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Если не загрузить, обложка нарисуется сама — зелёная, с названием рубрики.' },
            },
            { name: 'teacher', label: 'Преподаватель', type: 'text' },
          ],
        },
        {
          label: 'Текст урока',
          description: 'Заполните, если это текстовый урок — тогда он появится в разделе «Текстовые уроки».',
          fields: [
            {
              name: 'excerpt',
              label: 'Краткое описание (для карточки в списке)',
              type: 'textarea',
            },
            {
              name: 'body',
              label: 'Текст урока',
              type: 'richText',
            },
          ],
        },
        {
          label: 'Конспект',
          fields: [
            { name: 'definitionAr', label: 'Ключевой текст на арабском', type: 'textarea' },
            { name: 'definitionRu', label: 'Перевод ключевого текста', type: 'textarea' },
            { name: 'summary', label: 'Конспект урока', type: 'richText' },
            {
              name: 'files',
              label: 'Файлы урока',
              labels: { singular: 'Файл', plural: 'Файлы' },
              type: 'array',
              fields: [
                { name: 'label', label: 'Название', type: 'text', required: true },
                { name: 'file', label: 'Файл', type: 'upload', relationTo: 'media', required: true },
              ],
            },
          ],
        },
        {
          label: 'Тест',
          description: 'Если вопросов нет, урок считается пройденным после просмотра (кнопка «Отметить пройденным»).',
          fields: [
            {
              name: 'passingScore',
              label: 'Проходной балл, %',
              type: 'number',
              defaultValue: 70,
              min: 0,
              max: 100,
            },
            {
              name: 'questions',
              label: 'Вопросы теста',
              labels: { singular: 'Вопрос', plural: 'Вопросы' },
              type: 'array',
              fields: [
                { name: 'question', label: 'Вопрос', type: 'textarea', required: true },
                {
                  name: 'options',
                  label: 'Варианты ответа',
                  labels: { singular: 'Вариант', plural: 'Варианты' },
                  type: 'array',
                  minRows: 2,
                  maxRows: 6,
                  fields: [{ name: 'text', label: 'Текст варианта', type: 'text', required: true }],
                },
                {
                  name: 'correct',
                  label: 'Номер верного варианта (1, 2, 3…)',
                  type: 'number',
                  required: true,
                  min: 1,
                  max: 6,
                  // Верный ответ никогда не уходит в браузер ученика
                  access: { read: adminOnlyField },
                },
                {
                  name: 'explanation',
                  label: 'Пояснение (показывается после ответа)',
                  type: 'textarea',
                  access: { read: adminOnlyField },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
