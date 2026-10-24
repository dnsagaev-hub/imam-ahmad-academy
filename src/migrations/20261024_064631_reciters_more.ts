import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Три чтеца по просьбе владельца (24.10.2026), чтение Хафса от ‘Асыма, папки mp3quran.net (114 сур).
// Разметка аятов (подсветка) на mp3quran есть только у Раада аль-Курди (ayat_timing/reads: 221).
const RECITERS = [
  ['Ахмад ас-Сувейлим', 'أحمد السويلم', 'https://cdn.mp3quran.net/audio/ahmad-suwailem/r1/'],
  ['Раад аль-Курди', 'رعد محمد الكردي', 'https://cdn.mp3quran.net/audio/raad-kurdi/r1/'],
  ['Омар аль-Дарвиз', 'عمر الدريويز', 'https://cdn.mp3quran.net/audio/omar-duraiwiz/r1/'],
]

// Короче имя, чтобы карточка чтеца была одного размера с остальными (просьба владельца); только если владелец его не менял
const HUSARY = ['Махмуд Халиль аль-Хусари', 'Махмуд аль-Хусари']

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // В конец списка чтецов; если владелец уже добавил такую папку сам — не повторяем
  for (const [name, nameAr, baseUrl] of RECITERS) {
    await db.execute(sql`
      INSERT INTO "reciters" ("name", "name_ar", "is_published", "order", "source", "base_url")
      SELECT ${name}, ${nameAr}, true, (SELECT COALESCE(MAX("order"), 0) + 10 FROM "reciters"), 'link', ${baseUrl}
      WHERE NOT EXISTS (SELECT 1 FROM "reciters" WHERE "base_url" = ${baseUrl});`)
  }
  await db.execute(sql`UPDATE "reciters" SET "name" = ${HUSARY[1]} WHERE "name" = ${HUSARY[0]};`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const [, , baseUrl] of RECITERS) await db.execute(sql`DELETE FROM "reciters" WHERE "base_url" = ${baseUrl};`)
  await db.execute(sql`UPDATE "reciters" SET "name" = ${HUSARY[0]} WHERE "name" = ${HUSARY[1]};`)
}
