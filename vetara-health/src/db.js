const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite'); // built into Node.js 22.5+ — no native compile needed

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'vetara.db'));
try { db.exec('PRAGMA journal_mode = WAL'); } catch { /* WAL unsupported on some filesystems — fall back to default */ }
db.exec('PRAGMA foreign_keys = ON');

function initDb() {
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('owner','provider')),
    clinic_name TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    sex TEXT,
    dob TEXT,
    weight_kg REAL,
    color TEXT DEFAULT '#3b82f6',
    microchip TEXT,
    tag_id TEXT,
    conditions TEXT DEFAULT '',
    health_score INTEGER DEFAULT 90,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS vaccinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    given_on TEXT,
    due_on TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dose TEXT,
    until_note TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS medical_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES providers(id),
    author_user_id INTEGER REFERENCES users(id),
    type TEXT NOT NULL DEFAULT 'Routine Checkup',
    title TEXT NOT NULL,
    diagnosis TEXT,
    note TEXT,
    visited_on TEXT NOT NULL,
    author_label TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    name TEXT NOT NULL,
    doctor TEXT,
    type TEXT NOT NULL DEFAULT 'Veterinarian',
    distance TEXT,
    tags TEXT DEFAULT '',
    grade TEXT DEFAULT 'A',
    grade_word TEXT DEFAULT 'Excellent',
    services TEXT,
    icon TEXT DEFAULT 'steth',
    gradient TEXT DEFAULT 'var(--grad)',
    metrics TEXT,
    rec_rate INTEGER DEFAULT 90,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS insurance_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    carrier TEXT NOT NULL,
    premium TEXT,
    coverage TEXT,
    discount INTEGER DEFAULT 0,
    saved_note TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS insurance_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    what TEXT NOT NULL,
    amount TEXT,
    status TEXT DEFAULT 'Processing' CHECK(status IN ('Processing','Reimbursed','Denied')),
    claimed_on TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    text TEXT NOT NULL,
    image_style TEXT,
    image_caption TEXT,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    sponsored INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS open_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    service TEXT NOT NULL,
    slot_at TEXT NOT NULL,
    cause TEXT DEFAULT 'Cancellation',
    radius INTEGER DEFAULT 30,
    reached INTEGER DEFAULT 0,
    incentive TEXT,
    status TEXT DEFAULT 'open' CHECK(status IN ('open','claimed','expired')),
    claimed_by TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    title TEXT,
    text TEXT,
    recommended INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    provider_id INTEGER NOT NULL REFERENCES providers(id),
    owner_id INTEGER NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    scheduled_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed','checked-in','completed','cancelled')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    owner_id INTEGER NOT NULL REFERENCES users(id),
    what TEXT NOT NULL,
    due_note TEXT,
    level TEXT DEFAULT 'amber' CHECK(level IN ('red','amber','green')),
    done INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
  `);
}

module.exports = { db, initDb };
