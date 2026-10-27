import type { Tab } from 'payload'

import { adminOnlyField } from '../access'
import { ARABIC_STAGES, ARABIC_TASK_KINDS, ARABIC_WORD_TAGS } from '../lib/constants'

/*
 * Вкладка «Урок арабского» в уроке: словарь, грамматическая заметка, предложения, текст и задания.
 * Если заполнены слова или предложения — урок показывается как урок арабского языка
 * (плавающий словарь, подсказки к словам, этапы огласовки, задания с проверкой).
 * Арабский текст вводится всегда с полной огласовкой: снять её на поздних уроках сайт умеет сам.
 */

const rtl = true

export const ArabicLessonTab: Tab = {
  label: 'Урок арабского',
  description:
    'Для курса арабского языка. Арабский текст пишите с полной огласовкой — на уроках 51–85 сайт сам оставит огласовку только на окончаниях, с урока 86 снимет её (ученик может включить её кнопкой).',
  fields: [
    {
      name: 'arabic',
      label: false,
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'stage',
              label: 'Огласовка в уроке',
              type: 'select',
              defaultValue: 'auto',
              options: ARABIC_STAGES.map(({ label, value }) => ({ label, value })),
              admin: { width: '50%' },
            },
            {
              name: 'isReview',
              label: 'Обобщающий урок (каждый 10-й): большой текст и контрольный тест во вкладке «Тест»',
              type: 'checkbox',
              defaultValue: false,
              admin: { width: '50%', style: { alignSelf: 'center' } },
            },
          ],
        },
        {
          name: 'words',
          label: 'Словарь урока (10–12 слов)',
          labels: { singular: 'Слово', plural: 'Слова' },
          type: 'array',
          admin: {
            initCollapsed: true,
            description: 'Слова попадают в словарь курса, в подсказки над словами в следующих уроках и в карточки.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'word', label: 'Слово (с огласовкой)', type: 'text', required: true, admin: { rtl, width: '34%' } },
                { name: 'translation', label: 'Перевод', type: 'text', required: true, admin: { width: '40%' } },
                { name: 'root', label: 'Корень', type: 'text', admin: { rtl, width: '26%', placeholder: 'ك ت ب' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'plural', label: 'Мн. число (для имён)', type: 'text', admin: { rtl, width: '25%' } },
                { name: 'past', label: 'Маади (для глаголов)', type: 'text', admin: { rtl, width: '25%' } },
                { name: 'present', label: 'Мудари‘', type: 'text', admin: { rtl, width: '25%' } },
                { name: 'masdar', label: 'Масдар', type: 'text', admin: { rtl, width: '25%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'tag',
                  label: 'Пометка',
                  type: 'select',
                  options: ARABIC_WORD_TAGS.map(({ label, value }) => ({ label, value })),
                  admin: { width: '25%' },
                },
                { name: 'theme', label: 'Тема', type: 'text', admin: { width: '25%', placeholder: 'Учёба' } },
                {
                  name: 'forms',
                  label: 'Другие формы (через запятую)',
                  type: 'text',
                  admin: {
                    rtl,
                    width: '50%',
                    description: 'Например, женский род или формы спряжения — чтобы подсказка узнавала слово и в них.',
                  },
                },
              ],
            },
            {
              name: 'image',
              label: 'Картинка к слову',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { mimeType: { contains: 'image' } },
            },
            { name: 'note', label: 'Примечание (необязательно)', type: 'text' },
          ],
        },
        {
          type: 'collapsible',
          label: 'Грамматическая заметка',
          fields: [
            { name: 'grammarTitle', label: 'Тема заметки', type: 'text', admin: { placeholder: 'Указательные местоимения هذا и هذه' } },
            {
              name: 'grammar',
              label: 'Текст заметки (1–2 абзаца)',
              type: 'textarea',
              admin: { description: 'Абзацы разделяйте пустой строкой. Жирный шрифт: **слова в двух звёздочках**.' },
            },
            {
              name: 'grammarExamples',
              label: 'Примеры (2–3)',
              labels: { singular: 'Пример', plural: 'Примеры' },
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'arabic', label: 'По-арабски', type: 'text', required: true, admin: { rtl, width: '50%' } },
                    { name: 'translation', label: 'Перевод', type: 'text', admin: { width: '50%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'sentences',
          label: 'Предложения (12–20, от простых к сложным)',
          labels: { singular: 'Предложение', plural: 'Предложения' },
          type: 'array',
          admin: { description: 'Перевод ученик видит в «Ключах» и по кнопке у предложения.' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'arabic', label: 'По-арабски', type: 'text', required: true, admin: { rtl, width: '50%' } },
                { name: 'translation', label: 'Перевод', type: 'text', admin: { width: '50%' } },
              ],
            },
          ],
        },
        {
          type: 'collapsible',
          label: 'Текст (с урока ~10)',
          fields: [
            { name: 'textTitle', label: 'Заголовок текста', type: 'text', admin: { rtl } },
            { name: 'text', label: 'Текст по-арабски', type: 'textarea', admin: { rtl, description: 'Абзацы разделяйте пустой строкой.' } },
            { name: 'textTranslation', label: 'Перевод текста (для «Ключей»)', type: 'textarea' },
            { name: 'textSource', label: 'Источник (для отрывков из книг)', type: 'text', admin: { placeholder: 'ан-Навави, «Сорок хадисов», № 1' } },
          ],
        },
        {
          name: 'tasks',
          label: 'Задания (12–16)',
          labels: { singular: 'Задание', plural: 'Задания' },
          type: 'array',
          admin: {
            description:
              'Ученик выполняет задания по одному и сразу видит, верно ли. Если во вкладке «Тест» нет вопросов, задания и есть тест урока: от проходного балла урок засчитывается. Ответы ученику не видны, пока он не ответит.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'kind',
                  label: 'Вид задания',
                  type: 'select',
                  required: true,
                  defaultValue: 'choice',
                  options: ARABIC_TASK_KINDS.map(({ label, value }) => ({ label, value })),
                  admin: { width: '40%' },
                },
                {
                  name: 'prompt',
                  label: 'Задание',
                  type: 'text',
                  required: true,
                  admin: { width: '60%', placeholder: 'Переведите на русский' },
                },
              ],
            },
            {
              name: 'material',
              label: 'Что дано ученику (арабский или русский текст)',
              type: 'textarea',
              admin: {
                description:
                  'Слово, предложение или вопрос. Для «Расставить огласовку» оставьте пустым: сайт снимет огласовку с ответа сам. Для «Собрать предложение» — пусто или русский перевод.',
              },
            },
            {
              name: 'options',
              label: 'Варианты (для «Выбрать ответ»)',
              labels: { singular: 'Вариант', plural: 'Варианты' },
              type: 'array',
              maxRows: 6,
              admin: { condition: (_, row) => row?.kind === 'choice' },
              fields: [{ name: 'text', label: 'Вариант', type: 'text', required: true }],
            },
            {
              name: 'correct',
              label: 'Номер верного варианта (1, 2, 3…)',
              type: 'number',
              min: 1,
              max: 6,
              access: { read: adminOnlyField },
              admin: { condition: (_, row) => row?.kind === 'choice' },
            },
            {
              name: 'pairs',
              label: 'Пары (для «Соединить пары»)',
              labels: { singular: 'Пара', plural: 'Пары' },
              type: 'array',
              maxRows: 8,
              admin: { condition: (_, row) => row?.kind === 'match' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'left', label: 'Слева', type: 'text', required: true, admin: { width: '50%' } },
                    // Какая пара верна — знает только сервер; ученику правый столбец приходит перемешанным
                    { name: 'right', label: 'Справа', type: 'text', required: true, access: { read: adminOnlyField }, admin: { width: '50%' } },
                  ],
                },
              ],
            },
            {
              name: 'answer',
              label: 'Ответ (ключ)',
              type: 'textarea',
              access: { read: adminOnlyField },
              admin: {
                condition: (_, row) => row?.kind !== 'choice' && row?.kind !== 'match',
                description:
                  '«Вписать ответ»: несколько верных ответов — каждый с новой строки. «Собрать предложение»: верное предложение. Перевод, и‘раб, огласовка: ключ, с которым ученик сверит себя.',
              },
            },
            {
              name: 'explanation',
              label: 'Пояснение после ответа (необязательно)',
              type: 'textarea',
              access: { read: adminOnlyField },
            },
          ],
        },
      ],
    },
  ],
}
