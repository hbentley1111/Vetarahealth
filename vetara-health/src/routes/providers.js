const router = require('express').Router();
const { db } = require('../db');
const { requireAuth } = require('../middleware');

function withStats(p) {
  const agg = db.prepare('SELECT COUNT(*) n, AVG(rating) avg FROM reviews WHERE provider_id = ?').get(p.id);
  return { ...p, tags: p.tags ? p.tags.split(',') : [], reviewCount: agg.n, rating: agg.n ? Math.round(agg.avg * 10) / 10 : null };
}

router.get('/', requireAuth, (req, res) => {
  let q = 'SELECT * FROM providers';
  const params = [];
  if (req.query.type && req.query.type !== 'All') { q += ' WHERE type = ?'; params.push(req.query.type); }
  q += ' ORDER BY name';
  res.json(db.prepare(q).all(...params).map(withStats));
});

router.get('/:id', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM providers WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Provider not found' });
  const reviews = db.prepare(`
    SELECT r.*, u.name AS reviewer FROM reviews r JOIN users u ON u.id = r.user_id
    WHERE r.provider_id = ? ORDER BY r.created_at DESC`).all(p.id);
  res.json({ ...withStats(p), reviews });
});

router.post('/:id/reviews', requireAuth, (req, res) => {
  if (req.session.role !== 'owner') return res.status(403).json({ error: 'Only pet owners can review' });
  const p = db.prepare('SELECT * FROM providers WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Provider not found' });
  const { rating, title, text, recommended } = req.body || {};
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'rating 1-5 required' });
  const info = db.prepare('INSERT INTO reviews (provider_id,user_id,rating,title,text,recommended) VALUES (?,?,?,?,?,?)')
    .run(p.id, req.session.userId, rating, title || null, text || null, recommended === false ? 0 : 1);
  res.status(201).json(db.prepare('SELECT * FROM reviews WHERE id = ?').get(info.lastInsertRowid));
});

module.exports = router;
