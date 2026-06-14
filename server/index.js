require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(cors());
app.use(express.json());

// ── DB init ────────────────────────────────────────────────────────────────────
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
      description TEXT NOT NULL,
      montant NUMERIC(10,2) NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('revenu','depense')),
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      target NUMERIC(10,2) NOT NULL,
      saved NUMERIC(10,2) NOT NULL DEFAULT 0
    );
  `);
  console.log('DB ready');
}

// ── Auth middleware ────────────────────────────────────────────────────────────
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

// ── Routes auth ───────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hash]
    );
    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email déjà utilisé' });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: 'Identifiants incorrects' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── Routes transactions ────────────────────────────────────────────────────────
app.get('/api/transactions', auth, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC, created_at DESC',
    [req.user.id]
  );
  res.json(rows);
});

app.post('/api/transactions', auth, async (req, res) => {
  const { description, montant, type, date } = req.body;
  if (!description || !montant || !type) return res.status(400).json({ error: 'Champs manquants' });
  const { rows } = await pool.query(
    'INSERT INTO transactions (user_id, description, montant, type, date) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [req.user.id, description, Math.abs(parseFloat(montant)), type, date || new Date().toISOString().slice(0,10)]
  );
  res.status(201).json(rows[0]);
});

// ── Routes projects ────────────────────────────────────────────────────────────
app.get('/api/projects', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM projects WHERE user_id = $1', [req.user.id]);
  res.json(rows);
});

app.post('/api/projects', auth, async (req, res) => {
  const { name, target } = req.body;
  if (!name || !target) return res.status(400).json({ error: 'Champs manquants' });
  const { rows } = await pool.query(
    'INSERT INTO projects (user_id, name, target) VALUES ($1,$2,$3) RETURNING *',
    [req.user.id, name, parseFloat(target)]
  );
  res.status(201).json(rows[0]);
});

app.patch('/api/projects/:id/allocate', auth, async (req, res) => {
  const { amount } = req.body;
  const { rows } = await pool.query(
    'UPDATE projects SET saved = saved + $1 WHERE id = $2 AND user_id = $3 RETURNING *',
    [parseFloat(amount), req.params.id, req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Projet introuvable' });
  res.json(rows[0]);
});

// ── Start ──────────────────────────────────────────────────────────────────────
initDB().then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)));
