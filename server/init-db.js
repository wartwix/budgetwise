require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

pool.query(`
  DROP TABLE IF EXISTS budgets CASCADE;
  DROP TABLE IF EXISTS transactions CASCADE;
  DROP TABLE IF EXISTS projects CASCADE;
  DROP TABLE IF EXISTS users CASCADE;

  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('revenu','depense')),
    category TEXT NOT NULL DEFAULT 'autre',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target NUMERIC(10,2) NOT NULL,
    allocated NUMERIC(10,2) NOT NULL DEFAULT 0,
    icon TEXT NOT NULL DEFAULT '🎯',
    color TEXT NOT NULL DEFAULT '#58a6ff',
    status TEXT NOT NULL DEFAULT 'active',
    deadline DATE,
    description TEXT
  );
  CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    UNIQUE(user_id, category)
  );
`).then(() => { console.log('DB reset & ready'); process.exit(0); })
  .catch(e => { console.error(e.message); process.exit(1); });
