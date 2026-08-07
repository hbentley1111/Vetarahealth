const router = require('express').Router();
const { db } = require('../db');
const { requireAuth } = require('../middleware');

// All records visible to the current user
router.get('/', requireAuth, (req, res) => {
  let rows;
  if (req.session.role === 'owner') {
    rows = db.prepare(`
      SELECT m.*, p.name AS pet_name FROM medical_records m
      JOIN pets p ON p.id = m.pet_id
      WHERE p.owner_id = ? ORDER BY m.visited_on DESC`).all(req.session.userId);
  } else {
    rows = db.prepare(`
      SELECT m.*, p.name AS pet_name, u.name AS owner_name FROM medical_records m
      JOIN pets p ON p.id = m.pet_id
      JOIN users u ON u.id = p.owner_id
      JOIN providers pr ON pr.id = m.provider_id
      WHERE pr.user_id = ? ORDER BY m.visited_on DESC`).all(req.session.userId);
  }
  res.json(rows);
});

// Create a record (owner for own pet, or provider for any pet they treat)
router.post('/', requireAuth, (req, res) => {
  const { petId, type, title, diagnosis, note, visitedOn } = req.body || {};
  if (!petId || !title || !visitedOn) return res.status(400).json({ error: 'petId, title, visitedOn required' });
  const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(petId);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });

  let providerId = null, label;
  if (req.session.role === 'owner') {
    if (pet.owner_id !== req.session.userId) return res.status(403).json({ error: 'Not your pet' });
    const u = db.prepare('SELECT name FROM users WHERE id = ?').get(req.session.userId);
    label = `Added by ${u.name} (owner)`;
  } else {
    const prov = db.prepare('SELECT * FROM providers WHERE user_id = ?').get(req.session.userId);
    if (!prov) return res.status(403).json({ error: 'No provider profile' });
    providerId = prov.id;
    label = `${prov.doctor || prov.name} · ${prov.name}`;
  }

  const info = db.prepare(`INSERT INTO medical_records (pet_id,provider_id,author_user_id,type,title,diagnosis,note,visited_on,author_label)
    VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(petId, providerId, req.session.userId, type || 'Routine Checkup', title, diagnosis || null, note || null, visitedOn, label);
  res.status(201).json(db.prepare('SELECT * FROM medical_records WHERE id = ?').get(info.lastInsertRowid));
});

router.delete('/:id', requireAuth, (req, res) => {
  const rec = db.prepare('SELECT m.*, p.owner_id FROM medical_records m JOIN pets p ON p.id = m.pet_id WHERE m.id = ?').get(req.params.id);
  if (!rec) return res.status(404).json({ error: 'Record not found' });
  const owns = req.session.role === 'owner' ? rec.owner_id === req.session.userId : rec.author_user_id === req.session.userId;
  if (!owns) return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM medical_records WHERE id = ?').run(rec.id);
  res.json({ ok: true });
});

module.exports = router;
