const router = require('express').Router();
const crypto = require('crypto');
const { db } = require('../db');
const { requireRole } = require('../middleware');

// List my share links (with access logs)
router.get('/', requireRole('owner'), (req, res) => {
  const rows = db.prepare(`
    SELECT s.*, p.name AS pet_name FROM share_links s
    JOIN pets p ON p.id = s.pet_id
    WHERE p.owner_id = ? AND s.revoked = 0
    ORDER BY s.created_at DESC`).all(req.session.userId);
  const log = db.prepare('SELECT * FROM share_access_log WHERE share_id = ? ORDER BY created_at DESC LIMIT 10');
  res.json(rows.map(s => ({
    ...s,
    expired: s.expires_at < new Date().toISOString(),
    log: log.all(s.id)
  })));
});

// Create a share link for a pet
router.post('/', requireRole('owner'), (req, res) => {
  const { petId, purpose, days } = req.body || {};
  const pet = db.prepare('SELECT * FROM pets WHERE id = ? AND owner_id = ?').get(petId, req.session.userId);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const token = crypto.randomBytes(6).toString('base64url'); // unguessable, e.g. 8x2kQm9p
  const d = Math.min(90, Math.max(1, parseInt(days) || 7));
  const expiresAt = new Date(Date.now() + d * 864e5).toISOString();
  const info = db.prepare('INSERT INTO share_links (pet_id,token,purpose,expires_at) VALUES (?,?,?,?)')
    .run(pet.id, token, purpose || 'Grooming', expiresAt);
  const share = db.prepare('SELECT * FROM share_links WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ ...share, url: `/r/${token}` });
});

// Revoke a link
router.delete('/:id', requireRole('owner'), (req, res) => {
  const s = db.prepare(`
    SELECT s.* FROM share_links s JOIN pets p ON p.id = s.pet_id
    WHERE s.id = ? AND p.owner_id = ?`).get(req.params.id, req.session.userId);
  if (!s) return res.status(404).json({ error: 'Link not found' });
  db.prepare('UPDATE share_links SET revoked = 1 WHERE id = ?').run(s.id);
  res.json({ ok: true });
});

module.exports = router;
