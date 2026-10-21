import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { ru } from '@payloadcms/translations/languages/ru'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Articles } from './collections/Articles'
import { Books } from './collections/Books'
import { Courses } from './collections/Courses'
import { Lessons } from './collections/Lessons'
import { Media } from './collections/Media'
import { Messages } from './collections/Messages'
import { QuizAttempts } from './collections/QuizAttempts'
import { QuranTranslations } from './collections/QuranTranslations'
import { Reciters } from './collections/Reciters'
import { Users } from './collections/Users'
import { Settings } from './globals/Settings'
import { migrations } from './migrations'
import { seedStarter } from './seed/starter'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const useS3 = Boolean(process.env.S3_BUCKET)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — Академия имама Ахмада',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    supportedLanguages: { ru },
    fallbackLanguage: 'ru',
  },
  collections: [Courses, Lessons, Articles, Books, Media, QuranTranslations, Reciters, Users, QuizAttempts, Messages],
  globals: [Settings],
  // Почта (письма для смены пароля). Включается, если заданы настройки SMTP.
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM || process.env.SMTP_USER || '',
        defaultFromName: 'Академия имама Ахмада',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 465),
          secure: Number(process.env.SMTP_PORT || 465) === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        },
      })
    : undefined,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // При разработке таблицы подстраиваются под код автоматически; в проверке сборки (CI) — только миграциями
    push: process.env.PAYLOAD_DB_PUSH !== 'false',
    // На хостинге (production) таблицы базы создаются и обновляются миграциями при запуске
    prodMigrations: migrations,
  }),
  plugins: useS3
    ? [
        s3Storage({
          collections: { media: true },
          bucket: process.env.S3_BUCKET || '',
          config: {
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION || 'ru-1',
            forcePathStyle: true,
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
            },
          },
        }),
      ]
    : [],
  sharp,
  // Стартовое наполнение на хостинге: включается переменной SEED_STARTER=true
  onInit: async (payload) => {
    if (process.env.SEED_STARTER === 'true') await seedStarter(payload)
  },
  upload: {
    limits: { fileSize: 300 * 1024 * 1024 }, // до 300 МБ (аудио, книги)
  },
})
