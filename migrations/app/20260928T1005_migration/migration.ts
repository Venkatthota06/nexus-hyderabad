#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/4522b5211cca72564764e58a8423ffe38d02fb7bd103236c9c5ae1baeda49bc6/contract';
import startContract from '../../snapshots/4522b5211cca72564764e58a8423ffe38d02fb7bd103236c9c5ae1baeda49bc6/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/cf6347132aa83925220d647deaa29a7506fdaf158925e57b47b4ce3d138bcb53/contract';
import endContract from '../../snapshots/cf6347132aa83925220d647deaa29a7506fdaf158925e57b47b4ce3d138bcb53/contract.json' with { type: 'json' };
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
      this.addColumn({
        schema: 'public',
        table: 'sample',
        column: col('locationId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.createIndex({
        schema: 'public',
        table: 'sample',
        index: 'sample_locationId_idx_7aae3038',
        columns: ['locationId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'sample',
        foreignKey: {
          name: 'sample_locationId_fkey',
          columns: ['locationId'],
          references: { schema: 'public', table: 'location', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
