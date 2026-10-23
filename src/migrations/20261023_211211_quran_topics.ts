import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Два чтеца по просьбе владельца (23.10.2026), чтение Хафса от ‘Асыма. Папки — из списка mp3quran.net с разметкой
// аятов (ayat_timing/reads: 92 и 258), поэтому подсветка читаемого аята у них работает.
const RECITERS = [
  ['Ясир ад-Даусари', 'ياسر الدوسري', 'https://cdn.mp3quran.net/audio/yasser-dosari/r1/'],
  ['‘Абдуррашид Суфи', 'عبدالرشيد صوفي', 'https://cdn.mp3quran.net/audio/abdulrasheed-sufi/r3/'],
]

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "quran_translations_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from" numeric NOT NULL,
  	"title" varchar NOT NULL
  );
  
  ALTER TABLE "quran_translations_topics" ADD CONSTRAINT "quran_translations_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quran_translations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "quran_translations_topics_order_idx" ON "quran_translations_topics" USING btree ("_order");
  CREATE INDEX "quran_translations_topics_parent_id_idx" ON "quran_translations_topics" USING btree ("_parent_id");`)

  // В конец списка чтецов; если владелец уже добавил такую папку сам — не повторяем
  for (const [name, nameAr, baseUrl] of RECITERS) {
    await db.execute(sql`
      INSERT INTO "reciters" ("name", "name_ar", "is_published", "order", "source", "base_url")
      SELECT ${name}, ${nameAr}, true, (SELECT COALESCE(MAX("order"), 0) + 10 FROM "reciters"), 'link', ${baseUrl}
      WHERE NOT EXISTS (SELECT 1 FROM "reciters" WHERE "base_url" = ${baseUrl});`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "quran_translations_topics" CASCADE;`)
  for (const [, , baseUrl] of RECITERS) await db.execute(sql`DELETE FROM "reciters" WHERE "base_url" = ${baseUrl};`)
}
