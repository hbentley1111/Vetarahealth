const router = require('express').Router();
const { db } = require('../db');
const { requireRole } = require('../middleware');

/* Rule-based assistant grounded in the owner's actual records.
   Swap this for a real LLM call later if desired. */
router.post('/', requireRole('owner'), (req, res) => {
  const q = ((req.body || {}).question || '').toLowerCase();
  if (!q.trim()) return res.status(400).json({ error: 'question required' });

  const pets = db.prepare('SELECT * FROM pets WHERE owner_id = ?').all(req.session.userId);
  const today = new Date().toISOString().slice(0, 10);
  const petData = pets.map(p => ({
    ...p,
    vax: db.prepare('SELECT * FROM vaccinations WHERE pet_id = ?').all(p.id),
    meds: db.prepare('SELECT * FROM medications WHERE pet_id = ? AND active = 1').all(p.id),
    lastRec: db.prepare('SELECT * FROM medical_records WHERE pet_id = ? ORDER BY visited_on DESC LIMIT 1').get(p.id)
  }));
  const names = pets.map(p => p.name).join(', ');
  const due = petData.flatMap(p => p.vax.filter(v => v.due_on && v.due_on < today).map(v => `<b>${p.name}</b>: ${v.name} (due ${v.due_on})`));

  let answer;
  if (/vaccin|shot|booster|rabies|dhpp/.test(q)) {
    answer = due.length
      ? `<b>Vaccination status from your records:</b><br><br>${due.map(d => '• ' + d + ' — <b>overdue</b>').join('<br>')}<br><br>Everything else is current. Want to book a vaccination visit? Head to <b>Find Providers</b> and pick a time.`
      : `Good news — all vaccinations for ${names || 'your pets'} are current according to your records. I'll flag anything as it comes due.`;
  } else if (/med|pill|prescri|dose/.test(q)) {
    const meds = petData.flatMap(p => p.meds.map(m => `• <b>${p.name}</b>: ${m.name} — ${m.dose || ''} (${m.until_note || 'ongoing'})`));
    answer = meds.length ? `<b>Active medications:</b><br><br>${meds.join('<br>')}` : `No active medications on file for ${names || 'your pets'}.`;
  } else if (/appoint|book|visit|schedul/.test(q)) {
    const appts = db.prepare(`SELECT a.*, p.name pet_name, pr.name prov FROM appointments a JOIN pets p ON p.id=a.pet_id JOIN providers pr ON pr.id=a.provider_id WHERE a.owner_id=? AND a.status='confirmed'`).all(req.session.userId);
    answer = appts.length
      ? `<b>Upcoming appointments:</b><br><br>${appts.map(a => `• ${a.reason} — <b>${a.pet_name}</b> at ${a.prov}, ${a.scheduled_at}`).join('<br>')}`
      : 'No upcoming appointments. You can book one from the <b>Find Providers</b> page — records are shared automatically when you book.';
  } else if (/food|diet|nutrition|eat|weight/.test(q)) {
    answer = `<b>Reading a pet food label:</b><br><br>• Named animal protein first ("chicken," not "meat meal")<br>• AAFCO complete-and-balanced statement for the right life stage<br>• Calorie density matched to activity level<br>• For joint support, look for added EPA/DHA and glucosamine<br><br>For a plan tailored to ${names || 'your pets'}, your vet can set calorie targets at the next wellness visit.`;
  } else if (/flea|tick|parasite|heartworm/.test(q)) {
    answer = `<b>Year-round parasite prevention:</b><br><br>• Monthly oral or topical preventive for every pet in the household<br>• Treat all pets simultaneously — 95% of an infestation lives in the environment<br>• Indoor cats need coverage too<br><br>Check the <b>Medications</b> tab on each pet to confirm their preventive is listed and active.`;
  } else if (/dental|teeth|gum/.test(q)) {
    answer = `<b>Dental care essentials:</b><br><br>• Daily brushing with pet-safe enzymatic toothpaste is the gold standard<br>• VOHC-approved dental diets and treats reduce tartar 20–40%<br>• Annual oral exams; professional cleaning when tartar reaches grade 2<br><br>Check each pet's medical history for dental notes from recent exams.`;
  } else if (/senior|old|age|arthrit/.test(q)) {
    answer = `<b>Senior pet care checklist:</b><br><br>• Twice-yearly exams instead of annual<br>• Annual bloodwork + urinalysis to catch kidney/liver changes early<br>• Weight control is the single biggest factor for joint health<br>• Shorter, more frequent walks; ramps instead of stairs`;
  } else {
    const summary = petData.map(p => `• <b>${p.name}</b> (${p.breed || p.species}) — health score ${p.health_score}/100${p.lastRec ? `, last visit: ${p.lastRec.title} (${p.lastRec.visited_on})` : ''}`).join('<br>');
    answer = `I answer from your pets' actual Vetara records — vaccination status, medications, visits, and appointments.<br><br>${summary || 'Add a pet to get started.'}<br><br>Try asking about <b>vaccinations</b>, <b>medications</b>, <b>appointments</b>, <b>nutrition</b>, <b>dental care</b>, or <b>senior care</b>. For anything urgent, contact your veterinarian directly.`;
  }
  res.json({ answer });
});

module.exports = router;
