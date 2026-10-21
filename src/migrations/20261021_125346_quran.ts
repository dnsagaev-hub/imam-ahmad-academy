import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { DEFAULT_RECITERS } from '../lib/quran'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_reciters_source" AS ENUM('link', 'files');
  CREATE TABLE "quran_translations_ayahs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" numeric NOT NULL,
  	"text" varchar NOT NULL,
  	"comment" jsonb
  );
  
  CREATE TABLE "quran_translations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"surah" numeric NOT NULL,
  	"title" varchar,
  	"is_published" boolean DEFAULT true,
  	"translator" varchar DEFAULT 'Дэни Сагаев',
  	"basmala" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "reciters_files" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"surah" numeric,
  	"audio_id" integer
  );
  
  CREATE TABLE "reciters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"name_ar" varchar,
  	"is_published" boolean DEFAULT true,
  	"order" numeric DEFAULT 100,
  	"source" "enum_reciters_source" DEFAULT 'link' NOT NULL,
  	"base_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "quran_translations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reciters_id" integer;
  ALTER TABLE "quran_translations_ayahs" ADD CONSTRAINT "quran_translations_ayahs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quran_translations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reciters_files" ADD CONSTRAINT "reciters_files_audio_id_media_id_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reciters_files" ADD CONSTRAINT "reciters_files_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."reciters"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "quran_translations_ayahs_order_idx" ON "quran_translations_ayahs" USING btree ("_order");
  CREATE INDEX "quran_translations_ayahs_parent_id_idx" ON "quran_translations_ayahs" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "quran_translations_surah_idx" ON "quran_translations" USING btree ("surah");
  CREATE INDEX "quran_translations_updated_at_idx" ON "quran_translations" USING btree ("updated_at");
  CREATE INDEX "quran_translations_created_at_idx" ON "quran_translations" USING btree ("created_at");
  CREATE UNIQUE INDEX "quran_translations_filename_idx" ON "quran_translations" USING btree ("filename");
  CREATE INDEX "reciters_files_order_idx" ON "reciters_files" USING btree ("_order");
  CREATE INDEX "reciters_files_parent_id_idx" ON "reciters_files" USING btree ("_parent_id");
  CREATE INDEX "reciters_files_audio_idx" ON "reciters_files" USING btree ("audio_id");
  CREATE INDEX "reciters_updated_at_idx" ON "reciters" USING btree ("updated_at");
  CREATE INDEX "reciters_created_at_idx" ON "reciters" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quran_translations_fk" FOREIGN KEY ("quran_translations_id") REFERENCES "public"."quran_translations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reciters_fk" FOREIGN KEY ("reciters_id") REFERENCES "public"."reciters"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_quran_translations_id_idx" ON "payload_locked_documents_rels" USING btree ("quran_translations_id");
  CREATE INDEX "payload_locked_documents_rels_reciters_id_idx" ON "payload_locked_documents_rels" USING btree ("reciters_id");`)

  // Семь чтецов, с которыми открывается раздел «Коран»; дальше владелец правит список в админке
  for (const [i, r] of DEFAULT_RECITERS.entries()) {
    await db.execute(sql`
      INSERT INTO "reciters" ("name", "name_ar", "is_published", "order", "source", "base_url")
      VALUES (${r.name}, ${r.nameAr}, true, ${(i + 1) * 10}, 'link', ${r.baseUrl});`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "quran_translations_ayahs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quran_translations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reciters_files" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reciters" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "quran_translations_ayahs" CASCADE;
  DROP TABLE "quran_translations" CASCADE;
  DROP TABLE "reciters_files" CASCADE;
  DROP TABLE "reciters" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_quran_translations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reciters_fk";
  
  DROP INDEX "payload_locked_documents_rels_quran_translations_id_idx";
  DROP INDEX "payload_locked_documents_rels_reciters_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "quran_translations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reciters_id";
  DROP TYPE "public"."enum_reciters_source";`)
}
