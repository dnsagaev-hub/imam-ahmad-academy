import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lessons" ADD COLUMN "book_id" integer;
  ALTER TABLE "lessons" ADD CONSTRAINT "lessons_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "lessons_book_idx" ON "lessons" USING btree ("book_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lessons" DROP CONSTRAINT "lessons_book_id_books_id_fk";
  
  DROP INDEX "lessons_book_idx";
  ALTER TABLE "lessons" DROP COLUMN "book_id";`)
}
