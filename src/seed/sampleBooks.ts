/*
 * Стартовый каталог библиотеки: только описания, без файлов.
 * PDF и ссылки на электронные библиотеки добавляются в админке —
 * загружайте лишь то, что разрешено распространять.
 */

export type SampleBook = {
  slug: string
  title: string
  titleAr: string
  author: string
  authorAr: string
  authorDeath: number
  category: string
  kind: 'matn' | 'sharh' | 'hashiya' | 'reference' | 'translation' | 'textbook'
  level?: 'beginner' | 'intermediate' | 'advanced' | 'reference'
  isMutamad?: boolean
  base?: string
  order: number
  description: string
  about?: string
  edition?: string
}

const BUHUTI = { author: 'Мансур аль-Бухути', authorAr: 'منصور البهوتي', authorDeath: 1051 }
const HAJJAWI = { author: 'Муса аль-Хаджжави', authorAr: 'موسى الحجاوي', authorDeath: 968 }
const IBN_QUDAMA = { author: 'Ибн Кудама аль-Макдиси', authorAr: 'ابن قدامة المقدسي', authorDeath: 620 }
const KARMI = { author: 'Мар‘и аль-Карми', authorAr: 'مرعي الكرمي', authorDeath: 1033 }
const AHMAD = { author: 'Имам Ахмад ибн Ханбаль', authorAr: 'الإمام أحمد بن حنبل', authorDeath: 241 }
const IBN_NAJJAR = { author: 'Ибн ан-Наджжар аль-Футухи', authorAr: 'ابن النجار الفتوحي', authorDeath: 972 }

