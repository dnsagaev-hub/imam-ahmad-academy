import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { replaceArabicGrammarText } from '../seed/arabicLessons'

// Урок 70: «بِـ:» и пример после двоеточия сливались в одну арабскую строку, и «ба» оказывалась в конце. Отделяем пример от «بِـ».
// Меняется только этот кусок текста, и только если он в базе в прежнем виде. Структура базы не меняется.
const FROM = 'с предлогом بِـ: لَيْسَ اللّٰهُ بِغَافِلٍ (урок 59)'
const TO = 'с предлогом بِـ. Пример: لَيْسَ اللّٰهُ بِغَافِلٍ (урок 59)'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await replaceArabicGrammarText(payload, 'arabskiy-urok-70', FROM, TO, req)
}

// Откат не нужен: материалы владельца не удаляются
export async function down(_args: MigrateDownArgs): Promise<void> {}
