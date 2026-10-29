import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Задача 51 (29.10.2026): столбец «Своя запись произношения» у слов урока арабского.
// Дата в имени — сразу после создания таблицы слов: следующие миграции ставят уроки через API Payload, а он уже
// читает этот столбец, поэтому на новой базе (CI, хостинг) столбец должен появиться раньше них. На базе владельца,
// где те миграции уже прошли, Payload выполнит эту по имени как ещё не выполненную.
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
