import type { CollectionConfig } from 'payload'

import { toEmbedUrl } from '../lib/video'

import { adminOnly, adminOnlyField, publishedOrAdmin } from '../access'
import { publishedField } from '../fields/published'
import { slugField } from '../fields/slug'
import { LESSON_BLOCKS } from '../blocks/lessonBlocks'
import { LESSON_CATEGORIES } from '../lib/constants'
import { ArabicLessonTab } from './arabicLesson'

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  labels: { singular: 'Урок', plural: 'Уроки' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'book', 'isPublished', 'updatedAt'],
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
  hooks: {
    beforeChange: [
      // Отметка «текстовый урок» и примерное время чтения (≈180 слов в минуту)
      ({ data, originalDoc }) => {
        const content = data?.content ?? originalDoc?.content
        const body = data?.body ?? originalDoc?.body
        const blocks = Array.isArray(content) ? content : []
        const hasBody = Boolean(body?.root?.children?.length)
        data.isText = blocks.length > 0 || hasBody
        const words = JSON.stringify(blocks).split(/\s+/).length + (hasBody ? JSON.stringify(body).split(/\s+/).length / 3 : 0)
        data.readingMinutes = data.isText ? Math.max(1, Math.round(words / 180)) : null
        // Обычную ссылку на видео сразу превращаем в ссылку для встраивания
        if (typeof data.videoUrl === 'string' && data.videoUrl.trim()) {
          data.videoUrl = toEmbedUrl(data.videoUrl) ?? data.videoUrl.trim()
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'title', label: 'Название урока', type: 'text', required: true },
    slugField(),
    publishedField,
    {
      name: 'isText',
      type: 'checkbox',
      defaultValue: false,
      admin: { hidden: true },
    },
    {
      name: 'readingMinutes',
      type: 'number',
      admin: { hidden: true },
    },
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
      name: 'book',
      label: 'Книга',
      type: 'relationship',
      relationTo: 'books',
      admin: {
        position: 'sidebar',
        description:
          'По какой книге урок. В разделах уроков он появится под обложкой этой книги. Если пусто, а урок входит в курс, — берётся первая книга курса',
      },
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
              label: 'Ссылка на видео',
              type: 'text',
              admin: {
                description:
                  'Вставьте обычную ссылку на видео из адресной строки — VK Видео, Rutube, YouTube или Kinescope. Сайт сам превратит её в нужный вид при сохранении.',
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
          description:
            'Заполните, если это текстовый урок — тогда он появится в разделе «Текстовые уроки». Урок собирается из блоков: текст книги (арабский + перевод), пояснение, термины, пометка, итоги.',
          fields: [
            {
              name: 'excerpt',
              label: 'Краткое описание (для карточки в списке)',
              type: 'textarea',
            },
            {
              name: 'sourceRef',
              label: 'Источник урока',
              type: 'text',
              admin: { placeholder: 'Ибн Бальбан, «Ахсар аль-Мухтасарат», ред. М. Н. аль-Аджми, т. 1, с. 86–88' },
            },
            {
              name: 'content',
              label: 'Блоки урока',
              type: 'blocks',
              blocks: LESSON_BLOCKS,
            },
            {
              name: 'body',
              label: 'Свободный текст (если блоки не нужны)',
              type: 'richText',
            },
          ],
        },
        ArabicLessonTab,
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
