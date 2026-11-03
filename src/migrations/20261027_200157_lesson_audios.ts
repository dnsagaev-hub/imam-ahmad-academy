import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Несколько аудио к уроку (поле «Ещё аудио к уроку», 03.11.2026).
// Дата в имени — сразу после таблицы слов арабского: следующие миграции ставят уроки через API Payload, а он уже
// читает эту таблицу, поэтому на новой базе (CI, хостинг) она должна появиться раньше них. На базе владельца,
// где те миграции уже прошли, Payload выполнит эту по имени как ещё не выполненную.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "lessons_audios" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"file_id" integer
  );
  
  ALTER TABLE "lessons_audios" ADD CONSTRAINT "lessons_audios_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_audios" ADD CONSTRAINT "lessons_audios_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lessons_audios_order_idx" ON "lessons_audios" USING btree ("_order");
  CREATE INDEX "lessons_audios_parent_id_idx" ON "lessons_audios" USING btree ("_parent_id");
  CREATE INDEX "lessons_audios_file_idx" ON "lessons_audios" USING btree ("file_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "lessons_audios" CASCADE;`)
}
