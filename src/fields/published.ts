import type { Field } from 'payload'

export const publishedField: Field = {
  name: 'isPublished',
  label: 'Опубликовано на сайте',
  type: 'checkbox',
  defaultValue: true,
  admin: {
    position: 'sidebar',
    description: 'Снимите галочку, чтобы временно скрыть с сайта',
  },
}
