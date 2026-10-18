import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "books_volumes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"file_id" integer NOT NULL,
  	"pages" numeric
  );
  
  ALTER TABLE "settings" ADD COLUMN "starter_seeded" boolean;
  ALTER TABLE "books_volumes" ADD CONSTRAINT "books_volumes_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "books_volumes" ADD CONSTRAINT "books_volumes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "books_volumes_order_idx" ON "books_volumes" USING btree ("_order");
  CREATE INDEX "books_volumes_parent_id_idx" ON "books_volumes" USING btree ("_parent_id");
  CREATE INDEX "books_volumes_file_idx" ON "books_volumes" USING btree ("file_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "books_volumes" CASCADE;
  ALTER TABLE "settings" DROP COLUMN "starter_seeded";`)
}
