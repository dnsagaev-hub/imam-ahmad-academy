import * as migration_20261016_084906_initial from './20261016_084906_initial';

export const migrations = [
  {
    up: migration_20261016_084906_initial.up,
    down: migration_20261016_084906_initial.down,
    name: '20261016_084906_initial'
  },
];
