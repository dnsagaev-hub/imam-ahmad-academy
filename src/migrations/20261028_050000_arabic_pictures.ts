import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { installArabicLessons } from '../seed/arabicLessons'

// Картинки владельца к словам урока 1 (задача 50): ставятся только словам, у которых картинки ещё нет.
// Файлы — public/arabic; в базе появляются как файлы раздела «Файлы». Структура базы не меняется.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await installArabicLessons(payload, req)
}

// Откат не удаляет материалы владельца: урок можно скрыть или удалить в админке
export async function down(_args: MigrateDownArgs): Promise<void> {}
