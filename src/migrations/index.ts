import * as migration_20261016_084906_initial from './20261016_084906_initial';
import * as migration_20261017_221855_update from './20261017_221855_update';
import * as migration_20261018_081532_update from './20261018_081532_update';
import * as migration_20261019_153827_lesson_book from './20261019_153827_lesson_book';
import * as migration_20261019_230346_lesson_figure from './20261019_230346_lesson_figure';
import * as migration_20261020_090912_lesson_hadith from './20261020_090912_lesson_hadith';
import * as migration_20261021_125346_quran from './20261021_125346_quran';
import * as migration_20261022_081747_surah_info from './20261022_081747_surah_info';
import * as migration_20261022_085619_surah_info_virtues from './20261022_085619_surah_info_virtues';
import * as migration_20261022_100302_ayah_notes from './20261022_100302_ayah_notes';
import * as migration_20261023_154658_hadiths from './20261023_154658_hadiths';
import * as migration_20261023_211211_quran_topics from './20261023_211211_quran_topics';
import * as migration_20261024_064631_reciters_more from './20261024_064631_reciters_more';
import * as migration_20261025_085830_fiqh from './20261025_085830_fiqh';
import * as migration_20261026_154347_surah_names from './20261026_154347_surah_names';
import * as migration_20261027_200155_arabic_lessons from './20261027_200155_arabic_lessons';
import * as migration_20261027_200156_arabic_word_audio from './20261027_200156_arabic_word_audio';
import * as migration_20261027_213000_arabic_lesson_1 from './20261027_213000_arabic_lesson_1';
import * as migration_20261027_230000_arabic_lesson_2 from './20261027_230000_arabic_lesson_2';
import * as migration_20261028_050000_arabic_pictures from './20261028_050000_arabic_pictures';
import * as migration_20261028_080000_arabic_pictures_2 from './20261028_080000_arabic_pictures_2';
import * as migration_20261028_110000_arabic_lesson_1_grammar from './20261028_110000_arabic_lesson_1_grammar';
import * as migration_20261028_113000_arabic_lesson_2_grammar from './20261028_113000_arabic_lesson_2_grammar';
import * as migration_20261028_123000_arabic_lesson_3 from './20261028_123000_arabic_lesson_3';
import * as migration_20261028_163000_arabic_lesson_4 from './20261028_163000_arabic_lesson_4';
import * as migration_20261028_200000_arabic_lesson_5 from './20261028_200000_arabic_lesson_5';
import * as migration_20261028_210000_arabic_lesson_6 from './20261028_210000_arabic_lesson_6';
import * as migration_20261028_230000_arabic_lesson_7 from './20261028_230000_arabic_lesson_7';
import * as migration_20261029_120000_arabic_lesson_8 from './20261029_120000_arabic_lesson_8';
import * as migration_20261029_160000_arabic_lesson_9 from './20261029_160000_arabic_lesson_9';
import * as migration_20261029_200000_arabic_lesson_10 from './20261029_200000_arabic_lesson_10';
import * as migration_20261029_230000_arabic_lesson_11 from './20261029_230000_arabic_lesson_11';

