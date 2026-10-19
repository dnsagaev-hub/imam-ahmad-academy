import type { Block } from 'payload'

/*
 * Блоки текстового урока. Урок собирается из них в админке, как из кирпичиков:
 * отрывок книги (арабский + перевод), пояснение, термины, пометка, рисунок, итоги.
 */

export const MatnBlock: Block = {
  slug: 'matn',
  labels: { singular: 'Текст книги (арабский + перевод)', plural: 'Тексты книги' },
  fields: [
    { name: 'arabic', label: 'Арабский текст', type: 'textarea', required: true, admin: { rtl: true } },
    { name: 'translation', label: 'Перевод на русский', type: 'textarea', required: true },
    {
      name: 'source',
      label: 'Откуда (книга, страница)',
      type: 'text',
      admin: { placeholder: 'Ахсар аль-Мухтасарат, с. 87' },
    },
  ],
}

export const ExplanationBlock: Block = {
  slug: 'explanation',
  labels: { singular: 'Пояснение', plural: 'Пояснения' },
  fields: [
    { name: 'title', label: 'Подзаголовок (необязательно)', type: 'text' },
    {
      name: 'text',
      label: 'Текст пояснения',
      type: 'textarea',
      required: true,
      admin: { description: 'Абзацы разделяйте пустой строкой. Арабские слова можно писать прямо в тексте.' },
    },
  ],
}

export const TermsBlock: Block = {
  slug: 'terms',
  labels: { singular: 'Термины', plural: 'Термины' },
  fields: [
    {
      name: 'items',
      label: 'Термины',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'arabic', label: 'Термин по-арабски', type: 'text', required: true, admin: { rtl: true } },
        { name: 'meaning', label: 'Значение', type: 'textarea', required: true },
      ],
    },
  ],
}

export const NoteBlock: Block = {
  slug: 'note',
  labels: { singular: 'Пометка', plural: 'Пометки' },
  fields: [
    {
      name: 'kind',
      label: 'Вид пометки',
      type: 'select',
      required: true,
      defaultValue: 'remark',
      options: [
        { label: 'Основное мнение мазхаба (му‘тамад)', value: 'mutamad' },
        { label: 'Другое мнение / разногласие', value: 'ikhtilaf' },
        { label: 'Довод (далиль)', value: 'dalil' },
        { label: 'Замечание', value: 'remark' },
        { label: 'Сверить с источником', value: 'verify' },
      ],
    },
    { name: 'title', label: 'Заголовок (необязательно)', type: 'text' },
    { name: 'text', label: 'Текст', type: 'textarea', required: true },
  ],
}

export const TakeawaysBlock: Block = {
  slug: 'takeaways',
  labels: { singular: 'Итоги урока', plural: 'Итоги' },
  fields: [
    {
      name: 'items',
      label: 'Главное из урока',
      type: 'array',
      minRows: 1,
      fields: [{ name: 'text', label: 'Пункт', type: 'text', required: true }],
    },
  ],
}

export const FigureBlock: Block = {
  slug: 'figure',
  labels: { singular: 'Рисунок', plural: 'Рисунки' },
  fields: [
    {
      name: 'image',
      label: 'Картинка',
      type: 'upload',
      relationTo: 'media',
      // Не `required`: тогда в базе столбец без NOT NULL и картинку можно удалить из «Файлов», не ломая урок.
      validate: (value: unknown) => (value ? true : 'Выберите картинку'),
      filterOptions: { mimeType: { contains: 'image' } },
      admin: { description: 'Карта, схема, родословное древо. Загрузите новую или выберите из «Файлов».' },
    },
    { name: 'caption', label: 'Подпись под рисунком', type: 'text' },
    {
      name: 'source',
      label: 'Источник (необязательно)',
      type: 'text',
      admin: { placeholder: 'По «ар-Рахик аль-махтум», с. 201' },
    },
  ],
}

export const LESSON_BLOCKS = [MatnBlock, ExplanationBlock, TermsBlock, NoteBlock, FigureBlock, TakeawaysBlock]
