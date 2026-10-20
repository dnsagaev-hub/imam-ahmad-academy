import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "lessons_blocks_hadith" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"arabic" varchar NOT NULL,
  	"translation" varchar NOT NULL,
  	"narrator" varchar,
  	"source" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_hadith" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"arabic" varchar NOT NULL,
  	"translation" varchar NOT NULL,
  	"narrator" varchar,
  	"source" varchar NOT NULL,
  	"block_name" varchar
  );
  
  ALTER TABLE "lessons_blocks_hadith" ADD CONSTRAINT "lessons_blocks_hadith_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_hadith" ADD CONSTRAINT "articles_blocks_hadith_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lessons_blocks_hadith_order_idx" ON "lessons_blocks_hadith" USING btree ("_order");
  CREATE INDEX "lessons_blocks_hadith_parent_id_idx" ON "lessons_blocks_hadith" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_hadith_path_idx" ON "lessons_blocks_hadith" USING btree ("_path");
  CREATE INDEX "articles_blocks_hadith_order_idx" ON "articles_blocks_hadith" USING btree ("_order");
  CREATE INDEX "articles_blocks_hadith_parent_id_idx" ON "articles_blocks_hadith" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_hadith_path_idx" ON "articles_blocks_hadith" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "lessons_blocks_hadith" CASCADE;
  DROP TABLE "articles_blocks_hadith" CASCADE;`)
}
