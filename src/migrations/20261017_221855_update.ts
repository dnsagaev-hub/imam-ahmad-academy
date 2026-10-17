import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_courses_discipline" AS ENUM('fiqh', 'fiqh-ibadat', 'usul', 'qawaid', 'tajwid', 'tafsir', 'hadith', 'ahkam', 'mustalah', 'aqida', 'madhhab', 'madhhab-method', 'arabic', 'nahw', 'sarf', 'balagha', 'reading', 'mantiq', 'sira', 'adab', 'adhkar', 'tazkiya');
  CREATE TYPE "public"."enum_courses_status" AS ENUM('approved', 'working', 'draft');
  ALTER TYPE "public"."enum_courses_level" ADD VALUE 'prep' BEFORE 'beginner';
  ALTER TYPE "public"."enum_books_category" ADD VALUE 'quran' BEFORE 'hadith';
  ALTER TYPE "public"."enum_books_category" ADD VALUE 'adab' BEFORE 'akhlaq';
  ALTER TYPE "public"."enum_books_category" ADD VALUE 'mantiq' BEFORE 'other';
  ALTER TYPE "public"."enum_books_level" ADD VALUE 'prep' BEFORE 'beginner';
  ALTER TABLE "courses" ALTER COLUMN "level" DROP DEFAULT;
  ALTER TABLE "courses" ADD COLUMN "discipline" "enum_courses_discipline";
  ALTER TABLE "courses" ADD COLUMN "status" "enum_courses_status" DEFAULT 'approved';
  ALTER TABLE "courses" ADD COLUMN "scope" varchar;
  ALTER TABLE "courses_rels" ADD COLUMN "books_id" integer;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "courses_rels_books_id_idx" ON "courses_rels" USING btree ("books_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses_rels" DROP CONSTRAINT "courses_rels_books_fk";
  
  ALTER TABLE "courses" ALTER COLUMN "level" SET DATA TYPE text;
  ALTER TABLE "courses" ALTER COLUMN "level" SET DEFAULT 'beginner'::text;
  DROP TYPE "public"."enum_courses_level";
  CREATE TYPE "public"."enum_courses_level" AS ENUM('beginner', 'intermediate', 'advanced');
  ALTER TABLE "courses" ALTER COLUMN "level" SET DEFAULT 'beginner'::"public"."enum_courses_level";
  ALTER TABLE "courses" ALTER COLUMN "level" SET DATA TYPE "public"."enum_courses_level" USING "level"::"public"."enum_courses_level";
  ALTER TABLE "books" ALTER COLUMN "category" SET DATA TYPE text;
  DROP TYPE "public"."enum_books_category";
  CREATE TYPE "public"."enum_books_category" AS ENUM('madhhab', 'fiqh', 'usul', 'qawaid', 'aqida', 'hadith', 'sira', 'akhlaq', 'arabic', 'other');
  ALTER TABLE "books" ALTER COLUMN "category" SET DATA TYPE "public"."enum_books_category" USING "category"::"public"."enum_books_category";
  ALTER TABLE "books" ALTER COLUMN "level" SET DATA TYPE text;
  DROP TYPE "public"."enum_books_level";
  CREATE TYPE "public"."enum_books_level" AS ENUM('beginner', 'intermediate', 'advanced', 'reference');
  ALTER TABLE "books" ALTER COLUMN "level" SET DATA TYPE "public"."enum_books_level" USING "level"::"public"."enum_books_level";
  DROP INDEX "courses_rels_books_id_idx";
  ALTER TABLE "courses" DROP COLUMN "discipline";
  ALTER TABLE "courses" DROP COLUMN "status";
  ALTER TABLE "courses" DROP COLUMN "scope";
  ALTER TABLE "courses_rels" DROP COLUMN "books_id";
  DROP TYPE "public"."enum_courses_discipline";
  DROP TYPE "public"."enum_courses_status";`)
}
