# Академия имама Ахмада: как устроено

## Модули
```
src/
  payload.config.ts        настройки Payload (коллекции, S3, почта, onInit → стартовое наполнение)
  collections/             Courses, Lessons, Articles, Books, Media, QuranTranslations, SurahInfo, Reciters, Users, QuizAttempts, Messages
  globals/Settings.ts      настройки сайта (тексты главной, город намазов, хиджра, контакты, FAQ)
  blocks/lessonBlocks.ts   блоки текстового урока (и статей): matn, hadith (хадис в своей рамке), explanation, terms, note, figure (картинка из media), takeaways
  access/                  кто что видит и меняет
  fields/                  общие поля коллекций
  types/                   типы TypeScript
  lib/                     constants (ступени, рубрики), learning (логика курса/уровня), queries (запросы),
                           books, media, video, prayerTimes, localProgress, listenStore
  components/              Header/NavMenu/Footer, Cards, program/Program (ступени), library/*, text/*,
                           audio/*, video/*, progress/*, contact/QuestionBuilder, Quiz, PrayerWidgets
  app/(frontend)/          страницы сайта; actions.ts — серверные действия (checkAnswer, submitQuiz); styles.css — все стили
  app/(payload)/           админка (сгенерировано Payload, не трогать без нужды)
  migrations/              миграции базы
  seed/                    стартовое наполнение: program.ts (44 курса + книги программы), sampleBooks,
                           sampleLessons (3 текстовых урока со сверенными цитатами), sampleArticles, starter.ts
.github/workflows/ci.yml   проверка: установка, миграции, наполнение, типы, сборка, проверка страниц,
                           снимки экрана, Docker-образ, запуск через docker compose, ярлык копии данных
docker-compose.yml         локальная версия: сайт + PostgreSQL (тома db-data и media), имя проекта imam-ahmad-academy
*.command / *.bat          ярлыки для владельца: запустить, остановить, сделать копию данных
```

## Данные
- PostgreSQL; таблицы создаются **миграциями** (`src/migrations`, `prodMigrations` — применяются при запуске сайта).
  Правила миграций — `AGENTS.md`, «Инварианты».
- Ступени: значения `prep | beginner | intermediate | advanced`. Шкала успеха — `STUDENT_LEVELS` в `src/lib/constants.ts`,
  `studentLevel()` в `src/lib/learning.ts`.
- Прогресс ученика при выключенной регистрации — localStorage (`src/lib/localProgress.ts`), выгрузка и загрузка файлом на `/progress`.
- Верный ответ теста — поле `correct`, его читает только админ; проверка — серверные действия `checkAnswer`/`submitQuiz`.
- Библиотека: книга = вид (матн/шарх/хашия/справочник/перевод/пособие), ступень, «опорная книга мазхаба», связь
  «шарх → матн», основной PDF + список «Тома и файлы» (много PDF), ссылки «Читать онлайн». «Путь изучения фикха»
  строится из книг раздела «Фикх» по ступеням.
- Одиночное поле курса `book` заменено на `books`; `book` оставлено скрытым (миграции только добавляющие).
- Уроки по книгам (`src/lib/lessonBooks.ts`): книга урока — поле урока `book`, иначе первая книга (`books[0]`) первого
  по порядку курса, где есть урок; скрытая книга не считается. Разделы `/audio`, `/video`, `/text`: рубрика → полка книг
  (`components/lessons/BookShelf`) и «Другие уроки» без книги; `?book=<slug>` — уроки одной книги по порядку изучения
  (номер в курсе, затем дата). Страница книги библиотеки показывает число уроков по видам (`getBookLessonCounts`).
  Рубрики аудио и видео — все рубрики уроков, включая «Акыду» (`MEDIA_CATEGORIES`).
