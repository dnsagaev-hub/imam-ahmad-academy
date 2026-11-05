import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Задача 55: поля курса «Дополнительный курс к», «Уровень (подпись)», «Планируется уроков». Только новые столбцы.
// Имя с датой 27.10, чтобы на новой базе столбцы появились раньше миграций уроков арабского, которые читают курсы;
// на базе владельца миграция просто выполнится как ещё не выполненная.

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" ADD COLUMN "parent_course_id" integer;
  ALTER TABLE "courses" ADD COLUMN "level_note" varchar;
  ALTER TABLE "courses" ADD COLUMN "planned_lessons" varchar;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_parent_course_id_courses_id_fk" FOREIGN KEY ("parent_course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "courses_parent_course_idx" ON "courses" USING btree ("parent_course_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" DROP CONSTRAINT "courses_parent_course_id_courses_id_fk";
  
  DROP INDEX "courses_parent_course_idx";
  ALTER TABLE "courses" DROP COLUMN "parent_course_id";
  ALTER TABLE "courses" DROP COLUMN "level_note";
  ALTER TABLE "courses" DROP COLUMN "planned_lessons";`)
}
