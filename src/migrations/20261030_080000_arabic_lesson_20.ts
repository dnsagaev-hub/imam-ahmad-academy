import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { installArabicLessons } from '../seed/arabicLessons'

// Урок 20 (обобщающий, последний в модуле 2) авторского учебника арабского (задача 50) с картинками и тестом владельца: создаётся, если его ещё нет, и ставится
// в курс Тамхиди «Арабский язык» в модуль 2 после урока 19. Структура базы не меняется.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await installArabicLessons(payload, req)
}

// Откат не удаляет материалы владельца: урок можно скрыть или удалить в админке
export async function down(_args: MigrateDownArgs): Promise<void> {}
