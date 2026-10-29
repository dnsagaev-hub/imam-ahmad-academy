import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { installArabicLessons } from '../seed/arabicLessons'

// Урок 11 авторского учебника арабского (задача 50) с картинками и тестом владельца — первый урок модуля 2: создаётся, если его ещё нет, и ставится
// в курс Тамхиди «Арабский язык» в новый модуль 2; модуль 1 переименовывается в «уроки 1–10», если владелец не менял его название. Структура базы не меняется.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await installArabicLessons(payload, req)
}

// Откат не удаляет материалы владельца: урок можно скрыть или удалить в админке
export async function down(_args: MigrateDownArgs): Promise<void> {}
