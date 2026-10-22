import { APIError, type CollectionConfig } from 'payload'

import { adminOnly, publishedOrAdmin } from '../access'
import { publishedField } from '../fields/published'
import { getSurah } from '../lib/quran'

/** Пункты сведений о суре: имя поля и подпись кнопки над сурой (порядок кнопок — этот же). */
export const SURAH_INFO_PARTS = [
  { name: 'nameInfo', label: 'Название суры' },
  { name: 'goals', label: 'Цели суры' },
  { name: 'themes', label: 'Тематика суры' },
  { name: 'revelation', label: 'Место ниспослания' },
  { name: 'virtues', label: 'Хадис о достоинстве суры' },
] as const

/**
 * Общие сведения о суре: тексты владельца для кнопок в шапке страницы суры. Кнопка показывается,
 * только если её текст заполнен. Отдельно от перевода: сведения нужны и сурам без перевода.
 */
export const SurahInfo: CollectionConfig = {
  slug: 'surah-info',
  labels: { singular: 'Сведения о суре', plural: 'Сведения о сурах' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'isPublished', 'updatedAt'],
    group: 'Коран',
    description:
      'Кнопки над сурой: «Название суры», «Цели суры», «Тематика суры», «Место ниспослания», «Хадис о достоинстве суры». По нажатию текст открывается в окне. Пустой пункт на сайте не показывается.',
  },
  defaultSort: 'surah',
  access: {
    read: publishedOrAdmin,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'surah',
      label: 'Номер суры',
      type: 'number',
      required: true,
      unique: true,
      min: 1,
      max: 114,
      admin: { description: 'От 1 до 114. Для одной суры — одна запись.' },
    },
    { name: 'title', type: 'text', admin: { hidden: true } },
    publishedField,
    {
      name: 'nameInfo',
      label: 'Название суры',
      type: 'richText',
      admin: { description: 'Смысл названия, другие названия суры.' },
    },
    { name: 'goals', label: 'Цели суры', type: 'richText' },
    { name: 'themes', label: 'Тематика суры', type: 'richText' },
    {
      name: 'revelation',
      label: 'Место ниспослания',
      type: 'richText',
      admin: { description: 'Мекка или Медина; какие аяты ниспосланы в другом месте.' },
    },
    {
      name: 'virtues',
      label: 'Хадис о достоинстве суры',
      type: 'richText',
      admin: { description: 'Арабский текст хадиса из сборника, перевод, сборник и номер хадиса (например: «Передал Муслим, № 811»).' },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        const s = getSurah(Number(data.surah))
        if (!s) {
          const e = new APIError('Номер суры — от 1 до 114.', 400, undefined, true)
          e.name = 'SurahInfoError'
          throw e
        }
        data.title = `${s.n}. ${s.ru}`
        return data
      },
    ],
  },
}
