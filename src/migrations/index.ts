import * as migration_20261016_084906_initial from './20261016_084906_initial';
import * as migration_20261017_221855_update from './20261017_221855_update';
import * as migration_20261018_081532_update from './20261018_081532_update';
import * as migration_20261019_153827_lesson_book from './20261019_153827_lesson_book';
import * as migration_20261019_230346_lesson_figure from './20261019_230346_lesson_figure';
import * as migration_20261020_090912_lesson_hadith from './20261020_090912_lesson_hadith';
import * as migration_20261021_125346_quran from './20261021_125346_quran';
import * as migration_20261022_081747_surah_info from './20261022_081747_surah_info';
import * as migration_20261022_085619_surah_info_virtues from './20261022_085619_surah_info_virtues';

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
    name: '20261022_085619_surah_info_virtues'
  },
];
