import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "quran_translations_ayahs" ADD COLUMN "occasion" jsonb;
  ALTER TABLE "quran_translations_ayahs" ADD COLUMN "connection" jsonb;
  ALTER TABLE "quran_translations_ayahs" ADD COLUMN "reflection" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "quran_translations_ayahs" DROP COLUMN "occasion";
  ALTER TABLE "quran_translations_ayahs" DROP COLUMN "connection";
  ALTER TABLE "quran_translations_ayahs" DROP COLUMN "reflection";`)
}
