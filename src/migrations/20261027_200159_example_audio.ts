import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "lessons_arabic_example_audio" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"arabic" varchar NOT NULL,
  	"audio_id" integer NOT NULL
  );
  
  ALTER TABLE "lessons_arabic_example_audio" ADD CONSTRAINT "lessons_arabic_example_audio_audio_id_media_id_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_arabic_example_audio" ADD CONSTRAINT "lessons_arabic_example_audio_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lessons_arabic_example_audio_order_idx" ON "lessons_arabic_example_audio" USING btree ("_order");
  CREATE INDEX "lessons_arabic_example_audio_parent_id_idx" ON "lessons_arabic_example_audio" USING btree ("_parent_id");
  CREATE INDEX "lessons_arabic_example_audio_audio_idx" ON "lessons_arabic_example_audio" USING btree ("audio_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "lessons_arabic_example_audio" CASCADE;`)
}
