const router = require('express').Router();
const { db } = require('../db');
const { requireAuth } = require('../middleware');

router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT po.*, u.name AS author, u.role AS author_role, u.clinic_name FROM posts po
    JOIN users u ON u.id = po.user_id ORDER BY po.created_at DESC, po.id DESC`).all();
  res.json(rows);
});

router.post('/', requireAuth, (req, res) => {
  const { text } = req.body || {};
  if (!text || !text.trim()) return res.status(400).json({ error: 'text is required' });
  const info = db.prepare('INSERT INTO posts (user_id,text) VALUES (?,?)').run(req.session.userId, text.trim());
  res.status(201).json(db.prepare('SELECT * FROM posts WHERE id = ?').get(info.lastInsertRowid));
});

router.post('/:id/like', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Post not found' });
  db.prepare('UPDATE posts SET likes = likes + 1 WHERE id = ?').run(p.id);
  res.json({ likes: p.likes + 1 });
});

router.delete('/:id', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Post not found' });
  if (p.user_id !== req.session.userId) return res.status(403).json({ error: 'Not your post' });
  db.prepare('DELETE FROM posts WHERE id = ?').run(p.id);
  res.json({ ok: true });
});

module.exports = router;
