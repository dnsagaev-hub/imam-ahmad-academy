import * as migration_20261016_084906_initial from './20261016_084906_initial';
import * as migration_20261017_221855_update from './20261017_221855_update';

export const migrations = [
  {
    up: migration_20261016_084906_initial.up,
    down: migration_20261016_084906_initial.down,
    name: '20261016_084906_initial',
  },
  {
    up: migration_20261017_221855_update.up,
    down: migration_20261017_221855_update.down,
    name: '20261017_221855_update'
  },
];
