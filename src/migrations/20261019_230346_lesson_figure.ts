import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "lessons_blocks_figure" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"source" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_figure" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"source" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "lessons_blocks_figure" ADD CONSTRAINT "lessons_blocks_figure_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_blocks_figure" ADD CONSTRAINT "lessons_blocks_figure_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_figure" ADD CONSTRAINT "articles_blocks_figure_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_figure" ADD CONSTRAINT "articles_blocks_figure_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lessons_blocks_figure_order_idx" ON "lessons_blocks_figure" USING btree ("_order");
  CREATE INDEX "lessons_blocks_figure_parent_id_idx" ON "lessons_blocks_figure" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_figure_path_idx" ON "lessons_blocks_figure" USING btree ("_path");
  CREATE INDEX "lessons_blocks_figure_image_idx" ON "lessons_blocks_figure" USING btree ("image_id");
  CREATE INDEX "articles_blocks_figure_order_idx" ON "articles_blocks_figure" USING btree ("_order");
  CREATE INDEX "articles_blocks_figure_parent_id_idx" ON "articles_blocks_figure" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_figure_path_idx" ON "articles_blocks_figure" USING btree ("_path");
  CREATE INDEX "articles_blocks_figure_image_idx" ON "articles_blocks_figure" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "lessons_blocks_figure" CASCADE;
  DROP TABLE "articles_blocks_figure" CASCADE;`)
}