- Стартовое наполнение (`SEED_STARTER=true`) — один раз, затем скрытый флаг `starterSeeded` в настройках (`src/seed/starter.ts`).
- Хадисы (`/hadith`, задача 37): коллекции `hadith-topics` → `hadith-books` → `hadith-sections` (главы, необязательны)
  и `hadiths` (книга, глава, номер, `arabic`, `translation`, richText `source`/`grade`/`explanation` — кнопки из `HADITH_PARTS`,
  только у заполненного). Деление книги «معالم السنة النبوية» вставляет миграция `20261023_154658_hadiths`. Запросы —
  `src/lib/hadithData.ts`, страницы — `src/app/(frontend)/hadith`, вид хадиса и окно — `src/components/hadith/HadithList.tsx`
  (классы «Корана» `.ayah`, `.cm` и свои `.hd-*`).
- Фикх (`/fiqh`, задача 46): коллекции `fiqh-parts` → `fiqh-books` → `fiqh-chapters` (раздел-«باب»: `order` — номер
  и адрес страницы, richText `intro`, картинка `scheme` и `schemeNote` — кнопки в шапке, массив `topics` {from, title},
  массив `sentences` {arabic, translation, richText из `FIQH_NOTES`}). Номер абзаца — место в массиве. Деление и арабский
  текст «Зад аль-Мустакни‘» (`src/data/fiqh/zad.json`, из OpenITI `…ZadMustaqnic.Shamela0011230-ara1`) вставляет миграция
  `20261025_085830_fiqh`. Запросы — `src/lib/fiqhData.ts`, страницы — `src/app/(frontend)/fiqh`, текст и окно —
  `src/components/fiqh/FiqhText.tsx` (классы «Корана» `.ayah`, `.sv-show`, `.cm` и свои `.fq-*`), кнопки шапки — `SurahInfoButtons`.
- Коран (`/quran`): арабский текст и шрифт — Комплекс короля Фахда (KFGQPC Uthmanic Hafs v18), постоянные данные в
  `src/data/quran/<номер>.json` и `public/fonts/quran/`; список сур (русское название, смысл, мекканская/мединская по Tanzil,
  число аятов) — `src/lib/quran.ts`. Сведения о суре (кнопки в шапке суры, окно `SurahInfoButtons`) — коллекция
  `surah-info`: номер суры и четыре richText-пункта из `SURAH_INFO_PARTS`, кнопка только у заполненного. Перевод — коллекция `quran-translations` (одна запись на суру: аяты с переводом
  и пояснениями richText из `AYAH_NOTES`: толкование — прежнее поле `comment`, причина ниспослания `occasion`, связь `connection`, размышление `reflection`); загрузка .docx разбирается хуком `beforeChange` (`src/lib/docx.ts`, без зависимостей:
  zip + `word/document.xml`), номера аятов сверяются с сурой, комментарии при повторной загрузке сохраняются.
  Файл .docx лежит в `media/quran-docx` (не в S3: после разбора он не нужен сайту). Жирный/обычный — по скобкам
  (`splitTranslation`), а не по форматированию Word. Ошибка хука — `APIError` с явным `name`: иначе в собранной версии
  Payload показывает «An unknown error occurred». Чтецы — коллекция `reciters`: папка `baseUrl` + `NNN.mp3` или свои MP3
  по сурам; семь чтецов с mp3quran.net добавляет миграция `20261021_125346_quran`. Плеер — общий `AudioPlayer`,
  очередь — все суры чтеца.
  Сборник переводов одним файлом: `/quran/import` (только администратор), `parseCollectionDocx` в `src/lib/docx.ts`,
  сохранение — серверное действие `importQuranCollection` через Payload с правами вошедшего администратора.
  Темы аятов — массив `topics` записи перевода (`from` — номер аята, `title`), подпись над аятом; галочки «Арабский
  текст» / «Перевод» — в `SurahView`, выбор хранит браузер (`quran-show`).
  Мусхаф суры (`src/lib/mushaf.ts`): страницы суры — mp3quran.net `suwar` (start_page/end_page), изображения страниц —
  набор GovarJabbar/Quran-PNG на GitHub; `/quran/mushaf/<стр.>` отдаёт PNG (sharp: белый фон, ширина 1300, оттенки
  серого; копия в `media/mushaf`), `/quran/<n>/mushaf` — страницы суры, `/quran/<n>/mushaf.pdf` — PDF, собранный без
  библиотек (`buildPdf`, A4; готовый файл тоже в `media/mushaf`).
  Подсветка читаемого аята: `/quran/timing?r=<чтец>&s=<сура>` (`src/lib/quranTiming.ts`) берёт у mp3quran.net
  разметку времени аятов для чтеца, подключённого ссылкой на папку mp3quran (кэш сутки); у своих MP3 подсветки нет.
  Старые адреса семи чтецов (server*.mp3quran.net) заменяются на новые папки cdn.mp3quran.net (`currentFolder` в `src/lib/quran.ts`).
