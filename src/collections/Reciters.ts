import type { CollectionConfig } from 'payload'

import { adminOnly, publishedOrAdmin } from '../access'
import { publishedField } from '../fields/published'

/**
 * Чтецы Корана для вкладки «Слушать». Записи — по ссылке на папку в интернете
 * (файлы 001.mp3 … 114.mp3) или свои MP3, по одному на суру.
 */
export const Reciters: CollectionConfig = {
  slug: 'reciters',
  labels: { singular: 'Чтец', plural: 'Чтецы' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'source', 'order', 'isPublished'],
    group: 'Коран',
    description: 'Чтецы во вкладке «Слушать» на странице суры. Порядок — по полю «Порядок».',
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
        { name: 'name', label: 'Имя (русский)', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'nameAr', label: 'Имя (арабский)', type: 'text', admin: { width: '50%' } },
      ],
    },
    publishedField,
    { name: 'order', label: 'Порядок', type: 'number', defaultValue: 100, admin: { position: 'sidebar', description: 'Меньше — выше в списке' } },
    {
      name: 'source',
      label: 'Откуда записи',
      type: 'radio',
      required: true,
      defaultValue: 'link',
      options: [
        { label: 'Ссылка на папку с записями всех сур', value: 'link' },
        { label: 'Свои файлы MP3 по сурам', value: 'files' },
      ],
    },
    {
      name: 'baseUrl',
      label: 'Адрес папки с записями',
      type: 'text',
      admin: {
        condition: (_, s) => s?.source === 'link',
        description: 'Адрес, к которому дописывается номер суры: 001.mp3, 002.mp3 … 114.mp3. Например: https://server8.mp3quran.net/afs/',
      },
      validate: (v: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
        siblingData?.source !== 'link' || /^https?:\/\/\S+\/$/.test(String(v ?? '')) || 'Укажите адрес папки, начинается с https:// и заканчивается на «/»',
    },
    {
      name: 'files',
      label: 'Записи сур',
      labels: { singular: 'Запись суры', plural: 'Записи сур' },
      type: 'array',
      admin: { condition: (_, s) => s?.source === 'files', description: 'Сура без записи у этого чтеца просто не показывает его в списке.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'surah', label: 'Номер суры', type: 'number', required: true, min: 1, max: 114, admin: { width: '30%' } },
            { name: 'audio', label: 'Файл MP3', type: 'upload', relationTo: 'media', required: true, admin: { width: '70%' } },
          ],
        },
      ],
    },
  ],
}
