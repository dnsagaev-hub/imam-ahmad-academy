import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { installArabicLessons } from '../seed/arabicLessons'

// Исправление: урок 86 попал в модуль «Язык науки», уроки 87–90 — в «Язык фикха». Два модуля 7 объединяются
// в один, уроки остаются на месте. Структура базы не меняется.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await installArabicLessons(payload, req)
}

// Откат не нужен: модули можно поправить в админке
export async function down(_args: MigrateDownArgs): Promise<void> {}
