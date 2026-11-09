import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { installArabicExtraLessons } from '../seed/arabicExtraLessons'

// Задача 60: уроки 1–15 курса «Арабская орфография» (документы владельца 09.11.2026) — создаются, если их ещё нет,
// и ставятся в курс. Структура базы не меняется.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await installArabicExtraLessons(payload, req, 'arabic-dop-02-orfografiya')
}

// Откат не удаляет материалы владельца: урок можно скрыть или удалить в админке
export async function down(_args: MigrateDownArgs): Promise<void> {}
