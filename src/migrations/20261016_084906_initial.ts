import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_courses_level" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum_lessons_blocks_note_kind" AS ENUM('mutamad', 'ikhtilaf', 'dalil', 'remark', 'verify');
  CREATE TYPE "public"."enum_lessons_category" AS ENUM('madhhab', 'aqida', 'fiqh', 'hadith', 'usul', 'qawaid', 'arabic', 'mustalah', 'quran', 'sira', 'akhlaq');
  CREATE TYPE "public"."enum_articles_blocks_note_kind" AS ENUM('mutamad', 'ikhtilaf', 'dalil', 'remark', 'verify');
  CREATE TYPE "public"."enum_articles_kind" AS ENUM('article', 'question');
  CREATE TYPE "public"."enum_articles_category" AS ENUM('madhhab', 'aqida', 'fiqh', 'biographies', 'usul', 'qawaid', 'ayat', 'hadith');
  CREATE TYPE "public"."enum_books_category" AS ENUM('madhhab', 'fiqh', 'usul', 'qawaid', 'aqida', 'hadith', 'sira', 'akhlaq', 'arabic', 'other');
  CREATE TYPE "public"."enum_books_kind" AS ENUM('matn', 'sharh', 'hashiya', 'reference', 'translation', 'textbook');
  CREATE TYPE "public"."enum_books_level" AS ENUM('beginner', 'intermediate', 'advanced', 'reference');
  CREATE TYPE "public"."enum_books_language" AS ENUM('ar', 'ru', 'ar-ru');
  CREATE TYPE "public"."enum_users_role" AS ENUM('student', 'admin');
  CREATE TYPE "public"."enum_messages_status" AS ENUM('new', 'answered', 'published');
  CREATE TYPE "public"."enum_settings_default_city" AS ENUM('Москва', 'Санкт-Петербург', 'Казань', 'Нижний Новгород', 'Махачкала', 'Грозный', 'Нальчик', 'Черкесск', 'Назрань', 'Астрахань', 'Уфа', 'Екатеринбург', 'Тюмень', 'Новосибирск', 'Алматы', 'Ташкент', 'Бишкек', 'Баку', 'Стамбул', 'Мекка', 'Медина');
  CREATE TYPE "public"."enum_settings_prayer_method" AS ENUM('MWL', 'Makkah', 'Egypt', 'Karachi', 'ISNA', 'North');
  CREATE TABLE "courses_modules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "courses_materials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"file_id" integer NOT NULL
  );
  
  CREATE TABLE "courses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"is_published" boolean DEFAULT true,
  	"level" "enum_courses_level" DEFAULT 'beginner' NOT NULL,
  	"order" numeric DEFAULT 10,
  	"book_title_ar" varchar,
  	"book_author" varchar,
  	"book_id" integer,
  	"description" varchar NOT NULL,
  	"teacher" varchar,
  	"duration" varchar,
  	"teacher_bio" varchar,
  	"teacher_photo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "courses_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lessons_id" integer
  );
  
  CREATE TABLE "lessons_blocks_matn" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"arabic" varchar NOT NULL,
  	"translation" varchar NOT NULL,
  	"source" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lessons_blocks_explanation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "lessons_blocks_terms_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"arabic" varchar NOT NULL,
  	"meaning" varchar NOT NULL
  );
  
  CREATE TABLE "lessons_blocks_terms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "lessons_blocks_note" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_lessons_blocks_note_kind" DEFAULT 'remark' NOT NULL,
  	"title" varchar,
  	"text" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "lessons_blocks_takeaways_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "lessons_blocks_takeaways" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "lessons_files" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"file_id" integer NOT NULL
  );
  
  CREATE TABLE "lessons_questions_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "lessons_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"correct" numeric NOT NULL,
  	"explanation" varchar
  );
  
  CREATE TABLE "lessons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"is_published" boolean DEFAULT true,
  	"is_text" boolean DEFAULT false,
  	"reading_minutes" numeric,
  	"category" "enum_lessons_category" DEFAULT 'fiqh' NOT NULL,
  	"duration" varchar,
  	"video_url" varchar,
  	"audio_id" integer,
  	"thumbnail_id" integer,
  	"teacher" varchar,
  	"excerpt" varchar,
  	"source_ref" varchar,
  	"body" jsonb,
  	"definition_ar" varchar,
  	"definition_ru" varchar,
  	"summary" jsonb,
  	"passing_score" numeric DEFAULT 70,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "articles_blocks_matn" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"arabic" varchar NOT NULL,
  	"translation" varchar NOT NULL,
  	"source" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_explanation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_terms_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"arabic" varchar NOT NULL,
  	"meaning" varchar NOT NULL
  );
  
  CREATE TABLE "articles_blocks_terms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_note" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_articles_blocks_note_kind" DEFAULT 'remark' NOT NULL,
  	"title" varchar,
  	"text" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_takeaways_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "articles_blocks_takeaways" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"is_published" boolean DEFAULT true,
  	"kind" "enum_articles_kind" DEFAULT 'article' NOT NULL,
  	"category" "enum_articles_category" NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"reading_minutes" numeric,
  	"excerpt" varchar NOT NULL,
  	"question" varchar,
  	"short_answer" varchar,
  	"source_ref" varchar,
  	"body" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "books_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "books" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"title_ar" varchar,
  	"slug" varchar,
  	"is_published" boolean DEFAULT true,
  	"author" varchar,
  	"author_ar" varchar,
  	"author_death" numeric,
  	"category" "enum_books_category" NOT NULL,
  	"kind" "enum_books_kind" DEFAULT 'matn' NOT NULL,
  	"level" "enum_books_level",
  	"language" "enum_books_language" DEFAULT 'ar',
  	"is_mutamad" boolean,
  	"order" numeric DEFAULT 10,
  	"base_book_id" integer,
  	"description" varchar NOT NULL,
  	"about" varchar,
  	"edition" varchar,
  	"pages" numeric,
  	"cover_id" integer,
  	"file_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
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
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'student' NOT NULL,
  	"notify_new_lessons" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "quiz_attempts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"lesson_id" integer NOT NULL,
  	"course_id" integer,
  	"score" numeric NOT NULL,
  	"correct_count" numeric,
  	"total_count" numeric,
  	"passed" boolean DEFAULT false,
  	"attempt" numeric,
  	"answers" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"topic" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"status" "enum_messages_status" DEFAULT 'new',
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"courses_id" integer,
  	"lessons_id" integer,
  	"articles_id" integer,
  	"books_id" integer,
  	"media_id" integer,
  	"users_id" integer,
  	"quiz_attempts_id" integer,
  	"messages_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "settings_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar NOT NULL,
  	"a" varchar NOT NULL
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar DEFAULT 'Изучайте ханбалитский фикх последовательно — урок за уроком',
  	"hero_text" varchar DEFAULT 'Последовательное изучение ханбалитского мазхаба: уроки по матнам, тест после каждого занятия и личный кабинет с вашим прогрессом.',
  	"about_title" varchar DEFAULT 'Знание — по ступеням, как учили в мадрасах мазхаба',
  	"about_text" varchar,
  	"default_city" "enum_settings_default_city" DEFAULT 'Москва',
  	"prayer_method" "enum_settings_prayer_method" DEFAULT 'MWL',
  	"hijri_offset" numeric DEFAULT 0,
  	"contact_email" varchar,
  	"telegram" varchar,
  	"telegram_channel" varchar,
  	"vk" varchar,
  	"youtube" varchar,
  	"response_time" varchar DEFAULT 'Обычно отвечаем в течение нескольких дней. На вопросы по фикху — после сверки с книгами.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "courses_modules" ADD CONSTRAINT "courses_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_materials" ADD CONSTRAINT "courses_materials_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_materials" ADD CONSTRAINT "courses_materials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_teacher_photo_id_media_id_fk" FOREIGN KEY ("teacher_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_matn" ADD CONSTRAINT "lessons_blocks_matn_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_explanation" ADD CONSTRAINT "lessons_blocks_explanation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_terms_items" ADD CONSTRAINT "lessons_blocks_terms_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons_blocks_terms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_terms" ADD CONSTRAINT "lessons_blocks_terms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_note" ADD CONSTRAINT "lessons_blocks_note_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_takeaways_items" ADD CONSTRAINT "lessons_blocks_takeaways_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons_blocks_takeaways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_blocks_takeaways" ADD CONSTRAINT "lessons_blocks_takeaways_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_files" ADD CONSTRAINT "lessons_files_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_files" ADD CONSTRAINT "lessons_files_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_questions_options" ADD CONSTRAINT "lessons_questions_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_questions" ADD CONSTRAINT "lessons_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons" ADD CONSTRAINT "lessons_audio_id_media_id_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons" ADD CONSTRAINT "lessons_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_blocks_matn" ADD CONSTRAINT "articles_blocks_matn_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_explanation" ADD CONSTRAINT "articles_blocks_explanation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_terms_items" ADD CONSTRAINT "articles_blocks_terms_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_terms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_terms" ADD CONSTRAINT "articles_blocks_terms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_note" ADD CONSTRAINT "articles_blocks_note_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_takeaways_items" ADD CONSTRAINT "articles_blocks_takeaways_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_takeaways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_takeaways" ADD CONSTRAINT "articles_blocks_takeaways_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books_links" ADD CONSTRAINT "books_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books" ADD CONSTRAINT "books_base_book_id_books_id_fk" FOREIGN KEY ("base_book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "books" ADD CONSTRAINT "books_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "books" ADD CONSTRAINT "books_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quiz_attempts_fk" FOREIGN KEY ("quiz_attempts_id") REFERENCES "public"."quiz_attempts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_messages_fk" FOREIGN KEY ("messages_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_faq" ADD CONSTRAINT "settings_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "courses_modules_order_idx" ON "courses_modules" USING btree ("_order");
  CREATE INDEX "courses_modules_parent_id_idx" ON "courses_modules" USING btree ("_parent_id");
  CREATE INDEX "courses_materials_order_idx" ON "courses_materials" USING btree ("_order");
  CREATE INDEX "courses_materials_parent_id_idx" ON "courses_materials" USING btree ("_parent_id");
  CREATE INDEX "courses_materials_file_idx" ON "courses_materials" USING btree ("file_id");
  CREATE UNIQUE INDEX "courses_slug_idx" ON "courses" USING btree ("slug");
  CREATE INDEX "courses_book_idx" ON "courses" USING btree ("book_id");
  CREATE INDEX "courses_teacher_photo_idx" ON "courses" USING btree ("teacher_photo_id");
  CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
  CREATE INDEX "courses_rels_order_idx" ON "courses_rels" USING btree ("order");
  CREATE INDEX "courses_rels_parent_idx" ON "courses_rels" USING btree ("parent_id");
  CREATE INDEX "courses_rels_path_idx" ON "courses_rels" USING btree ("path");
  CREATE INDEX "courses_rels_lessons_id_idx" ON "courses_rels" USING btree ("lessons_id");
  CREATE INDEX "lessons_blocks_matn_order_idx" ON "lessons_blocks_matn" USING btree ("_order");
  CREATE INDEX "lessons_blocks_matn_parent_id_idx" ON "lessons_blocks_matn" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_matn_path_idx" ON "lessons_blocks_matn" USING btree ("_path");
  CREATE INDEX "lessons_blocks_explanation_order_idx" ON "lessons_blocks_explanation" USING btree ("_order");
  CREATE INDEX "lessons_blocks_explanation_parent_id_idx" ON "lessons_blocks_explanation" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_explanation_path_idx" ON "lessons_blocks_explanation" USING btree ("_path");
  CREATE INDEX "lessons_blocks_terms_items_order_idx" ON "lessons_blocks_terms_items" USING btree ("_order");
  CREATE INDEX "lessons_blocks_terms_items_parent_id_idx" ON "lessons_blocks_terms_items" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_terms_order_idx" ON "lessons_blocks_terms" USING btree ("_order");
  CREATE INDEX "lessons_blocks_terms_parent_id_idx" ON "lessons_blocks_terms" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_terms_path_idx" ON "lessons_blocks_terms" USING btree ("_path");
  CREATE INDEX "lessons_blocks_note_order_idx" ON "lessons_blocks_note" USING btree ("_order");
  CREATE INDEX "lessons_blocks_note_parent_id_idx" ON "lessons_blocks_note" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_note_path_idx" ON "lessons_blocks_note" USING btree ("_path");
  CREATE INDEX "lessons_blocks_takeaways_items_order_idx" ON "lessons_blocks_takeaways_items" USING btree ("_order");
  CREATE INDEX "lessons_blocks_takeaways_items_parent_id_idx" ON "lessons_blocks_takeaways_items" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_takeaways_order_idx" ON "lessons_blocks_takeaways" USING btree ("_order");
  CREATE INDEX "lessons_blocks_takeaways_parent_id_idx" ON "lessons_blocks_takeaways" USING btree ("_parent_id");
  CREATE INDEX "lessons_blocks_takeaways_path_idx" ON "lessons_blocks_takeaways" USING btree ("_path");
  CREATE INDEX "lessons_files_order_idx" ON "lessons_files" USING btree ("_order");
  CREATE INDEX "lessons_files_parent_id_idx" ON "lessons_files" USING btree ("_parent_id");
  CREATE INDEX "lessons_files_file_idx" ON "lessons_files" USING btree ("file_id");
  CREATE INDEX "lessons_questions_options_order_idx" ON "lessons_questions_options" USING btree ("_order");
  CREATE INDEX "lessons_questions_options_parent_id_idx" ON "lessons_questions_options" USING btree ("_parent_id");
  CREATE INDEX "lessons_questions_order_idx" ON "lessons_questions" USING btree ("_order");
  CREATE INDEX "lessons_questions_parent_id_idx" ON "lessons_questions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "lessons_slug_idx" ON "lessons" USING btree ("slug");
  CREATE INDEX "lessons_audio_idx" ON "lessons" USING btree ("audio_id");
  CREATE INDEX "lessons_thumbnail_idx" ON "lessons" USING btree ("thumbnail_id");
  CREATE INDEX "lessons_updated_at_idx" ON "lessons" USING btree ("updated_at");
  CREATE INDEX "lessons_created_at_idx" ON "lessons" USING btree ("created_at");
  CREATE INDEX "articles_blocks_matn_order_idx" ON "articles_blocks_matn" USING btree ("_order");
  CREATE INDEX "articles_blocks_matn_parent_id_idx" ON "articles_blocks_matn" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_matn_path_idx" ON "articles_blocks_matn" USING btree ("_path");
  CREATE INDEX "articles_blocks_explanation_order_idx" ON "articles_blocks_explanation" USING btree ("_order");
  CREATE INDEX "articles_blocks_explanation_parent_id_idx" ON "articles_blocks_explanation" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_explanation_path_idx" ON "articles_blocks_explanation" USING btree ("_path");
  CREATE INDEX "articles_blocks_terms_items_order_idx" ON "articles_blocks_terms_items" USING btree ("_order");
  CREATE INDEX "articles_blocks_terms_items_parent_id_idx" ON "articles_blocks_terms_items" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_terms_order_idx" ON "articles_blocks_terms" USING btree ("_order");
  CREATE INDEX "articles_blocks_terms_parent_id_idx" ON "articles_blocks_terms" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_terms_path_idx" ON "articles_blocks_terms" USING btree ("_path");
  CREATE INDEX "articles_blocks_note_order_idx" ON "articles_blocks_note" USING btree ("_order");
  CREATE INDEX "articles_blocks_note_parent_id_idx" ON "articles_blocks_note" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_note_path_idx" ON "articles_blocks_note" USING btree ("_path");
  CREATE INDEX "articles_blocks_takeaways_items_order_idx" ON "articles_blocks_takeaways_items" USING btree ("_order");
  CREATE INDEX "articles_blocks_takeaways_items_parent_id_idx" ON "articles_blocks_takeaways_items" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_takeaways_order_idx" ON "articles_blocks_takeaways" USING btree ("_order");
  CREATE INDEX "articles_blocks_takeaways_parent_id_idx" ON "articles_blocks_takeaways" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_takeaways_path_idx" ON "articles_blocks_takeaways" USING btree ("_path");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "books_links_order_idx" ON "books_links" USING btree ("_order");
  CREATE INDEX "books_links_parent_id_idx" ON "books_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "books_slug_idx" ON "books" USING btree ("slug");
  CREATE INDEX "books_base_book_idx" ON "books" USING btree ("base_book_id");
  CREATE INDEX "books_cover_idx" ON "books" USING btree ("cover_id");
  CREATE INDEX "books_file_idx" ON "books" USING btree ("file_id");
  CREATE INDEX "books_updated_at_idx" ON "books" USING btree ("updated_at");
  CREATE INDEX "books_created_at_idx" ON "books" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "quiz_attempts_user_idx" ON "quiz_attempts" USING btree ("user_id");
  CREATE INDEX "quiz_attempts_lesson_idx" ON "quiz_attempts" USING btree ("lesson_id");
  CREATE INDEX "quiz_attempts_course_idx" ON "quiz_attempts" USING btree ("course_id");
  CREATE INDEX "quiz_attempts_passed_idx" ON "quiz_attempts" USING btree ("passed");
  CREATE INDEX "quiz_attempts_updated_at_idx" ON "quiz_attempts" USING btree ("updated_at");
  CREATE INDEX "quiz_attempts_created_at_idx" ON "quiz_attempts" USING btree ("created_at");
  CREATE INDEX "messages_updated_at_idx" ON "messages" USING btree ("updated_at");
  CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");
  CREATE INDEX "payload_locked_documents_rels_lessons_id_idx" ON "payload_locked_documents_rels" USING btree ("lessons_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_books_id_idx" ON "payload_locked_documents_rels" USING btree ("books_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_quiz_attempts_id_idx" ON "payload_locked_documents_rels" USING btree ("quiz_attempts_id");
  CREATE INDEX "payload_locked_documents_rels_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("messages_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "settings_faq_order_idx" ON "settings_faq" USING btree ("_order");
  CREATE INDEX "settings_faq_parent_id_idx" ON "settings_faq" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "courses_modules" CASCADE;
  DROP TABLE "courses_materials" CASCADE;
  DROP TABLE "courses" CASCADE;
  DROP TABLE "courses_rels" CASCADE;
  DROP TABLE "lessons_blocks_matn" CASCADE;
  DROP TABLE "lessons_blocks_explanation" CASCADE;
  DROP TABLE "lessons_blocks_terms_items" CASCADE;
  DROP TABLE "lessons_blocks_terms" CASCADE;
  DROP TABLE "lessons_blocks_note" CASCADE;
  DROP TABLE "lessons_blocks_takeaways_items" CASCADE;
  DROP TABLE "lessons_blocks_takeaways" CASCADE;
  DROP TABLE "lessons_files" CASCADE;
  DROP TABLE "lessons_questions_options" CASCADE;
  DROP TABLE "lessons_questions" CASCADE;
  DROP TABLE "lessons" CASCADE;
  DROP TABLE "articles_blocks_matn" CASCADE;
  DROP TABLE "articles_blocks_explanation" CASCADE;
  DROP TABLE "articles_blocks_terms_items" CASCADE;
  DROP TABLE "articles_blocks_terms" CASCADE;
  DROP TABLE "articles_blocks_note" CASCADE;
  DROP TABLE "articles_blocks_takeaways_items" CASCADE;
  DROP TABLE "articles_blocks_takeaways" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "books_links" CASCADE;
  DROP TABLE "books" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "quiz_attempts" CASCADE;
  DROP TABLE "messages" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "settings_faq" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TYPE "public"."enum_courses_level";
  DROP TYPE "public"."enum_lessons_blocks_note_kind";
  DROP TYPE "public"."enum_lessons_category";
  DROP TYPE "public"."enum_articles_blocks_note_kind";
  DROP TYPE "public"."enum_articles_kind";
  DROP TYPE "public"."enum_articles_category";
  DROP TYPE "public"."enum_books_category";
  DROP TYPE "public"."enum_books_kind";
  DROP TYPE "public"."enum_books_level";
  DROP TYPE "public"."enum_books_language";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_messages_status";
  DROP TYPE "public"."enum_settings_default_city";
  DROP TYPE "public"."enum_settings_prayer_method";`)
}