- Файлы: S3, если заданы `S3_*`, иначе папка `media/` (в локальной версии — Docker-том `media`). Аудио — MP3 до 300 МБ.

## Внешние системы
- Аудио Корана: mp3quran.net по ссылке (адреса чтецов — в админке, «Коран → Чтецы»); разметка времени аятов —
  mp3quran.net API v3 `ayat_timing` (запрашивает сервер сайта; недоступен — сайт работает без подсветки).
- Видео: в уроке хранится ссылка; `src/lib/video.ts` (`toEmbedUrl`) превращает обычные ссылки VK Видео, Rutube,
  YouTube, Kinescope в ссылки для встраивания.
- Время намазов считается в браузере (порт PrayTimes.org, аср по ханбалитскому — коэффициент 1); местоположение
  никуда не отправляется.
- Хиджра — `Intl` (Umm al-Qura) с поправкой ±2 дня из настроек.
- Почта (SMTP) — только для смены пароля, в локальной версии её нет.

## Ключевые расчёты и правила
- Открытие уроков и уровень ученика — `src/lib/learning.ts`.
- Проверка ответов — только на сервере (`app/(frontend)/actions.ts`).

## Окружения
- **Сборка:** `output: 'standalone'`, многоэтапный `Dockerfile`; на этапе сборки подставляются временные
  `PAYLOAD_SECRET`/`DATABASE_URL`; все страницы `force-dynamic`, поэтому база при сборке не нужна.
- **CI:** GitHub Actions, своя PostgreSQL 17 в сервисе, журнал в ветку `ci-logs`.
- **Локальная версия владельца:** docker compose, данные в томах `db-data` и `media`. Обновление: владелец распаковывает
  новую версию в новую папку (или `git pull`), запускает «Сделать копию данных», затем «Запустить сайт»; миграции
  применяются при старте. Имя проекта compose задано в файле, поэтому тома те же при любой папке.
- **Хостинг (ещё не сделано).** Выбран Timeweb Cloud: App Platform (сборка из GitHub по Dockerfile, автодеплой),
  облачная PostgreSQL в той же приватной сети, S3-хранилище (`S3_ENDPOINT=https://s3.twcstorage.ru`, `S3_REGION=ru-1`).
  Переменные: `DATABASE_URL`, `PAYLOAD_SECRET` (новый: `openssl rand -hex 32`), `NEXT_PUBLIC_SERVER_URL`,
  `NEXT_PUBLIC_REGISTRATION_ENABLED=false`, `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.
  Не ставить `SEED_STARTER=true` на хостинге, если переносится локальная база владельца. После первого запуска сразу
  создать администратора на `/admin` (первый вошедший становится админом).
- **Перенос локальных данных на хостинг (задача в `TASKS.md`):** `pg_dump` локальной базы → восстановить в базу Timeweb
  (до первого запуска сайта или в пустую базу); файлы из тома `media` загрузить в S3-бакет (Payload storage-s3 хранит
  файлы по имени `filename` в корне бакета — проверить префикс перед загрузкой). Наполнять только одну версию:
  локальную до переноса, хостинг — после.

## Сопутствующие материалы
- Макеты страниц (Claude Design): https://claude.ai/artifact/UdSaeDUgo8Lba529Kem9tw
- Руководство для владельца по наполнению (Claude Doc): https://claude.ai/code/artifact/ec9bb99d-38db-4720-88d5-cdbb094c9745
