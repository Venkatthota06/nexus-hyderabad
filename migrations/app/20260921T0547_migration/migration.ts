#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/4522b5211cca72564764e58a8423ffe38d02fb7bd103236c9c5ae1baeda49bc6/contract';
import startContract from '../../snapshots/4522b5211cca72564764e58a8423ffe38d02fb7bd103236c9c5ae1baeda49bc6/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/e31a6f470cd292c272a5b4b49bcaca910c37b1e3e21c12f62fb0010eba76977b/contract';
import endContract from '../../snapshots/e31a6f470cd292c272a5b4b49bcaca910c37b1e3e21c12f62fb0010eba76977b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'notification',
        columns: [
          col('actionUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('entityId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('entityType', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isRead', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('message', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
