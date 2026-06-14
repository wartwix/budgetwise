require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

app.use(cors());
app.use(express.json());

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS transactions (
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
    CREATE TABLE IF NOT EXISTS projects (
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
    CREATE TABLE IF NOT EXISTS budgets (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      UNIQUE(user_id, category)
    );
  `);
  console.log('DB ready');
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token manquant' });
  try {
    req.user = jwt.verify(header.replace('Bearer ', ''), JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Token invalide' });
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1,$2) RETURNING id, email', [email, hash]);
    const token = jwt.sign({ id: rows[0].id, email: rows[0].email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: rows[0] });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email déjà utilisé' });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!rows[0] || !(await bcrypt.compare(password, rows[0].password_hash)))
      return res.status(401).json({ error: 'Identifiants incorrects' });
    const token = jwt.sign({ id: rows[0].id, email: rows[0].email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: rows[0].id, email: rows[0].email } });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── Transactions ──────────────────────────────────────────────────────────────
app.get('/api/transactions', auth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM transactions WHERE user_id=$1 ORDER BY date DESC, created_at DESC', [req.user.id]);
  res.json(rows);
});

app.post('/api/transactions', auth, async (req, res) => {
  const { label, amount, type, category, date, note } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO transactions (user_id,label,amount,type,category,date,note) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [req.user.id, label, Math.abs(parseFloat(amount)), type, category || 'autre', date, note || null]);
  res.status(201).json(rows[0]);
});

app.put('/api/transactions/:id', auth, async (req, res) => {
  const { label, amount, type, category, date, note } = req.body;
  const { rows } = await pool.query(
    'UPDATE transactions SET label=$1,amount=$2,type=$3,category=$4,date=$5,note=$6 WHERE id=$7 AND user_id=$8 RETURNING *',
    [label, Math.abs(parseFloat(amount)), type, category, date, note || null, req.params.id, req.user.id]);
  if (!rows.length) return res.status(404).json({ error: 'Transaction introuvable' });
  res.json(rows[0]);
});

app.delete('/api/transactions/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM transactions WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  res.json({ ok: true });
});

// ── Projects ──────────────────────────────────────────────────────────────────
app.get('/api/projects', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM projects WHERE user_id=$1 ORDER BY id', [req.user.id]);
  res.json(rows);
});

app.post('/api/projects', auth, async (req, res) => {
  const { name, target, icon, color, deadline, description } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO projects (user_id,name,target,icon,color,deadline,description) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [req.user.id, name, parseFloat(target), icon || '🎯', color || '#58a6ff', deadline || null, description || null]);
  res.status(201).json(rows[0]);
});

app.put('/api/projects/:id', auth, async (req, res) => {
  const { name, target, icon, color, status, deadline, description } = req.body;
  const { rows } = await pool.query(
    'UPDATE projects SET name=$1,target=$2,icon=$3,color=$4,status=$5,deadline=$6,description=$7 WHERE id=$8 AND user_id=$9 RETURNING *',
    [name, parseFloat(target), icon, color, status || 'active', deadline || null, description || null, req.params.id, req.user.id]);
  if (!rows.length) return res.status(404).json({ error: 'Projet introuvable' });
  res.json(rows[0]);
});

app.post('/api/projects/:id/allocate', auth, async (req, res) => {
  const { amount } = req.body;
  const val = parseFloat(amount);
  const { rows } = await pool.query(
    'UPDATE projects SET allocated=allocated+$1 WHERE id=$2 AND user_id=$3 RETURNING *',
    [val, req.params.id, req.user.id]);
  if (!rows.length) return res.status(404).json({ error: 'Projet introuvable' });
  // Create matching transaction
  await pool.query(
    'INSERT INTO transactions (user_id,label,amount,type,category,date) VALUES ($1,$2,$3,$4,$5,$6)',
    [req.user.id, `Allocation : ${rows[0].name}`, val, 'depense', 'projets', new Date().toISOString().slice(0,10)]);
  res.json(rows[0]);
});

app.delete('/api/projects/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM projects WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  res.json({ ok: true });
});

// ── Budgets ───────────────────────────────────────────────────────────────────
app.get('/api/budgets', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT category, amount FROM budgets WHERE user_id=$1', [req.user.id]);
  const result = {};
  rows.forEach(r => { result[r.category] = parseFloat(r.amount); });
  res.json(result);
});

app.put('/api/budgets', auth, async (req, res) => {
  const budgets = req.body;
  for (const [category, amount] of Object.entries(budgets)) {
    await pool.query(
      'INSERT INTO budgets (user_id,category,amount) VALUES ($1,$2,$3) ON CONFLICT (user_id,category) DO UPDATE SET amount=$3',
      [req.user.id, category, parseFloat(amount) || 0]);
  }
  res.json({ ok: true });
});

// ── Reset ─────────────────────────────────────────────────────────────────────
app.delete('/api/reset', auth, async (req, res) => {
  await pool.query('DELETE FROM transactions WHERE user_id=$1', [req.user.id]);
  await pool.query('DELETE FROM projects WHERE user_id=$1', [req.user.id]);
  await pool.query('DELETE FROM budgets WHERE user_id=$1', [req.user.id]);
  res.json({ ok: true });
});

initDB().then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)));
