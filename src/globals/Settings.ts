import type { GlobalConfig } from 'payload'

import { adminOnly } from '../access'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Настройки сайта',
  admin: { group: 'Сайт' },
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'heroTitle',
      label: 'Заголовок на главной',
      type: 'text',
      defaultValue: 'Изучайте ханбалитский фикх последовательно — урок за уроком',
    },
    {
      name: 'heroText',
      label: 'Текст под заголовком',
      type: 'textarea',
      defaultValue:
        'Последовательное изучение ханбалитского мазхаба: уроки по матнам, тест после каждого занятия и личный кабинет с вашим прогрессом.',
    },
    {
      name: 'aboutTitle',
      label: 'Заголовок блока «О сайте»',
      type: 'text',
      defaultValue: 'Знание — по ступеням, как учили в мадрасах мазхаба',
    },
    { name: 'aboutText', label: 'Текст «О сайте»', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'contactEmail', label: 'Email для связи', type: 'email', admin: { width: '50%' } },
        { name: 'telegram', label: 'Telegram (ссылка)', type: 'text', admin: { width: '50%' } },
      ],
    },
  ],
}
