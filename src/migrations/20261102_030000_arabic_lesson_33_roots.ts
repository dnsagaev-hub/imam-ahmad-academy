import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { fillArabicRoots } from '../seed/arabicLessons'

// Урок 33: слова هِلَالٌ، نَارٌ، عَذَابٌ попали в «Служебные слова» (у них не было корня) и остались без картинок.
// Добавляем им корни, и слова встают среди обычных, с картинками. Заполненные владельцем корни не трогаются.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await fillArabicRoots(payload, 'arabskiy-urok-33', { 'هِلَالٌ': 'ه ل ل', 'نَارٌ': 'ن و ر', 'عَذَابٌ': 'ع ذ ب' }, req)
}

// Откат ничего не удаляет
export async function down(_args: MigrateDownArgs): Promise<void> {}
