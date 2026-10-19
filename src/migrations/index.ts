import * as migration_20261016_084906_initial from './20261016_084906_initial';
import * as migration_20261017_221855_update from './20261017_221855_update';
import * as migration_20261018_081532_update from './20261018_081532_update';
import * as migration_20261019_153827_lesson_book from './20261019_153827_lesson_book';
import * as migration_20261019_230346_lesson_figure from './20261019_230346_lesson_figure';

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
    name: '20261019_230346_lesson_figure'
  },
];
