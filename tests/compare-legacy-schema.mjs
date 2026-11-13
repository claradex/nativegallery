import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const historicalUrl = process.env.HISTORICAL_DATABASE_URL;
const baselineUrl = process.env.BASELINE_DATABASE_URL;
if (!historicalUrl || !baselineUrl) {
  throw new Error('Set HISTORICAL_DATABASE_URL and BASELINE_DATABASE_URL to the two prepared databases.');
}

const historical = new PrismaClient({ datasourceUrl: historicalUrl });
const baseline = new PrismaClient({ datasourceUrl: baselineUrl });

async function schema(client) {
  const tables = await client.$queryRaw`
    SELECT TABLE_NAME, ENGINE, TABLE_COLLATION
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_NAME
  `;
  const legacy = tables.filter(table => !['_prisma_migrations', 'ng_jobs', 'ng_job_schedules'].includes(table.TABLE_NAME));
  const names = new Set(legacy.map(table => table.TABLE_NAME));
  const columns = await client.$queryRaw`
    SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT,
      CHARACTER_SET_NAME, COLLATION_NAME, EXTRA
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    ORDER BY TABLE_NAME, COLUMN_NAME
  `;
  const indexes = await client.$queryRaw`
    SELECT TABLE_NAME, INDEX_NAME, NON_UNIQUE, SEQ_IN_INDEX, COLUMN_NAME,
      SUB_PART, COLLATION, INDEX_TYPE
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
  `;
  return {
    tables: legacy,
    columns: columns.filter(column => names.has(column.TABLE_NAME)),
    indexes: indexes.filter(index => names.has(index.TABLE_NAME)),
  };
}

try {
  const [expected, actual] = await Promise.all([schema(historical), schema(baseline)]);
  assert.ok(expected.tables.some(table => table.TABLE_NAME === 'photos'), 'Historical schema must contain photos');
  for (const section of ['tables', 'columns', 'indexes']) {
    assert.deepEqual(actual[section], expected[section], 'Schema mismatch in ' + section);
  }
  console.log('Matched ' + actual.tables.length + ' tables, ' + actual.columns.length + ' columns and ' + actual.indexes.length + ' index entries.');
} finally {
  await Promise.all([historical.$disconnect(), baseline.$disconnect()]);
}
