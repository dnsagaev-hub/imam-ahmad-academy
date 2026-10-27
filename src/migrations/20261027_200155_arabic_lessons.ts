import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_lessons_arabic_words_tag" AS ENUM('term', 'book', 'daily');
  CREATE TYPE "public"."enum_lessons_arabic_tasks_kind" AS ENUM('choice', 'input', 'match', 'order', 'toRu', 'toAr', 'irab', 'vowel');
  CREATE TYPE "public"."enum_lessons_arabic_stage" AS ENUM('auto', 'full', 'endings', 'none');
  CREATE TABLE "lessons_arabic_words" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"word" varchar NOT NULL,
  	"translation" varchar NOT NULL,
  	"root" varchar,
  	"plural" varchar,
  	"past" varchar,
  	"present" varchar,
  	"masdar" varchar,
  	"tag" "enum_lessons_arabic_words_tag",
  	"theme" varchar,
  	"forms" varchar,
  	"image_id" integer,
  	"note" varchar
  );
  
  CREATE TABLE "lessons_arabic_grammar_examples" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"arabic" varchar NOT NULL,
  	"translation" varchar
  );
  
  CREATE TABLE "lessons_arabic_sentences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"arabic" varchar NOT NULL,
  	"translation" varchar
  );
  
  CREATE TABLE "lessons_arabic_tasks_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "lessons_arabic_tasks_pairs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"left" varchar,
  	"right" varchar
  );
  
  CREATE TABLE "lessons_arabic_tasks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_lessons_arabic_tasks_kind" DEFAULT 'choice' NOT NULL,
  	"prompt" varchar NOT NULL,
  	"material" varchar,
  	"correct" numeric,
  	"answer" varchar,
  	"explanation" varchar
  );
  
  ALTER TABLE "lessons" ADD COLUMN "arabic_stage" "enum_lessons_arabic_stage" DEFAULT 'auto';
  ALTER TABLE "lessons" ADD COLUMN "arabic_is_review" boolean DEFAULT false;
  ALTER TABLE "lessons" ADD COLUMN "arabic_grammar_title" varchar;
  ALTER TABLE "lessons" ADD COLUMN "arabic_grammar" varchar;
  ALTER TABLE "lessons" ADD COLUMN "arabic_text_title" varchar;
  ALTER TABLE "lessons" ADD COLUMN "arabic_text" varchar;
  ALTER TABLE "lessons" ADD COLUMN "arabic_text_translation" varchar;
  ALTER TABLE "lessons" ADD COLUMN "arabic_text_source" varchar;
  ALTER TABLE "lessons_arabic_words" ADD CONSTRAINT "lessons_arabic_words_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_arabic_words" ADD CONSTRAINT "lessons_arabic_words_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_arabic_grammar_examples" ADD CONSTRAINT "lessons_arabic_grammar_examples_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_arabic_sentences" ADD CONSTRAINT "lessons_arabic_sentences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_arabic_tasks_options" ADD CONSTRAINT "lessons_arabic_tasks_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons_arabic_tasks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_arabic_tasks_pairs" ADD CONSTRAINT "lessons_arabic_tasks_pairs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons_arabic_tasks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_arabic_tasks" ADD CONSTRAINT "lessons_arabic_tasks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lessons_arabic_words_order_idx" ON "lessons_arabic_words" USING btree ("_order");
  CREATE INDEX "lessons_arabic_words_parent_id_idx" ON "lessons_arabic_words" USING btree ("_parent_id");
  CREATE INDEX "lessons_arabic_words_image_idx" ON "lessons_arabic_words" USING btree ("image_id");
  CREATE INDEX "lessons_arabic_grammar_examples_order_idx" ON "lessons_arabic_grammar_examples" USING btree ("_order");
  CREATE INDEX "lessons_arabic_grammar_examples_parent_id_idx" ON "lessons_arabic_grammar_examples" USING btree ("_parent_id");
  CREATE INDEX "lessons_arabic_sentences_order_idx" ON "lessons_arabic_sentences" USING btree ("_order");
  CREATE INDEX "lessons_arabic_sentences_parent_id_idx" ON "lessons_arabic_sentences" USING btree ("_parent_id");
  CREATE INDEX "lessons_arabic_tasks_options_order_idx" ON "lessons_arabic_tasks_options" USING btree ("_order");
  CREATE INDEX "lessons_arabic_tasks_options_parent_id_idx" ON "lessons_arabic_tasks_options" USING btree ("_parent_id");
  CREATE INDEX "lessons_arabic_tasks_pairs_order_idx" ON "lessons_arabic_tasks_pairs" USING btree ("_order");
  CREATE INDEX "lessons_arabic_tasks_pairs_parent_id_idx" ON "lessons_arabic_tasks_pairs" USING btree ("_parent_id");
  CREATE INDEX "lessons_arabic_tasks_order_idx" ON "lessons_arabic_tasks" USING btree ("_order");
  CREATE INDEX "lessons_arabic_tasks_parent_id_idx" ON "lessons_arabic_tasks" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "lessons_arabic_words" CASCADE;
  DROP TABLE "lessons_arabic_grammar_examples" CASCADE;
  DROP TABLE "lessons_arabic_sentences" CASCADE;
  DROP TABLE "lessons_arabic_tasks_options" CASCADE;
  DROP TABLE "lessons_arabic_tasks_pairs" CASCADE;
  DROP TABLE "lessons_arabic_tasks" CASCADE;
  ALTER TABLE "lessons" DROP COLUMN "arabic_stage";
  ALTER TABLE "lessons" DROP COLUMN "arabic_is_review";
  ALTER TABLE "lessons" DROP COLUMN "arabic_grammar_title";
  ALTER TABLE "lessons" DROP COLUMN "arabic_grammar";
  ALTER TABLE "lessons" DROP COLUMN "arabic_text_title";
  ALTER TABLE "lessons" DROP COLUMN "arabic_text";
  ALTER TABLE "lessons" DROP COLUMN "arabic_text_translation";
  ALTER TABLE "lessons" DROP COLUMN "arabic_text_source";
  DROP TYPE "public"."enum_lessons_arabic_words_tag";
  DROP TYPE "public"."enum_lessons_arabic_tasks_kind";
  DROP TYPE "public"."enum_lessons_arabic_stage";`)
}
