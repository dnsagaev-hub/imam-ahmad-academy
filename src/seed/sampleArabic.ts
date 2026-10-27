import type { Payload } from 'payload'

/*
 * Демо-курс арабского языка (только для тестовой базы, `npm run seed`): два урока, на которых видно
 * словарь урока, подсказки к словам, этапы огласовки, задания всех видов, словарь курса и карточки.
 * Простые учебные предложения (هذا كتاب…) — образец исполнителя, не цитаты из книг.
 */

const BOOK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><rect width="120" height="90" fill="#f7fbf9"/><path d="M20 20 L58 26 L58 76 L20 70 Z" fill="#00704f"/><path d="M100 20 L62 26 L62 76 L100 70 Z" fill="#00a07a"/><path d="M58 26 L62 26 L62 76 L58 76 Z" fill="#003d2c"/></svg>`
const PEN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><rect width="120" height="90" fill="#f7fbf9"/><g transform="rotate(-35 60 45)"><rect x="20" y="38" width="70" height="14" rx="3" fill="#00704f"/><path d="M90 38 L106 45 L90 52 Z" fill="#d9b88a"/><path d="M101 43 L106 45 L101 47 Z" fill="#12261e"/><rect x="20" y="38" width="10" height="14" fill="#003d2c"/></g></svg>`

async function svgMedia(payload: Payload, svg: string, name: string, alt: string) {
  const data = Buffer.from(svg, 'utf8')
  const m = await payload.create({ collection: 'media', data: { alt }, file: { data, mimetype: 'image/svg+xml', name, size: data.length } })
  return m.id
}

