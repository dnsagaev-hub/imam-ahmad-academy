import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lessons_arabic_words" ADD COLUMN "audio_id" integer;
  ALTER TABLE "lessons_arabic_words" ADD CONSTRAINT "lessons_arabic_words_audio_id_media_id_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "lessons_arabic_words_audio_idx" ON "lessons_arabic_words" USING btree ("audio_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lessons_arabic_words" DROP CONSTRAINT "lessons_arabic_words_audio_id_media_id_fk";
  
  DROP INDEX "lessons_arabic_words_audio_idx";
  ALTER TABLE "lessons_arabic_words" DROP COLUMN "audio_id";`)
}
