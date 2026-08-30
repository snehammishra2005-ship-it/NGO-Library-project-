// ---------------------------------------------------------------------
//  Data-backend bootstrap. In mock mode this seeds the in-memory store.
//  In oracle mode it opens an oracledb connection pool and exposes a
//  small query() helper the repositories use.
// ---------------------------------------------------------------------
import { env, isMock } from './env.js';
import { initStore } from '../data/store.js';

let oracledb = null;   // loaded lazily so `mock` mode needs no native driver
let pool = null;

export async function initDb() {
  if (isMock) {
    initStore();
    console.log('[db] mode=mock — in-memory store seeded.');
    return;
  }

  // Lazy import: only require the native oracledb module when actually used.
  oracledb = (await import('oracledb')).default;
  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
  oracledb.autoCommit = true;
  oracledb.fetchAsString = [oracledb.CLOB]; // return CLOB descriptions as strings

  if (env.oracle.clientDir) {
    // Thick mode — required for Oracle XE 11.2.
    oracledb.initOracleClient({ libDir: env.oracle.clientDir });
  }

  pool = await oracledb.createPool({
    user: env.oracle.user,
    password: env.oracle.password,
    connectString: env.oracle.connectString,
    poolMin: 1,
    poolMax: 10,
    poolIncrement: 1,
  });
  console.log(`[db] mode=oracle — connected to ${env.oracle.connectString}`);
}

/**
 * Run a SQL statement against Oracle. Returns { rows, rowsAffected, outBinds }.
 * Only valid when DB_MODE=oracle.
 */
export async function query(sql, binds = {}, options = {}) {
  if (isMock) throw new Error('query() called in mock mode');
  const conn = await pool.getConnection();
  try {
    return await conn.execute(sql, binds, options);
  } finally {
    await conn.close();
  }
}

export async function closeDb() {
  if (pool) await pool.close(5);
}

export function getOracle() {
  return oracledb;
}
