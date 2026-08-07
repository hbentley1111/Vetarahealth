const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { db } = require('../db');

router.post('/register', (req, res) => {
  const { email, password, name, role, clinicName } = req.body || {};
  if (!email || !password || !name || !['owner', 'provider'].includes(role))
    return res.status(400).json({ error: 'email, password, name and role (owner|provider) are required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (exists) return res.status(409).json({ error: 'An account with that email already exists' });

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (email,password_hash,name,role,clinic_name) VALUES (?,?,?,?,?)')
    .run(email.toLowerCase(), hash, name, role, role === 'provider' ? (clinicName || null) : null);

  if (role === 'provider') {
    db.prepare('INSERT INTO providers (user_id,name,doctor,type) VALUES (?,?,?,?)')
      .run(info.lastInsertRowid, clinicName || `${name}'s Practice`, name, 'Veterinarian');
  }

  req.session.userId = info.lastInsertRowid;
  req.session.role = role;
  res.status(201).json({ id: info.lastInsertRowid, email: email.toLowerCase(), name, role });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Invalid email or password' });
  req.session.userId = user.id;
  req.session.role = user.role;
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role, clinicName: user.clinic_name });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not signed in' });
  const user = db.prepare('SELECT id,email,name,role,clinic_name FROM users WHERE id = ?').get(req.session.userId);
  if (!user) return res.status(401).json({ error: 'Not signed in' });
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role, clinicName: user.clinic_name });
});

module.exports = router;
