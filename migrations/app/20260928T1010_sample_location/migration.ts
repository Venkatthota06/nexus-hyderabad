#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/cf6347132aa83925220d647deaa29a7506fdaf158925e57b47b4ce3d138bcb53/contract';
import endContract from '../../snapshots/cf6347132aa83925220d647deaa29a7506fdaf158925e57b47b4ce3d138bcb53/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e31a6f470cd292c272a5b4b49bcaca910c37b1e3e21c12f62fb0010eba76977b/contract';
import startContract from '../../snapshots/e31a6f470cd292c272a5b4b49bcaca910c37b1e3e21c12f62fb0010eba76977b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
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
