import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { installArabicExtraLessons } from '../seed/arabicExtraLessons'

// Задача 57: уроки 4–15 курса «Фонетика арабского языка» (документы владельца 07.11.2026) — создаются, если их ещё нет,
// и ставятся в курс. Структура базы не меняется.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await installArabicExtraLessons(payload, req, 'arabic-dop-01-fonetika')
}

// Откат не удаляет материалы владельца: урок можно скрыть или удалить в админке
export async function down(_args: MigrateDownArgs): Promise<void> {}
