import type { CollectionConfig } from 'payload'

import { adminOnly, anyone } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Файл', plural: 'Файлы (аудио, PDF, картинки)' },
  admin: { group: 'Материалы' },
  access: {
    read: anyone,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'alt',
      label: 'Описание файла',
      type: 'text',
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'audio/*', 'application/pdf'],
  },
}
