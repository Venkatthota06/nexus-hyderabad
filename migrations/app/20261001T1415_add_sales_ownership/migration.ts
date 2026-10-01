#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/090b637b4ae1f49e954ce27d00ef7e0544a1f901111b151190ea083947c63c97/contract';
import endContract from '../../snapshots/090b637b4ae1f49e954ce27d00ef7e0544a1f901111b151190ea083947c63c97/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/12a1bdc287a89946c09de3ca3812905c8b8a221756e0b31fae50c9325aad6112/contract';
import startContract from '../../snapshots/12a1bdc287a89946c09de3ca3812905c8b8a221756e0b31fae50c9325aad6112/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'lead',
        column: col('salesOwner', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'quotation',
        column: col('salesOwner', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'workOrder',
        column: col('salesOwner', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
