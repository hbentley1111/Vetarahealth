const router = require('express').Router();
const { db } = require('../db');
const { requireAuth, requireRole } = require('../middleware');

router.get('/', requireAuth, (req, res) => {
  let rows;
  if (req.session.role === 'owner') {
    rows = db.prepare(`
      SELECT a.*, p.name AS pet_name, pr.name AS provider_name, pr.doctor
      FROM appointments a
      JOIN pets p ON p.id = a.pet_id
      JOIN providers pr ON pr.id = a.provider_id
      WHERE a.owner_id = ? ORDER BY a.scheduled_at`).all(req.session.userId);
  } else {
    rows = db.prepare(`
      SELECT a.*, p.name AS pet_name, p.breed, u.name AS owner_name
      FROM appointments a
      JOIN pets p ON p.id = a.pet_id
      JOIN users u ON u.id = a.owner_id
      JOIN providers pr ON pr.id = a.provider_id
      WHERE pr.user_id = ? ORDER BY a.scheduled_at`).all(req.session.userId);
  }
  res.json(rows);
});

router.post('/', requireRole('owner'), (req, res) => {
  const { petId, providerId, reason, scheduledAt } = req.body || {};
  if (!petId || !providerId || !reason || !scheduledAt)
    return res.status(400).json({ error: 'petId, providerId, reason, scheduledAt required' });
  const pet = db.prepare('SELECT * FROM pets WHERE id = ? AND owner_id = ?').get(petId, req.session.userId);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const prov = db.prepare('SELECT * FROM providers WHERE id = ?').get(providerId);
  if (!prov) return res.status(404).json({ error: 'Provider not found' });
  const info = db.prepare('INSERT INTO appointments (pet_id,provider_id,owner_id,reason,scheduled_at) VALUES (?,?,?,?,?)')
    .run(petId, providerId, req.session.userId, reason, scheduledAt);
  res.status(201).json(db.prepare('SELECT * FROM appointments WHERE id = ?').get(info.lastInsertRowid));
});

router.patch('/:id', requireAuth, (req, res) => {
  const appt = db.prepare('SELECT a.*, pr.user_id AS provider_user FROM appointments a JOIN providers pr ON pr.id = a.provider_id WHERE a.id = ?').get(req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  const isOwner = appt.owner_id === req.session.userId;
  const isProvider = appt.provider_user === req.session.userId;
  if (!isOwner && !isProvider) return res.status(403).json({ error: 'Forbidden' });

  const { status } = req.body || {};
  const allowed = isProvider ? ['confirmed', 'checked-in', 'completed', 'cancelled'] : ['cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
  db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, appt.id);
  res.json(db.prepare('SELECT * FROM appointments WHERE id = ?').get(appt.id));
});

module.exports = router;
