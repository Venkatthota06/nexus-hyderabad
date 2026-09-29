#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/12a1bdc287a89946c09de3ca3812905c8b8a221756e0b31fae50c9325aad6112/contract';
import endContract from '../../snapshots/12a1bdc287a89946c09de3ca3812905c8b8a221756e0b31fae50c9325aad6112/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/cf6347132aa83925220d647deaa29a7506fdaf158925e57b47b4ce3d138bcb53/contract';
import startContract from '../../snapshots/cf6347132aa83925220d647deaa29a7506fdaf158925e57b47b4ce3d138bcb53/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'sample',
        column: col('collectionMonth', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
