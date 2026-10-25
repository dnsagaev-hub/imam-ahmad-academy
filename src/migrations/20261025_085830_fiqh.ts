import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { randomBytes } from 'crypto'

import zad from '../data/fiqh/zad.json'

// Раздел «Фикх» (задача 46): шесть частей, 28 книг и 157 разделов «Зад аль-Мустакни‘» Мусы аль-Хаджжави с арабским
// текстом по абзацам. Текст — оцифровка «аль-Мактаба аш-Шамиля» № 11230 (ред. ‘Абд ар-Рахман аль-‘Аскар, Эр-Рияд:
// Дар аль-Ватан) из корпуса OpenITI (0968IbnAhmadAbuNajaHajjawi.ZadMustaqnic.Shamela0011230-ara1); абзацы — как
// в этом издании, сноски и номера страниц убраны. Переводы и пояснения добавляет владелец в админке.
type Zad = {
  title: string
  titleAr: string
  slug: string
  books: { title: string; titleAr: string; slug: string; chapters: { title: string; titleAr: string; topics: { from: number; title: string }[]; sentences: string[] }[] }[]
}[]
const ZAD = zad as Zad

// Номер строки списка в Payload — как у документов MongoDB: 24 шестнадцатеричных знака
const rowId = () => randomBytes(12).toString('hex')

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "fiqh_parts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"title_ar" varchar,
  	"order" numeric DEFAULT 1,
  	"slug" varchar,
  	"is_published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "fiqh_books" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"title_ar" varchar,
  	"part_id" integer NOT NULL,
  	"order" numeric DEFAULT 1,
  	"slug" varchar,
  	"is_published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "fiqh_chapters_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from" numeric NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "fiqh_chapters_sentences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"arabic" varchar NOT NULL,
  	"translation" varchar,
  	"explanation" jsonb,
  	"evidence" jsonb,
  	"other_opinion" jsonb,
  	"question" jsonb,
  	"fatwa" jsonb
  );
  
  CREATE TABLE "fiqh_chapters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"title_ar" varchar,
  	"book_id" integer NOT NULL,
  	"order" numeric NOT NULL,
  	"is_published" boolean DEFAULT true,
  	"intro" jsonb,
  	"scheme_id" integer,
  	"scheme_note" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "fiqh_parts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "fiqh_books_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "fiqh_chapters_id" integer;
  ALTER TABLE "fiqh_books" ADD CONSTRAINT "fiqh_books_part_id_fiqh_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."fiqh_parts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fiqh_chapters_topics" ADD CONSTRAINT "fiqh_chapters_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fiqh_chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fiqh_chapters_sentences" ADD CONSTRAINT "fiqh_chapters_sentences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fiqh_chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fiqh_chapters" ADD CONSTRAINT "fiqh_chapters_book_id_fiqh_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."fiqh_books"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fiqh_chapters" ADD CONSTRAINT "fiqh_chapters_scheme_id_media_id_fk" FOREIGN KEY ("scheme_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "fiqh_parts_slug_idx" ON "fiqh_parts" USING btree ("slug");
  CREATE INDEX "fiqh_parts_updated_at_idx" ON "fiqh_parts" USING btree ("updated_at");
  CREATE INDEX "fiqh_parts_created_at_idx" ON "fiqh_parts" USING btree ("created_at");
  CREATE INDEX "fiqh_books_part_idx" ON "fiqh_books" USING btree ("part_id");
  CREATE UNIQUE INDEX "fiqh_books_slug_idx" ON "fiqh_books" USING btree ("slug");
  CREATE INDEX "fiqh_books_updated_at_idx" ON "fiqh_books" USING btree ("updated_at");
  CREATE INDEX "fiqh_books_created_at_idx" ON "fiqh_books" USING btree ("created_at");
  CREATE INDEX "fiqh_chapters_topics_order_idx" ON "fiqh_chapters_topics" USING btree ("_order");
  CREATE INDEX "fiqh_chapters_topics_parent_id_idx" ON "fiqh_chapters_topics" USING btree ("_parent_id");
  CREATE INDEX "fiqh_chapters_sentences_order_idx" ON "fiqh_chapters_sentences" USING btree ("_order");
  CREATE INDEX "fiqh_chapters_sentences_parent_id_idx" ON "fiqh_chapters_sentences" USING btree ("_parent_id");
  CREATE INDEX "fiqh_chapters_book_idx" ON "fiqh_chapters" USING btree ("book_id");
  CREATE INDEX "fiqh_chapters_scheme_idx" ON "fiqh_chapters" USING btree ("scheme_id");
  CREATE INDEX "fiqh_chapters_updated_at_idx" ON "fiqh_chapters" USING btree ("updated_at");
  CREATE INDEX "fiqh_chapters_created_at_idx" ON "fiqh_chapters" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fiqh_parts_fk" FOREIGN KEY ("fiqh_parts_id") REFERENCES "public"."fiqh_parts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fiqh_books_fk" FOREIGN KEY ("fiqh_books_id") REFERENCES "public"."fiqh_books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fiqh_chapters_fk" FOREIGN KEY ("fiqh_chapters_id") REFERENCES "public"."fiqh_chapters"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_fiqh_parts_id_idx" ON "payload_locked_documents_rels" USING btree ("fiqh_parts_id");
  CREATE INDEX "payload_locked_documents_rels_fiqh_books_id_idx" ON "payload_locked_documents_rels" USING btree ("fiqh_books_id");
  CREATE INDEX "payload_locked_documents_rels_fiqh_chapters_id_idx" ON "payload_locked_documents_rels" USING btree ("fiqh_chapters_id");`)

  // Деление «Зад аль-Мустакни‘» и арабский текст по абзацам (src/data/fiqh/zad.json, задача 46)
  const rows = (r: unknown) => (r as { rows: { id: number }[] }).rows
  for (const [i, part] of ZAD.entries()) {
    const p = await db.execute(sql`
      INSERT INTO "fiqh_parts" ("title", "title_ar", "order", "slug", "is_published")
      VALUES (${part.title}, ${part.titleAr}, ${i + 1}, ${part.slug}, true) RETURNING "id";`)
    const partId = rows(p)[0].id
    for (const [j, book] of part.books.entries()) {
      const b = await db.execute(sql`
        INSERT INTO "fiqh_books" ("title", "title_ar", "part_id", "order", "slug", "is_published")
        VALUES (${book.title}, ${book.titleAr}, ${partId}, ${j + 1}, ${book.slug}, true) RETURNING "id";`)
      const bookId = rows(b)[0].id
      for (const [k, ch] of book.chapters.entries()) {
        const c = await db.execute(sql`
          INSERT INTO "fiqh_chapters" ("title", "title_ar", "book_id", "order", "is_published")
          VALUES (${ch.title}, ${ch.titleAr}, ${bookId}, ${k + 1}, true) RETURNING "id";`)
        const chId = rows(c)[0].id
        if (ch.sentences.length)
          await db.execute(sql`
            INSERT INTO "fiqh_chapters_sentences" ("_order", "_parent_id", "id", "arabic")
            VALUES ${sql.join(ch.sentences.map((ar, n) => sql`(${n + 1}, ${chId}, ${rowId()}, ${ar})`), sql`, `)};`)
        if (ch.topics.length)
          await db.execute(sql`
            INSERT INTO "fiqh_chapters_topics" ("_order", "_parent_id", "id", "from", "title")
            VALUES ${sql.join(ch.topics.map((t, n) => sql`(${n + 1}, ${chId}, ${rowId()}, ${t.from}, ${t.title})`), sql`, `)};`)
      }
    }
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "fiqh_parts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fiqh_books" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fiqh_chapters_topics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fiqh_chapters_sentences" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fiqh_chapters" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "fiqh_parts" CASCADE;
  DROP TABLE "fiqh_books" CASCADE;
  DROP TABLE "fiqh_chapters_topics" CASCADE;
  DROP TABLE "fiqh_chapters_sentences" CASCADE;
  DROP TABLE "fiqh_chapters" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_fiqh_parts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_fiqh_books_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_fiqh_chapters_fk";
  
  DROP INDEX "payload_locked_documents_rels_fiqh_parts_id_idx";
  DROP INDEX "payload_locked_documents_rels_fiqh_books_id_idx";
  DROP INDEX "payload_locked_documents_rels_fiqh_chapters_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "fiqh_parts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "fiqh_books_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "fiqh_chapters_id";`)
}
