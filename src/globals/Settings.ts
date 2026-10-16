import type { GlobalConfig } from 'payload'

import { adminOnly } from '../access'
import { CITIES, METHODS } from '../lib/prayerTimes'

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
      type: 'collapsible',
      label: 'Дата и время намазов',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'defaultCity',
              label: 'Город по умолчанию',
              type: 'select',
              defaultValue: 'Москва',
              options: CITIES.map((c) => ({ label: c.name, value: c.name })),
              admin: { width: '33%', description: 'Пока посетитель не выбрал свой город' },
            },
            {
              name: 'prayerMethod',
              label: 'Метод расчёта по умолчанию',
              type: 'select',
              defaultValue: 'MWL',
              options: (Object.keys(METHODS) as (keyof typeof METHODS)[]).map((k) => ({ label: METHODS[k].name, value: k })),
              admin: { width: '33%' },
            },
            {
              name: 'hijriOffset',
              label: 'Поправка даты по хиджре, дней',
              type: 'number',
              defaultValue: 0,
              min: -2,
              max: 2,
              admin: { width: '33%', description: 'Если начало месяца по луне отличается от календаря Умм аль-Кура' },
            },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'contactEmail', label: 'Email для связи', type: 'email', admin: { width: '50%' } },
        { name: 'telegram', label: 'Telegram (ссылка)', type: 'text', admin: { width: '50%' } },
      ],
    },
  ],
}
