import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "surah_info" ADD COLUMN "name_ru" varchar;
  ALTER TABLE "surah_info" ADD COLUMN "meaning" varchar;
  ALTER TABLE "surah_info" ADD COLUMN "name_ar" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "surah_info" DROP COLUMN "name_ru";
  ALTER TABLE "surah_info" DROP COLUMN "meaning";
  ALTER TABLE "surah_info" DROP COLUMN "name_ar";`)
}
