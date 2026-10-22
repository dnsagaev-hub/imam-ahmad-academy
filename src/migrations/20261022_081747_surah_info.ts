import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "surah_info" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"surah" numeric NOT NULL,
  	"title" varchar,
  	"is_published" boolean DEFAULT true,
  	"name_info" jsonb,
  	"goals" jsonb,
  	"themes" jsonb,
  	"revelation" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "surah_info_id" integer;
  CREATE UNIQUE INDEX "surah_info_surah_idx" ON "surah_info" USING btree ("surah");
  CREATE INDEX "surah_info_updated_at_idx" ON "surah_info" USING btree ("updated_at");
  CREATE INDEX "surah_info_created_at_idx" ON "surah_info" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_surah_info_fk" FOREIGN KEY ("surah_info_id") REFERENCES "public"."surah_info"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_surah_info_id_idx" ON "payload_locked_documents_rels" USING btree ("surah_info_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "surah_info" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "surah_info" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_surah_info_fk";
  
  DROP INDEX "payload_locked_documents_rels_surah_info_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "surah_info_id";`)
}
