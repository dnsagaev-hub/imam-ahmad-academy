import type { CollectionConfig } from 'payload'

import { adminOnly, adminOnlyField, isAdminUser } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Пользователь', plural: 'Пользователи' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'createdAt'],
    group: 'Ученики',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // 30 дней
    cookies: { sameSite: 'Lax' },
    forgotPassword: {
      generateEmailSubject: () => 'Смена пароля — Академия имама Ахмада',
      generateEmailHTML: (args) => {
        const url = `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/reset/${args?.token ?? ''}`
        return `<p>Ас-саляму алейкум!</p>
<p>Чтобы задать новый пароль на сайте «Академия имама Ахмада», перейдите по ссылке:</p>
<p><a href="${url}">${url}</a></p>
<p>Если вы не запрашивали смену пароля, просто проигнорируйте это письмо.</p>`
      },
    },
  },
  access: {
    // В админку попадают только администраторы
    admin: ({ req: { user } }) => isAdminUser(user),
    // Регистрироваться может любой посетитель
    create: () => true,
    read: ({ req: { user } }) => {
      if (!user) return false
      if (isAdminUser(user)) return true
      return { id: { equals: user.id } }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (isAdminUser(user)) return true
      return { id: { equals: user.id } }
    },
    delete: adminOnly,
  },
  fields: [
    {
      name: 'name',
      label: 'Имя',
      type: 'text',
      required: true,
      maxLength: 80,
    },
    {
      name: 'role',
      label: 'Роль',
      type: 'select',
      required: true,
      defaultValue: 'student',
      options: [
        { label: 'Ученик', value: 'student' },
        { label: 'Администратор', value: 'admin' },
      ],
      saveToJWT: true,
      access: {
        // Роль может назначить только администратор
        create: adminOnlyField,
        update: adminOnlyField,
      },
      admin: { position: 'sidebar' },
    },
    {
      name: 'notifyNewLessons',
      label: 'Уведомлять о новых уроках',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  hooks: {
    beforeChange: [
      // Самый первый зарегистрированный пользователь становится администратором
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
          if (totalDocs === 0) data.role = 'admin'
          else if (!isAdminUser(req.user)) data.role = 'student'
        }
        return data
      },
    ],
  },
}
