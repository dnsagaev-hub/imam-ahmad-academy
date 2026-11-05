import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { installArabicExtraCourses } from '../seed/arabicExtraCourses'

// Задача 55: 12 дополнительных курсов к основному курсу арабского (список владельца 05.11.2026) — пустые, уроки
// добавляются в админке. Курс, который уже есть, не трогается. Структура базы не меняется.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await installArabicExtraCourses(payload, req)
}

// Откат не удаляет материалы владельца: курс можно скрыть или удалить в админке
export async function down(_args: MigrateDownArgs): Promise<void> {}