export const SAMPLE_BOOKS: SampleBook[] = [
  // ---------- Фикх: путь изучения ----------
  {
    slug: 'ahsar-al-muhtasarat',
    title: 'Ахсар аль-Мухтасарат',
    titleAr: 'أخصر المختصرات',
    author: 'Ибн Бальбан',
    authorAr: 'ابن بلبان الدمشقي',
    authorDeath: 1083,
    category: 'fiqh',
    kind: 'matn',
    level: 'beginner',
    order: 10,
    description: 'Один из самых кратких матнов ханбалитского фикха — первый шаг в изучении мазхаба.',
    about:
      'Как видно из названия («Кратчайшее из кратких»), автор стремился изложить главы фикха как можно короче. Поэтому книгу часто выбирают первой: её можно выучить наизусть и пройти целиком с преподавателем.\n\nПо этому матну построены демо-уроки академии о видах воды и таяммуме.',
    edition: 'Тахкик Мухаммада Насира аль-Аджми',
  },
  {
    slug: 'kashf-al-muhaddarat',
    title: 'Кашф аль-Мухаддарат',
    titleAr: 'كشف المخدرات والرياض المزهرات لشرح أخصر المختصرات',
    author: 'Абд ар-Рахман аль-Ба‘ли',
    authorAr: 'عبد الرحمن البعلي',
    authorDeath: 1192,
    category: 'fiqh',
    kind: 'sharh',
    level: 'beginner',
    base: 'ahsar-al-muhtasarat',
    order: 11,
    description: 'Шарх на «Ахсар аль-Мухтасарат»: раскрывает краткие выражения матна.',
  },
  {
    slug: 'umdat-al-fiqh',
    title: 'Умдат аль-Фикх',
    titleAr: 'عمدة الفقه',
    ...IBN_QUDAMA,
    category: 'fiqh',
    kind: 'matn',
    level: 'beginner',
    order: 20,
    description: 'Матн Ибн Кудамы для начинающих; главы открываются хадисами.',
    about:
      'Ибн Кудама написал четыре книги по фикху для разных ступеней: «аль-‘Умда», «аль-Мукни‘», «аль-Кафи» и «аль-Мугни». «Умда» — первая из них, для начинающих.',
  },
  {
    slug: 'al-udda-sharh-al-umda',
    title: 'Аль-‘Удда шарх аль-‘Умда',
    titleAr: 'العدة شرح العمدة',
    author: 'Баха ад-Дин аль-Макдиси',
    authorAr: 'بهاء الدين المقدسي',
    authorDeath: 624,
    category: 'fiqh',
    kind: 'sharh',
    level: 'beginner',
    base: 'umdat-al-fiqh',
    order: 21,
    description: 'Шарх на «Умдат аль-Фикх» с доводами.',
  },
  {
    slug: 'zad-al-mustaqni',
    title: 'Зад аль-Мустакни‘',
    titleAr: 'زاد المستقنع في اختصار المقنع',
    ...HAJJAWI,
    category: 'fiqh',
    kind: 'matn',
    level: 'intermediate',
    order: 30,
    description: 'Сокращение «аль-Мукни‘» Ибн Кудамы — один из самых изучаемых матнов мазхаба.',
    about:
      'Аль-Хаджжави сократил «аль-Мукни‘» Ибн Кудамы, оставив одно мнение в каждом вопросе. Матн насыщенный: многие вопросы уложены в одно предложение, поэтому его изучают вместе с шархом «ар-Рауд аль-Мурби‘».',
  },
  {
    slug: 'ar-rawd-al-murbi',
    title: 'Ар-Рауд аль-Мурби‘',
    titleAr: 'الروض المربع شرح زاد المستقنع',
    ...BUHUTI,
    category: 'fiqh',
    kind: 'sharh',
    level: 'intermediate',
    base: 'zad-al-mustaqni',
    order: 31,
    description: 'Шарх аль-Бухути на «Зад аль-Мустакни‘».',
  },
  {
    slug: 'dalil-at-talib',
    title: 'Далиль ат-Талиб',
    titleAr: 'دليل الطالب لنيل المطالب',
    ...KARMI,
    category: 'fiqh',
    kind: 'matn',
    level: 'intermediate',
    order: 40,
    description: 'Ясный по языку матн для средней ступени.',
  },
  {
    slug: 'manar-as-sabil',
    title: 'Манар ас-Сабиль',
    titleAr: 'منار السبيل في شرح الدليل',
    author: 'Ибрахим ибн Дуйян',
    authorAr: 'إبراهيم بن ضويان',
    authorDeath: 1353,
    category: 'fiqh',
    kind: 'sharh',
    level: 'intermediate',
    base: 'dalil-at-talib',
    order: 41,
    description: 'Шарх на «Далиль ат-Талиб» с доводами из Корана и Сунны.',
  },
  {
    slug: 'muntaha-al-iradat',
    title: 'Мунтаха аль-Ирадат',
    titleAr: 'منتهى الإرادات في جمع المقنع مع التنقيح وزيادات',
    ...IBN_NAJJAR,
    category: 'fiqh',
    kind: 'matn',
    level: 'advanced',
    order: 50,
    description: 'Один из двух главных матнов поздних ханбалитов; по нему выносятся решения в мазхабе.',
  },
  {
    slug: 'sharh-muntaha-al-iradat',
    title: 'Шарх Мунтаха аль-Ирадат',
    titleAr: 'دقائق أولي النهى لشرح المنتهى',
    ...BUHUTI,
    category: 'fiqh',
    kind: 'sharh',
    level: 'advanced',
    isMutamad: true,
    base: 'muntaha-al-iradat',
    order: 51,
    description: 'Шарх аль-Бухути на «аль-Мунтаха» — одна из опорных книг для основного мнения мазхаба.',
  },
  {
    slug: 'al-iqna',
    title: 'Аль-Икна‘',
    titleAr: 'الإقناع لطالب الانتفاع',
    ...HAJJAWI,
    category: 'fiqh',
    kind: 'matn',
    level: 'advanced',
    order: 55,
    description: 'Второй из главных матнов поздних ханбалитов, наряду с «аль-Мунтаха».',
  },
  {
    slug: 'kashshaf-al-qina',
    title: 'Кашшаф аль-Кына‘',
    titleAr: 'كشاف القناع عن متن الإقناع',
    ...BUHUTI,
    category: 'fiqh',
    kind: 'sharh',
    level: 'advanced',
    isMutamad: true,
    base: 'al-iqna',
    order: 56,
    description: 'Шарх аль-Бухути на «аль-Икна‘» — одна из опорных книг для основного мнения мазхаба.',
    about:
      'Вместе с «Шарх Мунтаха аль-Ирадат» этот шарх — главная книга для сверки основного мнения мазхаба. Когда «аль-Икна‘» и «аль-Мунтаха» расходятся, в уроках академии приводятся оба мнения.',
  },
  {
    slug: 'ghayat-al-muntaha',
    title: 'Гайат аль-Мунтаха',
    titleAr: 'غاية المنتهى في جمع الإقناع والمنتهى',
    ...KARMI,
    category: 'fiqh',
    kind: 'matn',
    level: 'advanced',
    order: 60,
    description: 'Матн, объединивший «аль-Икна‘» и «аль-Мунтаха».',
  },
  {
    slug: 'matalib-uli-an-nuha',
    title: 'Матолиб Ули ан-Нуха',
    titleAr: 'مطالب أولي النهى في شرح غاية المنتهى',
    author: 'Мустафа ар-Рухайбани',
    authorAr: 'مصطفى الرحيباني',
    authorDeath: 1243,
    category: 'fiqh',
    kind: 'sharh',
    level: 'advanced',
    isMutamad: true,
    base: 'ghayat-al-muntaha',
    order: 61,
    description: 'Шарх на «Гайат аль-Мунтаха»; академия сверяет по нему основное мнение мазхаба.',
  },

  // ---------- Для сверки ----------
  {
    slug: 'al-mughni',
    title: 'Аль-Мугни',
    titleAr: 'المغني',
    ...IBN_QUDAMA,
    category: 'fiqh',
    kind: 'reference',
    level: 'reference',
    order: 80,
    description: 'Большая энциклопедия фикха с мнениями сподвижников и разных мазхабов и их доводами.',
  },
  {
    slug: 'al-insaf',
    title: 'Аль-Инсаф',
    titleAr: 'الإنصاف في معرفة الراجح من الخلاف',
    author: 'Ала ад-Дин аль-Мардави',
    authorAr: 'علاء الدين المرداوي',
    authorDeath: 885,
    category: 'fiqh',
    kind: 'reference',
    level: 'reference',
    order: 81,
    description: 'Собирает риваяты и мнения внутри мазхаба и указывает, какое из них основное.',
  },

  // ---------- Введение в мазхаб ----------
  {
    slug: 'al-madkhal-ibn-badran',
    title: 'Аль-Мадхаль ила мазхаб аль-имам Ахмад',
    titleAr: 'المدخل إلى مذهب الإمام أحمد بن حنبل',
    author: 'Ибн Бадран',
    authorAr: 'عبد القادر بن بدران',
    authorDeath: 1346,
    category: 'madhhab',
    kind: 'reference',
    level: 'beginner',
    order: 5,
    description: 'Введение в мазхаб: основы фетв имама Ахмада, термины мазхаба, его книги и учёные.',
    about:
      'Ибн Бадран объясняет, на чём строил фетвы имам Ахмад, почему от него передаются разные риваяты, что означают термины мазхаба, и рассказывает о его книгах.\n\nПо этой книге написаны урок «Пять основ фетв имама Ахмада» и статья о риваятах.',
    edition: 'Тахкик Абдуллаха ат-Турки',
  },

  // ---------- Усуль и правила фикха ----------
  {
    slug: 'mukhtasar-at-tahrir',
    title: 'Мухтасар ат-Тахрир',
    titleAr: 'مختصر التحرير',
    ...IBN_NAJJAR,
    category: 'usul',
    kind: 'matn',
    level: 'intermediate',
    order: 100,
    description: 'Матн по усуль аль-фикх в ханбалитском мазхабе.',
  },
  {
    slug: 'rawdat-an-nazir',
    title: 'Рауда ан-Назир',
    titleAr: 'روضة الناظر وجنة المناظر',
    ...IBN_QUDAMA,
    category: 'usul',
    kind: 'reference',
    level: 'advanced',
    order: 101,
    description: 'Известная книга Ибн Кудамы по усуль аль-фикх.',
  },
  {
    slug: 'qawaid-ibn-rajab',
    title: 'Аль-Кава‘ид Ибн Раджаба',
    titleAr: 'تقرير القواعد وتحرير الفوائد',
    author: 'Ибн Раджаб аль-Ханбали',
    authorAr: 'ابن رجب الحنبلي',
    authorDeath: 795,
    category: 'qawaid',
    kind: 'reference',
    level: 'advanced',
    order: 110,
    description: 'Правила фикха с множеством частных вопросов мазхаба.',
  },

  // ---------- Акыда ----------
  {
    slug: 'usul-as-sunna',
    title: 'Усуль ас-Сунна',
    titleAr: 'أصول السنة',
    ...AHMAD,
    category: 'aqida',
    kind: 'matn',
    level: 'beginner',
    order: 120,
    description: 'Краткое изложение основ убеждений ахлю-с-сунна от самого имама Ахмада.',
  },
  {
    slug: 'lumat-al-itiqad',
    title: 'Лум‘ат аль-И‘тикад',
    titleAr: 'لمعة الاعتقاد',
    ...IBN_QUDAMA,
    category: 'aqida',
    kind: 'matn',
    level: 'beginner',
    order: 121,
    description: 'Краткий матн по вероучению для начинающих.',
  },
  {
    slug: 'al-aqida-al-wasitiyya',
    title: 'Аль-‘Акыда аль-Васития',
    titleAr: 'العقيدة الواسطية',
    author: 'Ибн Таймия',
    authorAr: 'ابن تيمية',
    authorDeath: 728,
    category: 'aqida',
    kind: 'matn',
    level: 'intermediate',
    order: 122,
    description: 'Известный матн по вероучению, который изучают на средней ступени.',
  },

  // ---------- Хадис и ахляк ----------
  {
    slug: 'umdat-al-ahkam',
    title: 'Умдат аль-Ахкам',
    titleAr: 'عمدة الأحكام',
    author: 'Абд аль-Гани аль-Макдиси',
    authorAr: 'عبد الغني المقدسي',
    authorDeath: 600,
    category: 'hadith',
    kind: 'matn',
    level: 'beginner',
    order: 130,
    description: 'Хадисы о законоположениях, отобранные из двух «Сахихов».',
  },
  {
    slug: 'al-musnad',
    title: 'Аль-Муснад',
    titleAr: 'المسند',
    ...AHMAD,
    category: 'hadith',
    kind: 'reference',
    level: 'reference',
    order: 131,
    description: 'Знаменитый сборник хадисов имама Ахмада, расположенный по сподвижникам.',
  },
  {
    slug: 'mukhtasar-minhaj-al-qasidin',
    title: 'Мухтасар Минхадж аль-Касидин',
    titleAr: 'مختصر منهاج القاصدين',
    ...IBN_QUDAMA,
    category: 'akhlaq',
    kind: 'matn',
    level: 'beginner',
    order: 140,
    description: 'Сокращение Ибн Кудамой книги Ибн аль-Джаузи «Минхадж аль-Касидин»: поклонение, нравы и очищение души.',
  },
]