export async function seedArabicDemo(payload: Payload) {
  const exists = await payload.find({ collection: 'courses', where: { slug: { equals: 'demo-arabskiy-yazyk' } }, limit: 1 })
  if (exists.totalDocs) return payload.logger.info('Демо-курс арабского уже есть — пропускаю.')

  const book = await svgMedia(payload, BOOK_SVG, 'demo-kitab.svg', 'Книга')
  const pen = await svgMedia(payload, PEN_SVG, 'demo-qalam.svg', 'Ручка')

  const lesson1 = await payload.create({
    collection: 'lessons',
    data: {
      title: '[Демо] «Это книга»: هَذَا и هَذِهِ',
      slug: 'demo-arabic-1',
      category: 'arabic',
      passingScore: 60,
      arabic: {
        stage: 'auto',
        words: [
          { word: 'هَذَا', translation: 'это, этот (м. р.)', tag: 'book', theme: 'Связки' },
          { word: 'هَذِهِ', translation: 'это, эта (ж. р.)', tag: 'book', theme: 'Связки' },
          { word: 'كِتَابٌ', translation: 'книга', root: 'ك ت ب', plural: 'كُتُبٌ', tag: 'book', theme: 'Учёба', image: book },
          { word: 'قَلَمٌ', translation: 'ручка, калам', root: 'ق ل م', plural: 'أَقْلَامٌ', tag: 'daily', theme: 'Учёба', image: pen },
          { word: 'بَيْتٌ', translation: 'дом', root: 'ب ي ت', plural: 'بُيُوتٌ', tag: 'daily', theme: 'Дом и семья' },
          { word: 'مَسْجِدٌ', translation: 'мечеть', root: 'س ج د', plural: 'مَسَاجِدُ', tag: 'term', theme: 'Мечеть' },
          { word: 'مَدْرَسَةٌ', translation: 'школа, медресе', root: 'د ر س', plural: 'مَدَارِسُ', tag: 'daily', theme: 'Учёба' },
          { word: 'طَالِبٌ', translation: 'ученик, студент', root: 'ط ل ب', plural: 'طُلَّابٌ', tag: 'book', theme: 'Учёба' },
          { word: 'وَ', translation: 'и, а', tag: 'book' },
          { word: 'مَا', translation: 'что? (вопрос о предмете)', tag: 'book' },
          { word: 'هَلْ', translation: 'ли? (вопрос «да или нет»)', tag: 'book' },
          { word: 'نَعَمْ', translation: 'да', tag: 'book' },
          { word: 'لَا', translation: 'нет', tag: 'book' },
        ],
        grammarTitle: 'Указательные местоимения هَذَا и هَذِهِ',
        grammar:
          '[Демо-заметка.] **هَذَا** указывает на близкий предмет мужского рода, **هَذِهِ** — женского. Слово с окончанием ة (та марбута) обычно женского рода.\n\nСвязки «есть», «является» в арабском предложении нет: هَذَا كِتَابٌ — «это (есть) книга».',
        grammarExamples: [
          { arabic: 'هَذَا كِتَابٌ.', translation: 'Это книга.' },
          { arabic: 'هَذِهِ مَدْرَسَةٌ.', translation: 'Это школа.' },
        ],
        sentences: [
          { arabic: 'هَذَا كِتَابٌ.', translation: 'Это книга.' },
          { arabic: 'هَذَا قَلَمٌ.', translation: 'Это ручка.' },
          { arabic: 'هَذَا بَيْتٌ.', translation: 'Это дом.' },
          { arabic: 'هَذِهِ مَدْرَسَةٌ.', translation: 'Это школа.' },
          { arabic: 'هَذَا مَسْجِدٌ.', translation: 'Это мечеть.' },
          { arabic: 'مَا هَذَا؟ هَذَا كِتَابٌ.', translation: 'Что это? Это книга.' },
          { arabic: 'هَلْ هَذَا قَلَمٌ؟ نَعَمْ، هَذَا قَلَمٌ.', translation: 'Это ручка? Да, это ручка.' },
          { arabic: 'هَلْ هَذِهِ مَدْرَسَةٌ؟ لَا، هَذَا مَسْجِدٌ.', translation: 'Это школа? Нет, это мечеть.' },
          { arabic: 'هَذَا طَالِبٌ، وَهَذَا كِتَابٌ.', translation: 'Это ученик, а это книга.' },
        ],
        tasks: [
          { kind: 'choice', prompt: 'Выберите перевод слова', material: 'كِتَابٌ', options: [{ text: 'книга' }, { text: 'ручка' }, { text: 'дом' }], correct: 1 },
          {
            kind: 'choice',
            prompt: 'Какое местоимение нужно со словом مَدْرَسَةٌ?',
            options: [{ text: 'هَذَا' }, { text: 'هَذِهِ' }],
            correct: 2,
            explanation: 'مَدْرَسَةٌ оканчивается на ة — это слово женского рода.',
          },
          { kind: 'input', prompt: 'Переведите на русский одним словом', material: 'بَيْتٌ', answer: 'дом' },
          {
            kind: 'match',
            prompt: 'Соедините слово и перевод',
            pairs: [
              { left: 'مَسْجِدٌ', right: 'мечеть' },
              { left: 'طَالِبٌ', right: 'ученик' },
              { left: 'قَلَمٌ', right: 'ручка' },
            ],
          },
          { kind: 'order', prompt: 'Соберите предложение', material: 'Это ученик, а это книга.', answer: 'هَذَا طَالِبٌ وَهَذَا كِتَابٌ' },
          { kind: 'toRu', prompt: 'Переведите на русский', material: 'هَلْ هَذَا بَيْتٌ؟ نَعَمْ، هَذَا بَيْتٌ.', answer: 'Это дом? Да, это дом.' },
          { kind: 'toAr', prompt: 'Переведите на арабский', material: 'Это школа.', answer: 'هَذِهِ مَدْرَسَةٌ.' },
          { kind: 'vowel', prompt: 'Расставьте огласовку', answer: 'هَذَا كِتَابٌ وَهَذَا قَلَمٌ.' },
        ],
      },
    } as any,
  })

  const lesson2 = await payload.create({
    collection: 'lessons',
    data: {
      title: '[Демо] Обобщающий урок без огласовки',
      slug: 'demo-arabic-2',
      category: 'arabic',
      passingScore: 60,
      arabic: {
        // На настоящих уроках огласовку снимает номер урока (с 86-го); здесь — вручную, для показа
        stage: 'none',
        isReview: true,
        words: [
          { word: 'كَبِيرٌ', translation: 'большой', root: 'ك ب ر', plural: 'كِبَارٌ', tag: 'book' },
          { word: 'صَغِيرٌ', translation: 'маленький', root: 'ص غ ر', plural: 'صِغَارٌ', tag: 'book' },
          { word: 'جَدِيدٌ', translation: 'новый', root: 'ج د د', plural: 'جُدُدٌ', tag: 'book' },
          { word: 'فِي', translation: 'в', tag: 'book' },
        ],
        sentences: [
          { arabic: 'الْكِتَابُ جَدِيدٌ.', translation: 'Книга новая.' },
          { arabic: 'الْبَيْتُ كَبِيرٌ.', translation: 'Дом большой.' },
          { arabic: 'الْقَلَمُ صَغِيرٌ.', translation: 'Ручка маленькая.' },
          { arabic: 'هَلِ الْمَسْجِدُ كَبِيرٌ؟ نَعَمْ، الْمَسْجِدُ كَبِيرٌ.', translation: 'Мечеть большая? Да, мечеть большая.' },
          { arabic: 'هَذِهِ الْمَدْرَسَةُ جَدِيدَةٌ.', translation: 'Эта школа новая.' },
        ],
        textTitle: 'فِي الْمَدْرَسَةِ',
        text: 'هَذِهِ مَدْرَسَةٌ. الْمَدْرَسَةُ كَبِيرَةٌ.\n\nفِي الْمَدْرَسَةِ طَالِبٌ. الطَّالِبُ جَدِيدٌ.',
        textTranslation: 'В школе.\n\nЭто школа. Школа большая. В школе ученик. Ученик новый.',
        tasks: [
          { kind: 'choice', prompt: 'Переведите', material: 'الْبَيْتُ كَبِيرٌ.', options: [{ text: 'Дом большой.' }, { text: 'Дом новый.' }, { text: 'Дом маленький.' }], correct: 1 },
          { kind: 'input', prompt: 'Напишите по-арабски слово «новый»', answer: 'جَدِيدٌ' },
        ],
      },
      questions: [
        { question: 'Как переводится صَغِيرٌ?', options: [{ text: 'большой' }, { text: 'маленький' }, { text: 'новый' }], correct: 2 },
        { question: 'Какое слово женского рода?', options: [{ text: 'كِتَابٌ' }, { text: 'مَدْرَسَةٌ' }, { text: 'بَيْتٌ' }], correct: 2 },
      ],
    } as any,
  })

  await payload.create({
    collection: 'courses',
    data: {
      title: 'Арабский язык (демо-курс авторского учебника)',
      slug: 'demo-arabskiy-yazyk',
      level: 'prep',
      discipline: 'arabic',
      order: 0,
      bookTitleAr: 'العربية لقراءة النصوص الشرعية',
      description: '[Демо-курс: как выглядит урок арабского — словарь, подсказки к словам, задания, карточки.]',
      modules: [{ title: 'Именное предложение', lessons: [lesson1.id, lesson2.id] }],
    } as any,
  })
  payload.logger.info('Демо-курс арабского создан.')
}
