import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { installArabicLessons } from '../seed/arabicLessons'

// Урок 22 авторского учебника арабского (задача 50) с картинками и тестом владельца: создаётся, если его ещё нет, и ставится
// в курс Тамхиди «Арабский язык» в модуль 3 «Глагол» после урока 21. Структура базы не меняется.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await installArabicLessons(payload, req)
}

// Откат не удаляет материалы владельца: урок можно скрыть или удалить в админке
export async function down(_args: MigrateDownArgs): Promise<void> {}