export const migrations = [
  {
    up: migration_20261016_084906_initial.up,
    down: migration_20261016_084906_initial.down,
    name: '20261016_084906_initial',
  },
  {
    up: migration_20261017_221855_update.up,
    down: migration_20261017_221855_update.down,
    name: '20261017_221855_update',
  },
  {
    up: migration_20261018_081532_update.up,
    down: migration_20261018_081532_update.down,
    name: '20261018_081532_update',
  },
  {
    up: migration_20261019_153827_lesson_book.up,
    down: migration_20261019_153827_lesson_book.down,
    name: '20261019_153827_lesson_book',
  },
  {
    up: migration_20261019_230346_lesson_figure.up,
    down: migration_20261019_230346_lesson_figure.down,
    name: '20261019_230346_lesson_figure',
  },
  {
    up: migration_20261020_090912_lesson_hadith.up,
    down: migration_20261020_090912_lesson_hadith.down,
    name: '20261020_090912_lesson_hadith',
  },
  {
    up: migration_20261021_125346_quran.up,
    down: migration_20261021_125346_quran.down,
    name: '20261021_125346_quran',
  },
  {
    up: migration_20261022_081747_surah_info.up,
    down: migration_20261022_081747_surah_info.down,
    name: '20261022_081747_surah_info',
  },
  {
    up: migration_20261022_085619_surah_info_virtues.up,
    down: migration_20261022_085619_surah_info_virtues.down,
    name: '20261022_085619_surah_info_virtues',
  },
  {
    up: migration_20261022_100302_ayah_notes.up,
    down: migration_20261022_100302_ayah_notes.down,
    name: '20261022_100302_ayah_notes',
  },
  {
    up: migration_20261023_154658_hadiths.up,
    down: migration_20261023_154658_hadiths.down,
    name: '20261023_154658_hadiths',
  },
  {
    up: migration_20261023_211211_quran_topics.up,
    down: migration_20261023_211211_quran_topics.down,
    name: '20261023_211211_quran_topics',
  },
  {
    up: migration_20261024_064631_reciters_more.up,
    down: migration_20261024_064631_reciters_more.down,
    name: '20261024_064631_reciters_more',
  },
  {
    up: migration_20261025_085830_fiqh.up,
    down: migration_20261025_085830_fiqh.down,
    name: '20261025_085830_fiqh',
  },
  {
    up: migration_20261026_154347_surah_names.up,
    down: migration_20261026_154347_surah_names.down,
    name: '20261026_154347_surah_names',
  },
  {
    up: migration_20261027_200155_arabic_lessons.up,
    down: migration_20261027_200155_arabic_lessons.down,
    name: '20261027_200155_arabic_lessons'
  },
  {
    up: migration_20261027_200156_arabic_word_audio.up,
    down: migration_20261027_200156_arabic_word_audio.down,
    name: '20261027_200156_arabic_word_audio'
  },
  {
    up: migration_20261027_213000_arabic_lesson_1.up,
    down: migration_20261027_213000_arabic_lesson_1.down,
    name: '20261027_213000_arabic_lesson_1'
  },
  {
    up: migration_20261027_230000_arabic_lesson_2.up,
    down: migration_20261027_230000_arabic_lesson_2.down,
    name: '20261027_230000_arabic_lesson_2'
  },
  {
    up: migration_20261028_050000_arabic_pictures.up,
    down: migration_20261028_050000_arabic_pictures.down,
    name: '20261028_050000_arabic_pictures'
  },
  {
    up: migration_20261028_080000_arabic_pictures_2.up,
    down: migration_20261028_080000_arabic_pictures_2.down,
    name: '20261028_080000_arabic_pictures_2'
  },
  {
    up: migration_20261028_110000_arabic_lesson_1_grammar.up,
    down: migration_20261028_110000_arabic_lesson_1_grammar.down,
    name: '20261028_110000_arabic_lesson_1_grammar'
  },
  {
    up: migration_20261028_113000_arabic_lesson_2_grammar.up,
    down: migration_20261028_113000_arabic_lesson_2_grammar.down,
    name: '20261028_113000_arabic_lesson_2_grammar'
  },
  {
    up: migration_20261028_123000_arabic_lesson_3.up,
    down: migration_20261028_123000_arabic_lesson_3.down,
    name: '20261028_123000_arabic_lesson_3'
  },
  {
    up: migration_20261028_163000_arabic_lesson_4.up,
    down: migration_20261028_163000_arabic_lesson_4.down,
    name: '20261028_163000_arabic_lesson_4'
  },
  {
    up: migration_20261028_200000_arabic_lesson_5.up,
    down: migration_20261028_200000_arabic_lesson_5.down,
    name: '20261028_200000_arabic_lesson_5'
  },
  {
    up: migration_20261028_210000_arabic_lesson_6.up,
    down: migration_20261028_210000_arabic_lesson_6.down,
    name: '20261028_210000_arabic_lesson_6'
  },
  {
    up: migration_20261028_230000_arabic_lesson_7.up,
    down: migration_20261028_230000_arabic_lesson_7.down,
    name: '20261028_230000_arabic_lesson_7'
  },
  {
    up: migration_20261029_120000_arabic_lesson_8.up,
    down: migration_20261029_120000_arabic_lesson_8.down,
    name: '20261029_120000_arabic_lesson_8'
  },
  {
    up: migration_20261029_160000_arabic_lesson_9.up,
    down: migration_20261029_160000_arabic_lesson_9.down,
    name: '20261029_160000_arabic_lesson_9'
  },
  {
    up: migration_20261029_200000_arabic_lesson_10.up,
    down: migration_20261029_200000_arabic_lesson_10.down,
    name: '20261029_200000_arabic_lesson_10'
  },
  {
    up: migration_20261029_230000_arabic_lesson_11.up,
    down: migration_20261029_230000_arabic_lesson_11.down,
    name: '20261029_230000_arabic_lesson_11'
  },
];
