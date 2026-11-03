import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { replaceArabicWordRoot } from '../seed/arabicLessons'

// Слово عِشَاءٌ (урок 41): корень ع ش و, как сказал владелец 03.11.2026 (в уроке был временный корень ع ش ي).
// Меняется только если в базе ещё прежний корень. Структура базы не меняется.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await replaceArabicWordRoot(payload, 'arabskiy-urok-41', 'عِشَاءٌ', 'ع ش ي', 'ع ش و', req)
}

export async function down(_args: MigrateDownArgs): Promise<void> {}
