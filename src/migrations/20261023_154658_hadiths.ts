import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Деление раздела «Хадисы» по книге Салиха аш-Шами «معالم السنة النبوية» (Дамаск: Дар аль-Калам, 2-е изд., 1436/2015,
// задача 37): десять «مقاصد» — темы, «كتب» — книги, «فصول» — главы. Названия — из «فهرس عام لمقاصد الكتاب»
// (т. 3, с. 513–515) и оглавлений томов (т. 1, с. 485–512; т. 2, с. 521–552; т. 3, с. 487–512), сверены по сканам книги.
// У книги без «فصول» хадисы идут подряд по «أبواب» — главы для неё не создаются. Дальше владелец правит всё в админке.
type Book = [ru: string, ar: string, slug: string, sections: string[]]
const TOPICS: [ru: string, ar: string, slug: string, books: Book[]][] = [
  ['Акыда (вероучение)', 'العقيدة', 'akyda', [
    ['Ислам и иман', 'الإسلام والإيمان', 'islam-i-iman', []],
    ['Вера в Последний день', 'الإيمان باليوم الآخر', 'vera-v-posledniy-den', [
      'أشراط الساعة|Признаки Часа',
      'صفة القيامة|Описание Дня воскресения',
      'أحاديث في الجنة والنار|Хадисы о Рае и Аде',
      'عذاب أهل النار|Наказание обитателей Ада',
      'صفة الجنة وبيان أهلها|Описание Рая и его обитателей',
    ]],
    ['Вера в предопределение', 'الإيمان بالقدر', 'vera-v-predopredelenie', []],
  ]],
  ['Знание и его источники', 'العلم ومصادره', 'znanie-i-ego-istochniki', [
    ['Знание', 'العلم', 'znanie', []],
    ['Собирание Корана и его достоинства', 'جمع القرآن وفضائله', 'sobiranie-korana', [
      'جمع القرآن الكريم|Собирание Благородного Корана',
      'فضل القرآن وتلاوته|Достоинство Корана и его чтения',
      'فضل بعض السور والآيات|Достоинство некоторых сур и аятов',
      'سجود القرآن|Земные поклоны при чтении Корана',
    ]],
    ['Толкование Корана', 'التفسير', 'tafsir', []],
    ['Следование Сунне', 'الاعتصام بالسنة', 'sledovanie-sunne', []],
  ]],
  ['Поклонение', 'العبادات', 'poklonenie', [
    ['Очищение', 'الطهارة', 'ochischenie', [
      'الطهارة من النجاسات|Очищение от нечистот',
      'الحيض|Месячные',
      'الوضوء|Малое омовение',
      'الغسل|Полное омовение',
      'التيمم|Таяммум',
    ]],
    ['Азан и времена молитв', 'الأذان ومواقيت الصلاة', 'azan-i-vremena-molitv', [
      'الأذان|Азан',
      'مواقيت الصلاة|Времена молитв',
    ]],
    ['Мечети и места для молитвы', 'المساجد ومواضع الصلاة', 'mecheti', []],
    ['Достоинство молитвы, её условия и описание', 'فضل الصلاة ومقدماتها وصفتها', 'opisanie-molitvy', [
      'فضل الصلاة ومقدماتها|Достоинство молитвы и то, что ей предшествует',
      'سترة المصلي|Сутра молящегося',
      'صفة الصلاة|Описание молитвы',
      'العمل والسهو في الصلاة|Действия и забывчивость в молитве',
    ]],
    ['Добровольные молитвы и витр', 'صلاة التطوع والوتر', 'dobrovolnye-molitvy', [
      'صلاة التطوع|Добровольные молитвы',
      'التهجد والوتر|Тахаджуд и витр',
    ]],
    ['Имамство и коллективная молитва', 'الإمامة والجماعة', 'imamstvo-i-dzhamaat', [
      'الإمامة|Имамство',
      'صلاة الجماعة|Коллективная молитва',
    ]],
    ['Пятничная и праздничные молитвы, молитвы при затмении, о дожде и в страхе', 'صلاة الجمعة والعيدين والكسوف والاستسقاء والخوف', 'dzhuma-i-prazdniki', [
      'صلاة الجمعة|Пятничная молитва',
      'صلاة العيدين|Праздничные молитвы',
      'صلاة الكسوف|Молитва при затмении',
      'صلاة الاستسقاء|Молитва о дожде',
      'صلاة الخوف|Молитва в страхе',
    ]],
    ['Сокращение и объединение молитв, положения о поездке', 'قصر الصلاة وجمعها وأحكام السفر', 'molitva-v-puti', [
      'قصر الصلاة وجمعها|Сокращение и объединение молитв',
      'أحكام السفر|Положения о поездке',
    ]],
    ['Похороны', 'الجنائز', 'pohorony', []],
    ['Закят и милостыня', 'الزكاة والصدقات', 'zakyat', [
      'الزكاة الواجبة|Обязательный закят',
      'زكاة الفطر|Закят аль-фитр',
      'الصدقات|Милостыня',
      'أحكام المسألة|Положения о просьбе подаяния',
      'أحكام الصدقة بالنسبة لآل النبي ﷺ|Милостыня и семья Пророка ﷺ',
    ]],
    ['Пост', 'الصوم', 'post', [
      'صيام رمضان|Пост в Рамадан',
      'التراويح وليلة القدر|Таравих и Ночь предопределения',
      'الاعتكاف|Итикаф',
      'صيام التطوع|Добровольный пост',
    ]],
    ['Хадж и умра', 'الحج والعمرة', 'hadzh-i-umra', [
      'أعمال الحج وأحكامه|Обряды хаджа и его положения',
      'فضائل مكة|Достоинства Мекки',
      'فضائل المدينة|Достоинства Медины',
    ]],
    ['Джихад на пути Аллаха', 'الجهاد في سبيل الله تعالى', 'dzhihad', [
      'أحكام الجهاد|Положения о джихаде',
      'أحكام الغنائم|Положения о трофеях',
      'الجزية والموادعة|Джизья и перемирие',
      'الخيل والرمي والسبق|Кони, стрельба и состязания',
    ]],
    ['Поминание Аллаха, мольба и покаяние', 'الذكر والدعاء والتوبة', 'zikr-dua-tauba', [
      'فضل الذكر|Достоинство поминания',
      'فضل الدعاء|Достоинство мольбы',
      'الاستغفار والتوبة|Просьба о прощении и покаяние',
      'في الصلاة والسلام على النبي ﷺ|Благословение Пророка ﷺ',
    ]],
    ['Клятвы и обеты', 'الأيمان والنذور', 'klyatvy-i-obety', [
      'الأيمان|Клятвы',
      'النذر|Обет',
    ]],
  ]],
  ['Положения о семье', 'أحكام الأسرة', 'polozheniya-o-seme', [
    ['Брак', 'النكاح', 'brak', [
      'أحكام النكاح|Положения о браке',
      'العشرة بين الزوجين|Совместная жизнь супругов',
      'النفقات|Содержание',
    ]],
    ['Молочное родство', 'الرضاع', 'molochnoe-rodstvo', []],
    ['Развод и положения о расставании с женой', 'الطلاق وأحكام مفارقة الزوجة', 'razvod', [
      'الطلاق والخلع والعدة|Развод, хульа и срок выжидания',
      'اللعان|Взаимное проклятие (лиан)',
      'الإيلاء|Клятва воздержания (иля)',
    ]],
    ['Положения о новорождённом', 'أحكام المولود', 'novorozhdennyy', [
      'النسب|Происхождение',
      'التسمية والعقيقة والتأديب|Имя, акыка и воспитание',
    ]],
    ['Наследство и завещания', 'الميراث والوصايا', 'nasledstvo', [
      'الفرائض|Доли наследства',
      'الوصايا والوقف|Завещания и вакф',
    ]],
    ['Благочестие и родственные связи в семье', 'البر والصلة بين أفراد الأسرة', 'rodstvennye-svyazi', []],
  ]],
  ['Насущные потребности', 'الحاجات الضرورية', 'nasuschnye-potrebnosti', [
    ['Еда и питьё', 'الطعام والشراب', 'eda-i-pite', [
      'الأطعمة وآداب الأكل|Пища и этикет еды',
      'الذبائح والصيد|Заклание и охота',
      'الأضحية|Жертвоприношение',
      'الأشربة وآداب الشرب|Напитки и этикет питья',
      'الأشربة المحرمة|Запретные напитки',
    ]],
    ['Одежда и украшения', 'اللباس والزينة', 'odezhda', []],
    ['Лечение и сновидения', 'الطب والرؤيا', 'lechenie-i-snovideniya', [
      'المرضى|Больные',
      'الطب والرقى والسحر|Лечение, рукъя и колдовство',
      'الرؤيا|Сновидения',
    ]],
    ['О домах', 'ما جاء في البيوت', 'o-domah', [
      'الاستئذان|Просьба разрешения войти',
      'بناء البيوت وفرشها وسلامتها|Постройка домов, убранство и безопасность',
      'زينة البيوت والأثاث بالصور|Украшение домов и вещи с изображениями',
      'حكم حيوانات البيوت وحشراتها|Животные и насекомые в доме',
    ]],
    ['Безопасность', 'الأمن', 'bezopasnost', []],
    ['Основные потребности, которыми не владеют частные лица', 'الحاجات الأساسية لا يمتلكها الأفراد', 'obschie-potrebnosti', []],
  ]],
  ['Взаимоотношения и сделки', 'المعاملات', 'muamalyat', [
    ['Купля-продажа', 'البيوع', 'kuplya-prodazha', []],
    ['Долг и перевод долга', 'القرض والحوالة', 'dolg', []],
    ['Издольщина и наём', 'المزارعة والإجارة', 'izdolschina-i-naem', []],
    ['Дарения и находки', 'الهبات واللقطة', 'dareniya-i-nahodki', []],
    ['Притеснения и захват чужого', 'المظالم والغصب', 'pritesneniya', []],
    ['Освобождение рабов и договор о выкупе', 'العتق والمكاتبة', 'osvobozhdenie-rabov', []],
  ]],
  ['Имамат и дела правления', 'الإمامة وشؤون الحكم', 'imamat-i-pravlenie', [
    ['Верховная власть и её положения', 'الإمامة العامة وأحكامها', 'verhovnaya-vlast', []],
    ['Суд', 'القضاء', 'sud', []],
    ['Преступления и выкуп за кровь', 'الجنايات والديات', 'prestupleniya', [
      'الجنايات والجراح|Преступления и ранения',
      'الديات|Выкуп за кровь',
    ]],
    ['Установленные наказания', 'الحدود', 'hudud', []],
  ]],
  ['Смягчение сердец, нравы и этикет', 'الرقائق والأخلاق والآداب', 'rakaik-nravy-etiket', [
    ['Смягчение сердец', 'الرقائق', 'rakaik', []],
    ['Нравы и этикет', 'الأخلاق والآداب', 'nravy-i-etiket', [
      'أحاديث جامعة|Всеобъемлющие хадисы',
      'الفضائل والأخلاق والآداب|Достоинства, нравы и этикет',
      'البر والصلة|Благочестие и родственные связи',
      'آداب اللسان وآفاته|Этикет речи и её пороки',
      'آداب السلام|Этикет приветствия',
      'ما جاء في الشعر والألفاظ واللهو|О поэзии, словах и развлечениях',
    ]],
  ]],
  ['История, жизнеописание и достоинства', 'التاريخ والسيرة والمناقب', 'istoriya-sira-manakib', [
    ['Пророки', 'الأنبياء', 'proroki', []],
    ['Благородное жизнеописание Пророка ﷺ', 'السيرة النبوية الشريفة', 'sira', [
      'الجاهلية وما قبل البعثة|Джахилийя и время до пророчества',
      'البعثة والمرحلة المكية|Пророческая миссия и мекканский период',
      'الهجرة وما بعدها|Переселение и после него',
      'غزوة بدر وما بعدها|Битва при Бадре и после неё',
      'غزوة أحد وما بعدها|Битва при Ухуде и после неё',
      'غزوة الخندق وما بعدها|Битва у Рва и после неё',
      'غزوة بني المصطلق وما بعدها|Поход на бану Мусталик и после него',
      'صلح الحديبية وما بعده|Худайбийский мир и после него',
      'غزوة خيبر وما بعدها|Хайбар и после него',
      'فتح مكة وما تبعه|Освобождение Мекки и последующее',
      'غزوة تبوك وما تبعها|Поход на Табук и последующее',
      'مرضه ﷺ ووفاته|Болезнь Пророка ﷺ и его кончина',
    ]],
    ['Благородные качества Пророка ﷺ', 'الشمائل الشريفة', 'shamail', [
      'أسماؤه ﷺ وكمال خلقه|Его имена ﷺ и совершенство облика',
      'عظيم أخلاقه ﷺ|Его великий нрав ﷺ',
      'طرف من معيشته ﷺ|О его быте ﷺ',
      'تركته وميراثه|Оставленное им и его наследство',
      'بركة النبي ﷺ|Благодать Пророка ﷺ',
      'الخصائص|Особенности Пророка ﷺ',
      'المعجزات|Чудеса',
    ]],
    ['Достоинства и заслуги', 'الفضائل والمناقب', 'dostoinstva-i-zaslugi', [
      'فضل الصحابة وفضل قرنهم|Достоинство сподвижников и их поколения',
      'فضل الأنصار|Достоинство ансаров',
      'ذكر فضائل بعض المهاجرين|Достоинства некоторых мухаджиров',
      'فضائل بعض الأنصار|Достоинства некоторых ансаров',
      'فضل بعض الصحابيات|Достоинство некоторых сподвижниц',
      'فضائل الأقوام|Достоинства племён и народов',
    ]],
  ]],
  // В «الفتن» книг нет, главы идут сразу; на сайте это одна книга с тем же названием
  ['Смуты', 'الفتن', 'smuty', [['Смуты', 'الفتن', 'fitan', []]]],
]

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "hadith_topics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"title_ar" varchar,
  	"order" numeric DEFAULT 1,
  	"slug" varchar,
  	"is_published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "hadith_books" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"title_ar" varchar,
  	"topic_id" integer NOT NULL,
  	"order" numeric DEFAULT 1,
  	"slug" varchar,
  	"is_published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "hadith_sections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"title_ar" varchar,
  	"book_id" integer NOT NULL,
  	"order" numeric DEFAULT 1,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "hadiths" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"book_id" integer NOT NULL,
  	"section_id" integer,
  	"number" numeric NOT NULL,
  	"title" varchar,
  	"is_published" boolean DEFAULT true,
  	"arabic" varchar NOT NULL,
  	"translation" varchar NOT NULL,
  	"source" jsonb,
  	"grade" jsonb,
  	"explanation" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "hadith_topics_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "hadith_books_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "hadith_sections_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "hadiths_id" integer;
  ALTER TABLE "hadith_books" ADD CONSTRAINT "hadith_books_topic_id_hadith_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."hadith_topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hadith_sections" ADD CONSTRAINT "hadith_sections_book_id_hadith_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."hadith_books"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hadiths" ADD CONSTRAINT "hadiths_book_id_hadith_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."hadith_books"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hadiths" ADD CONSTRAINT "hadiths_section_id_hadith_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."hadith_sections"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "hadith_topics_slug_idx" ON "hadith_topics" USING btree ("slug");
  CREATE INDEX "hadith_topics_updated_at_idx" ON "hadith_topics" USING btree ("updated_at");
  CREATE INDEX "hadith_topics_created_at_idx" ON "hadith_topics" USING btree ("created_at");
  CREATE INDEX "hadith_books_topic_idx" ON "hadith_books" USING btree ("topic_id");
  CREATE UNIQUE INDEX "hadith_books_slug_idx" ON "hadith_books" USING btree ("slug");
  CREATE INDEX "hadith_books_updated_at_idx" ON "hadith_books" USING btree ("updated_at");
  CREATE INDEX "hadith_books_created_at_idx" ON "hadith_books" USING btree ("created_at");
  CREATE INDEX "hadith_sections_book_idx" ON "hadith_sections" USING btree ("book_id");
  CREATE INDEX "hadith_sections_updated_at_idx" ON "hadith_sections" USING btree ("updated_at");
  CREATE INDEX "hadith_sections_created_at_idx" ON "hadith_sections" USING btree ("created_at");
  CREATE INDEX "hadiths_book_idx" ON "hadiths" USING btree ("book_id");
  CREATE INDEX "hadiths_section_idx" ON "hadiths" USING btree ("section_id");
  CREATE INDEX "hadiths_updated_at_idx" ON "hadiths" USING btree ("updated_at");
  CREATE INDEX "hadiths_created_at_idx" ON "hadiths" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hadith_topics_fk" FOREIGN KEY ("hadith_topics_id") REFERENCES "public"."hadith_topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hadith_books_fk" FOREIGN KEY ("hadith_books_id") REFERENCES "public"."hadith_books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hadith_sections_fk" FOREIGN KEY ("hadith_sections_id") REFERENCES "public"."hadith_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hadiths_fk" FOREIGN KEY ("hadiths_id") REFERENCES "public"."hadiths"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_hadith_topics_id_idx" ON "payload_locked_documents_rels" USING btree ("hadith_topics_id");
  CREATE INDEX "payload_locked_documents_rels_hadith_books_id_idx" ON "payload_locked_documents_rels" USING btree ("hadith_books_id");
  CREATE INDEX "payload_locked_documents_rels_hadith_sections_id_idx" ON "payload_locked_documents_rels" USING btree ("hadith_sections_id");
  CREATE INDEX "payload_locked_documents_rels_hadiths_id_idx" ON "payload_locked_documents_rels" USING btree ("hadiths_id");`)

  for (const [i, [title, titleAr, slug, books]] of TOPICS.entries()) {
    const t = await db.execute(sql`
      INSERT INTO "hadith_topics" ("title", "title_ar", "order", "slug", "is_published")
      VALUES (${title}, ${titleAr}, ${i + 1}, ${slug}, true) RETURNING "id";`)
    const topicId = (t as unknown as { rows: { id: number }[] }).rows[0].id
    for (const [j, [bTitle, bAr, bSlug, sections]] of books.entries()) {
      const b = await db.execute(sql`
        INSERT INTO "hadith_books" ("title", "title_ar", "topic_id", "order", "slug", "is_published")
        VALUES (${bTitle}, ${bAr}, ${topicId}, ${j + 1}, ${bSlug}, true) RETURNING "id";`)
      const bookId = (b as unknown as { rows: { id: number }[] }).rows[0].id
      for (const [k, sec] of sections.entries()) {
        const [ar, ru] = sec.split('|')
        await db.execute(sql`
          INSERT INTO "hadith_sections" ("title", "title_ar", "book_id", "order") VALUES (${ru}, ${ar}, ${bookId}, ${k + 1});`)
      }
    }
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hadith_topics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hadith_books" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hadith_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hadiths" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "hadith_topics" CASCADE;
  DROP TABLE "hadith_books" CASCADE;
  DROP TABLE "hadith_sections" CASCADE;
  DROP TABLE "hadiths" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_hadith_topics_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_hadith_books_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_hadith_sections_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_hadiths_fk";
  
  DROP INDEX "payload_locked_documents_rels_hadith_topics_id_idx";
  DROP INDEX "payload_locked_documents_rels_hadith_books_id_idx";
  DROP INDEX "payload_locked_documents_rels_hadith_sections_id_idx";
  DROP INDEX "payload_locked_documents_rels_hadiths_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "hadith_topics_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "hadith_books_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "hadith_sections_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "hadiths_id";`)
}
