const { db } = require('./db');

/* Which vaccines a business type needs to see, by species.
   Owners share only what's required — nothing more. */
const REQUIRED = {
  Grooming: { Dog: ['Rabies', 'Bordetella'], Cat: ['Rabies'], default: ['Rabies'] },
  Boarding: { Dog: ['Rabies', 'Bordetella', 'DHPP'], Cat: ['Rabies', 'FVRCP'], default: ['Rabies'] },
  'Dog park': { Dog: ['Rabies', 'DHPP'], default: ['Rabies'] },
  Daycare: { Dog: ['Rabies', 'Bordetella', 'DHPP'], Cat: ['Rabies', 'FVRCP'], default: ['Rabies'] }
};

function requiredFor(purpose, species) {
  const p = REQUIRED[purpose] || REQUIRED.Grooming;
  return p[species] || p.default;
}

/* Build the verification payload for a share link */
function buildVerification(share) {
  const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(share.pet_id);
  if (!pet) return null;
  const owner = db.prepare('SELECT name FROM users WHERE id = ?').get(pet.owner_id);
  const vax = db.prepare('SELECT * FROM vaccinations WHERE pet_id = ?').all(pet.id);
  const lastRec = db.prepare('SELECT author_label FROM medical_records WHERE pet_id = ? ORDER BY visited_on DESC LIMIT 1').get(pet.id);

  const today = new Date().toISOString().slice(0, 10);
  const soon = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);

  const items = requiredFor(share.purpose, pet.species).map(req => {
    const match = vax.filter(v => v.name.toLowerCase().includes(req.toLowerCase()))
      .sort((a, b) => (b.due_on || '').localeCompare(a.due_on || ''))[0];
    if (!match) return { name: req, status: 'missing', detail: 'No record on file' };
    if (match.due_on && match.due_on < today) return { name: match.name, status: 'expired', detail: `Expired ${match.due_on}` };
    if (match.due_on && match.due_on < soon) return { name: match.name, status: 'due-soon', detail: `Current — due ${match.due_on}` };
    return { name: match.name, status: 'current', detail: `Given ${match.given_on || '—'} · valid through ${match.due_on || '—'}` };
  });

  const overall = items.some(i => i.status === 'expired' || i.status === 'missing') ? 'blocked'
    : items.some(i => i.status === 'due-soon') ? 'warning' : 'cleared';

  return {
    pet, ownerName: owner ? owner.name : '',
    purpose: share.purpose, items, overall,
    source: lastRec ? lastRec.author_label : 'Owner-maintained records',
    expiresAt: share.expires_at
  };
}

module.exports = { requiredFor, buildVerification };
