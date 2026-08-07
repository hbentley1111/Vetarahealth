const router = require('express').Router();
const { db } = require('../db');
const { requireAuth, requireRole } = require('../middleware');

function petForUser(req, id) {
  const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(id);
  if (!pet) return null;
  if (req.session.role === 'owner' && pet.owner_id !== req.session.userId) return null;
  return pet;
}

function withDetails(pet) {
  const vaccinations = db.prepare('SELECT * FROM vaccinations WHERE pet_id = ? ORDER BY due_on').all(pet.id)
    .map(v => ({ ...v, status: v.due_on && v.due_on < new Date().toISOString().slice(0, 10) ? 'due' : 'ok' }));
  const medications = db.prepare('SELECT * FROM medications WHERE pet_id = ? AND active = 1').all(pet.id);
  const records = db.prepare('SELECT * FROM medical_records WHERE pet_id = ? ORDER BY visited_on DESC').all(pet.id);
  return { ...pet, vaccinations, medications, records };
}

// Owner: my pets. Provider: pets they have appointments/records with.
router.get('/', requireAuth, (req, res) => {
  let pets;
  if (req.session.role === 'owner') {
    pets = db.prepare('SELECT * FROM pets WHERE owner_id = ? ORDER BY name').all(req.session.userId);
  } else {
    pets = db.prepare(`
      SELECT DISTINCT p.*, u.name AS owner_name FROM pets p
      JOIN users u ON u.id = p.owner_id
      LEFT JOIN appointments a ON a.pet_id = p.id
      LEFT JOIN medical_records m ON m.pet_id = p.id
      JOIN providers pr ON pr.user_id = ?
      WHERE a.provider_id = pr.id OR m.provider_id = pr.id
      ORDER BY p.name`).all(req.session.userId);
  }
  res.json(pets.map(withDetails));
});

router.get('/:id', requireAuth, (req, res) => {
  const pet = petForUser(req, req.params.id);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  res.json(withDetails(pet));
});

router.post('/', requireRole('owner'), (req, res) => {
  const { name, species, breed, sex, dob, weightKg, microchip, conditions } = req.body || {};
  if (!name || !species) return res.status(400).json({ error: 'name and species are required' });
  const grads = ['var(--grad)', 'var(--grad-bp)', 'var(--grad-gm)', 'var(--grad-pp)', 'var(--grad-or)'];
  const tag = 'VET-' + Math.floor(1000 + Math.random() * 9000) + '-' + name.slice(0, 2).toUpperCase();
  const info = db.prepare(`INSERT INTO pets (owner_id,name,species,breed,sex,dob,weight_kg,color,microchip,tag_id,conditions)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(req.session.userId, name, species, breed || null, sex || null, dob || null, weightKg || null,
      grads[Math.floor(Math.random() * grads.length)], microchip || null, tag, conditions || '');
  res.status(201).json(withDetails(db.prepare('SELECT * FROM pets WHERE id = ?').get(info.lastInsertRowid)));
});

router.put('/:id', requireRole('owner'), (req, res) => {
  const pet = petForUser(req, req.params.id);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const { name, breed, sex, dob, weightKg, microchip, conditions } = req.body || {};
  db.prepare(`UPDATE pets SET name=?, breed=?, sex=?, dob=?, weight_kg=?, microchip=?, conditions=? WHERE id=?`)
    .run(name ?? pet.name, breed ?? pet.breed, sex ?? pet.sex, dob ?? pet.dob,
      weightKg ?? pet.weight_kg, microchip ?? pet.microchip, conditions ?? pet.conditions, pet.id);
  res.json(withDetails(db.prepare('SELECT * FROM pets WHERE id = ?').get(pet.id)));
});

router.delete('/:id', requireRole('owner'), (req, res) => {
  const pet = petForUser(req, req.params.id);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  db.prepare('DELETE FROM pets WHERE id = ?').run(pet.id);
  res.json({ ok: true });
});

// Vaccinations
router.post('/:id/vaccinations', requireAuth, (req, res) => {
  const pet = petForUser(req, req.params.id);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const { name, givenOn, dueOn } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const info = db.prepare('INSERT INTO vaccinations (pet_id,name,given_on,due_on) VALUES (?,?,?,?)')
    .run(pet.id, name, givenOn || null, dueOn || null);
  res.status(201).json(db.prepare('SELECT * FROM vaccinations WHERE id = ?').get(info.lastInsertRowid));
});

router.delete('/:id/vaccinations/:vid', requireAuth, (req, res) => {
  const pet = petForUser(req, req.params.id);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  db.prepare('DELETE FROM vaccinations WHERE id = ? AND pet_id = ?').run(req.params.vid, pet.id);
  res.json({ ok: true });
});

// Medications
router.post('/:id/medications', requireAuth, (req, res) => {
  const pet = petForUser(req, req.params.id);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const { name, dose, untilNote } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const info = db.prepare('INSERT INTO medications (pet_id,name,dose,until_note) VALUES (?,?,?,?)')
    .run(pet.id, name, dose || null, untilNote || null);
  res.status(201).json(db.prepare('SELECT * FROM medications WHERE id = ?').get(info.lastInsertRowid));
});

router.delete('/:id/medications/:mid', requireAuth, (req, res) => {
  const pet = petForUser(req, req.params.id);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  db.prepare('UPDATE medications SET active = 0 WHERE id = ? AND pet_id = ?').run(req.params.mid, pet.id);
  res.json({ ok: true });
});

module.exports = router;
