const router = require('express').Router();
const { db } = require('../db');
const { requireRole } = require('../middleware');

router.get('/', requireRole('owner'), (req, res) => {
  const rows = db.prepare(`
    SELECT r.*, p.name AS pet_name FROM reminders r
    JOIN pets p ON p.id = r.pet_id
    WHERE r.owner_id = ? AND r.done = 0
    ORDER BY CASE r.level WHEN 'red' THEN 0 WHEN 'amber' THEN 1 ELSE 2 END`).all(req.session.userId);
  res.json(rows);
});

router.post('/', requireRole('owner'), (req, res) => {
  const { petId, what, dueNote, level } = req.body || {};
  if (!petId || !what) return res.status(400).json({ error: 'petId and what required' });
  const pet = db.prepare('SELECT * FROM pets WHERE id = ? AND owner_id = ?').get(petId, req.session.userId);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const info = db.prepare('INSERT INTO reminders (pet_id,owner_id,what,due_note,level) VALUES (?,?,?,?,?)')
    .run(petId, req.session.userId, what, dueNote || null, ['red', 'amber', 'green'].includes(level) ? level : 'amber');
  res.status(201).json(db.prepare('SELECT * FROM reminders WHERE id = ?').get(info.lastInsertRowid));
});

router.patch('/:id/done', requireRole('owner'), (req, res) => {
  const r = db.prepare('SELECT * FROM reminders WHERE id = ? AND owner_id = ?').get(req.params.id, req.session.userId);
  if (!r) return res.status(404).json({ error: 'Reminder not found' });
  db.prepare('UPDATE reminders SET done = 1 WHERE id = ?').run(r.id);
  res.json({ ok: true });
});

module.exports = router;
