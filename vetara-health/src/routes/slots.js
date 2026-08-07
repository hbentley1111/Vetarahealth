const router = require('express').Router();
const { db } = require('../db');
const { requireAuth, requireRole } = require('../middleware');

// Owners see open slots; providers see their own broadcast history
router.get('/', requireAuth, (req, res) => {
  if (req.session.role === 'owner') {
    const rows = db.prepare(`
      SELECT s.*, pr.name AS provider_name, pr.distance, pr.gradient, pr.icon FROM open_slots s
      JOIN providers pr ON pr.id = s.provider_id
      WHERE s.status = 'open' ORDER BY s.slot_at`).all();
    return res.json(rows);
  }
  const prov = db.prepare('SELECT * FROM providers WHERE user_id = ?').get(req.session.userId);
  if (!prov) return res.json([]);
  res.json(db.prepare('SELECT * FROM open_slots WHERE provider_id = ? ORDER BY created_at DESC, id DESC').all(prov.id));
});

// Provider broadcasts an open slot
router.post('/', requireRole('provider'), (req, res) => {
  const prov = db.prepare('SELECT * FROM providers WHERE user_id = ?').get(req.session.userId);
  if (!prov) return res.status(403).json({ error: 'No provider profile' });
  const { service, slotAt, cause, radius, incentive } = req.body || {};
  if (!service || !slotAt) return res.status(400).json({ error: 'service and slotAt required' });
  const r = Math.min(50, Math.max(5, parseInt(radius) || 30));
  const reached = Math.max(40, Math.round(2314 * (r * r) / 900)); // estimated reach model from prototype
  const info = db.prepare(`INSERT INTO open_slots (provider_id,service,slot_at,cause,radius,reached,incentive)
    VALUES (?,?,?,?,?,?,?)`)
    .run(prov.id, service, slotAt, cause || 'Manual broadcast', r, reached, incentive || null);
  res.status(201).json(db.prepare('SELECT * FROM open_slots WHERE id = ?').get(info.lastInsertRowid));
});

// Owner claims a slot → creates an appointment
router.post('/:id/claim', requireRole('owner'), (req, res) => {
  const slot = db.prepare("SELECT * FROM open_slots WHERE id = ? AND status = 'open'").get(req.params.id);
  if (!slot) return res.status(404).json({ error: 'Slot no longer available' });
  const { petId } = req.body || {};
  const pet = db.prepare('SELECT * FROM pets WHERE id = ? AND owner_id = ?').get(petId, req.session.userId);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const user = db.prepare('SELECT name FROM users WHERE id = ?').get(req.session.userId);

  db.prepare("UPDATE open_slots SET status = 'claimed', claimed_by = ? WHERE id = ?")
    .run(`${user.name} & ${pet.name}`, slot.id);
  const info = db.prepare('INSERT INTO appointments (pet_id,provider_id,owner_id,reason,scheduled_at) VALUES (?,?,?,?,?)')
    .run(pet.id, slot.provider_id, req.session.userId, slot.service + (slot.incentive ? ` (${slot.incentive})` : ''), slot.slot_at);
  res.status(201).json(db.prepare('SELECT * FROM appointments WHERE id = ?').get(info.lastInsertRowid));
});

module.exports = router;
