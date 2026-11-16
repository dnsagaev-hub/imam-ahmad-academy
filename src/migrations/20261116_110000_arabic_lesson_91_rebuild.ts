import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { replaceArabicLesson } from '../seed/arabicLessons'

// Урок 91 пересобран по новому документу владельца (задача 50): слова, предложения, тексты, упражнения и тест.
// Заменяется только если урок в базе ещё в прежнем виде; правки владельца не затираются. Структура базы не меняется.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await replaceArabicLesson(
    payload,
    'arabskiy-urok-91',
    'После урока студент различает иснад и матн, читает формулы передачи хадиса, определяет падежи имён передатчиков, раскрывает сокращения и узнаёт марфу‘, маукуф и макту‘.',
    req,
  )
}

// Откат не удаляет материалы владельца
export async function down(_args: MigrateDownArgs): Promise<void> {}
