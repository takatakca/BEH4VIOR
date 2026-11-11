'use strict';
// One row per document, always scoped by the adult's TAKATAK master identity id.
// Production: Postgres (DATABASE_URL). Local development only: a JSON file.

const fs = require('node:fs');
const path = require('node:path');

const MAX_DAYS = 500;

function pgStorage(url) {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: url, max: 5 });
  const put = (id, kind, key, data) => pool.query(
    `insert into beh4vior_docs (identity_id, kind, doc_key, data) values ($1, $2, $3, $4)
     on conflict (identity_id, kind, doc_key) do update set data = excluded.data, updated_at = now()`,
    [id, kind, key, JSON.stringify(data)]);
  return {
    kind: 'postgres',
    async init() {
      await pool.query(`create table if not exists beh4vior_docs (
        identity_id text not null,
        kind text not null,
        doc_key text not null,
        data jsonb not null,
        updated_at timestamptz not null default now(),
        primary key (identity_id, kind, doc_key))`);
    },
    async ping() { await pool.query('select 1'); },
    async getState(id) {
      const child = await pool.query(`select data from beh4vior_docs where identity_id = $1 and kind = 'child' and doc_key = 'child'`, [id]);
      const rows = await pool.query(`select doc_key, data from beh4vior_docs where identity_id = $1 and kind = 'day' order by doc_key desc limit ${MAX_DAYS}`, [id]);
      const days = {};
      for (const r of rows.rows) days[r.doc_key] = r.data;
      return { child: child.rows[0] ? child.rows[0].data : null, days };
    },
    putDay: (id, date, day) => put(id, 'day', date, day),
    putChild: (id, child) => put(id, 'child', 'child', child),
    async deleteAll(id) { await pool.query('delete from beh4vior_docs where identity_id = $1', [id]); },
    close: () => pool.end(),
  };
}

function fileStorage(file) {
  let db = {};
  try { db = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { db = {}; }
  const save = () => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(db)); };
  const mine = id => (db[id] = db[id] || { child: null, days: {} });
  return {
    kind: 'file',
    async init() {},
    async ping() {},
    async getState(id) { const m = db[id] || { child: null, days: {} }; return JSON.parse(JSON.stringify(m)); },
    async putDay(id, date, day) { mine(id).days[date] = day; save(); },
    async putChild(id, child) { mine(id).child = child; save(); },
    async deleteAll(id) { delete db[id]; save(); },
    async close() {},
  };
}

function createStorage(env) {
  if (env.DATABASE_URL) return pgStorage(env.DATABASE_URL);
  if (env.NODE_ENV === 'production') return null; // never keep children's sheets in a container file
  return fileStorage(env.BEH4VIOR_DATA_FILE || path.join(__dirname, '..', 'data', 'dev.json'));
}

module.exports = { createStorage };
