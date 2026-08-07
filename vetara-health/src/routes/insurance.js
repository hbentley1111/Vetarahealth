const router = require('express').Router();
const { db } = require('../db');
const { requireRole } = require('../middleware');

const TIERS = [['Excellent Health (90–100)', '25% discount'], ['Good Health (80–89)', '20% discount'], ['Fair Health (70–79)', '15% discount']];

router.get('/', requireRole('owner'), (req, res) => {
  const policies = db.prepare(`
    SELECT ip.*, p.name AS pet_name, p.color, p.health_score FROM insurance_policies ip
    JOIN pets p ON p.id = ip.pet_id WHERE p.owner_id = ?`).all(req.session.userId);
  const claims = db.prepare(`
    SELECT ic.*, p.name AS pet_name FROM insurance_claims ic
    JOIN pets p ON p.id = ic.pet_id WHERE p.owner_id = ? ORDER BY ic.claimed_on DESC`).all(req.session.userId);
  res.json({ policies, claims, tiers: TIERS });
});

module.exports = router;
