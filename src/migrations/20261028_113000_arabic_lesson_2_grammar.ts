import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { updateArabicGrammar } from '../seed/arabicLessons'

// Новый текст грамматики урока 2 из учебника владельца (задача 50, просьба владельца 28.10.2026).
// Меняются только тема, текст и примеры грамматической заметки урока 2; структура базы не меняется.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await updateArabicGrammar(payload, 'arabskiy-urok-2', req)
}

// Откат не трогает материалы владельца
export async function down(_args: MigrateDownArgs): Promise<void> {}
