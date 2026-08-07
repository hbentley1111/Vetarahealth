/* Public, no-login vaccination verification pages ("/r/:token").
   Server-rendered so it's fast on any phone. Access is logged for the owner. */
const router = require('express').Router();
const { db } = require('../db');
const { buildVerification } = require('../verification');

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const shell = body => `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Vetara Health — Record Verification</title>
<style>
  :root{--bg:#020713;--card:#0d1726;--card2:#101b2e;--line:#1c2a40;--line2:#27374f;--text:#e6edf6;--muted:#94a3b8;--dim:#64748b;
    --cyan:#22d3ee;--green:#34d399;--amber:#fbbf24;--red:#f87171;--grad:linear-gradient(135deg,#0ea5e9,#3b82f6)}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--text);line-height:1.5;font-size:15px;
    min-height:100vh;display:flex;justify-content:center;padding:20px 14px 50px}
  .wrap{width:100%;max-width:430px}
  .brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:1rem;margin-bottom:16px}
  .brand .mark{width:32px;height:32px;border-radius:9px;background:var(--grad);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(14,165,233,.4)}
  .brand b{color:var(--cyan)}
  .brand small{display:block;font-size:.6rem;font-weight:500;color:var(--dim);letter-spacing:.8px;text-transform:uppercase}
  .banner{border-radius:14px;padding:16px 18px;margin-bottom:14px;display:flex;gap:12px;align-items:flex-start}
  .banner .bt{font-weight:800;font-size:1rem}
  .banner .bs{font-size:.78rem;opacity:.92;margin-top:2px}
  .b-green{background:rgba(52,211,153,.12);border:1px solid rgba(52,211,153,.4);color:var(--green)}
  .b-amber{background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.4);color:var(--amber)}
  .b-red{background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.45);color:var(--red)}
  .card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;margin-bottom:12px}
  .hrow{display:flex;align-items:center;gap:12px}
  .ava{width:50px;height:50px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.2rem;color:#fff;flex-shrink:0}
  .t1{font-weight:700;font-size:.95rem}.t2{font-size:.76rem;color:var(--muted)}.t3{font-size:.7rem;color:var(--dim)}
  .sec{font-size:.72rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.7px;margin:16px 2px 8px}
  .row{display:flex;align-items:center;gap:11px;padding:11px 0;border-bottom:1px solid var(--line)}
  .row:last-child{border:0;padding-bottom:2px}
  .dot{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .d-green{background:rgba(52,211,153,.12);color:var(--green)}.d-amber{background:rgba(251,191,36,.1);color:var(--amber)}.d-red{background:rgba(248,113,113,.12);color:var(--red)}
  .badge{display:inline-flex;font-size:.64rem;font-weight:700;padding:3px 9px;border-radius:99px;white-space:nowrap}
  .g-green{background:rgba(52,211,153,.1);color:var(--green);border:1px solid rgba(52,211,153,.25)}
  .g-amber{background:rgba(251,191,36,.1);color:var(--amber);border:1px solid rgba(251,191,36,.25)}
  .g-red{background:rgba(248,113,113,.1);color:var(--red);border:1px solid rgba(248,113,113,.25)}
  .btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;border:0;border-radius:11px;padding:13px;font-size:.85rem;font-weight:700;cursor:pointer;font-family:inherit;margin-top:10px}
  .btn-p{background:var(--grad);color:#fff;box-shadow:0 4px 16px rgba(14,165,233,.25)}
  .btn-ghost{background:var(--card2);color:var(--text);border:1px solid var(--line2)}
  .btn-warn{background:transparent;color:var(--amber);border:1px solid rgba(251,191,36,.4)}
  .btn[disabled]{opacity:.5}
  .foot{text-align:center;font-size:.68rem;color:var(--dim);margin-top:18px}
  .foot a{color:var(--cyan);text-decoration:none;font-weight:600}
  svg{flex-shrink:0}
</style></head><body><div class="wrap">${body}</div></body></html>`;

const icons = {
  paw: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7"><ellipse cx="7.2" cy="8.5" rx="1.8" ry="2.4"/><ellipse cx="12" cy="6.8" rx="1.8" ry="2.4"/><ellipse cx="16.8" cy="8.5" rx="1.8" ry="2.4"/><path d="M12 11.5c-2.8 0-5.2 2.2-5.2 4.6 0 1.5 1.2 2.4 2.6 2.4 1 0 1.8-.5 2.6-.5s1.6.5 2.6.5c1.4 0 2.6-.9 2.6-2.4 0-2.4-2.4-4.6-5.2-4.6z"/></svg>',
  check: c => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`,
  alert: c => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17.2v.3"/></svg>`,
  shield: c => `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6z"/><path d="m9.2 11.8 2 2 3.6-4"/></svg>`
};

const brand = `<div class="brand"><div class="mark">${icons.paw}</div><div>Vetara <b>Health</b><small>Verified Record Share</small></div></div>`;

function getShare(token) {
  return db.prepare('SELECT * FROM share_links WHERE token = ? AND revoked = 0').get(token);
}

router.get('/:token', (req, res) => {
  const share = getShare(req.params.token);
  if (!share) return res.status(404).send(shell(`${brand}<div class="card" style="text-align:center;padding:34px">
    <div class="t1">Link not found</div><div class="t2" style="margin-top:6px">This verification link is invalid or was revoked by the pet's owner.</div></div>`));
  if (share.expires_at < new Date().toISOString()) return res.send(shell(`${brand}<div class="card" style="text-align:center;padding:34px">
    <div class="t1">Link expired</div><div class="t2" style="margin-top:6px">Ask the owner to share a fresh verification link.</div></div>`));

  db.prepare("INSERT INTO share_access_log (share_id,action,note) VALUES (?,?,?)").run(share.id, 'viewed', req.get('user-agent') || null);
  const v = buildVerification(share);
  if (!v) return res.status(404).send(shell(`${brand}<div class="card">Pet not found.</div>`));

  const banner = v.overall === 'cleared'
    ? `<div class="banner b-green">${icons.check('#34d399')}<div><div class="bt">Cleared for ${esc(v.purpose.toLowerCase())}</div>
       <div class="bs">All required vaccinations are current</div></div></div>`
    : v.overall === 'warning'
    ? `<div class="banner b-amber">${icons.alert('#fbbf24')}<div><div class="bt">Cleared — renewal coming up</div>
       <div class="bs">All required vaccines are valid today, but at least one is due within 30 days</div></div></div>`
    : `<div class="banner b-red">${icons.alert('#f87171')}<div><div class="bt">Not cleared for ${esc(v.purpose.toLowerCase())}</div>
       <div class="bs">${esc(v.items.filter(i => i.status === 'expired' || i.status === 'missing').map(i => `${i.name}: ${i.detail}`).join(' · '))}</div></div></div>`;

  const rows = v.items.map(i => {
    const cls = i.status === 'current' ? 'green' : i.status === 'due-soon' ? 'amber' : 'red';
    const label = { current: 'Current', 'due-soon': 'Due soon', expired: 'Expired', missing: 'Missing' }[i.status];
    const icon = cls === 'green' ? icons.check('#34d399') : icons.alert(cls === 'amber' ? '#fbbf24' : '#f87171');
    return `<div class="row"><div class="dot d-${cls}">${icon}</div>
      <div style="flex:1;min-width:0"><div class="t1" style="font-size:.84rem">${esc(i.name)}</div><div class="t3">${esc(i.detail)}</div></div>
      <span class="badge g-${cls}">${label}</span></div>`;
  }).join('');

  const now = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  const actions = v.overall === 'blocked'
    ? `<button class="btn btn-ghost" onclick="act(this,false)">Note as reviewed</button>
       <button class="btn btn-warn" onclick="act(this,true)">Accept anyway — logged for liability records</button>`
    : `<button class="btn btn-p" onclick="act(this,false)">Confirm for today's appointment</button>`;

  res.send(shell(`${brand}
  ${banner}
  <div class="card"><div class="hrow">
    <div class="ava" style="background:${esc(v.pet.color || 'var(--grad)')}">${esc(v.pet.name[0])}</div>
    <div style="flex:1;min-width:0"><div class="t1">${esc(v.pet.name)}</div>
      <div class="t2">${esc(v.pet.breed || v.pet.species)} · Owner: ${esc(v.ownerName)}</div>
      <div class="t3">Microchip ${esc(v.pet.microchip || '—')}</div></div>
  </div></div>
  <div class="sec">Required for ${esc(v.purpose.toLowerCase())}</div>
  <div class="card">${rows}</div>
  <div class="card" style="background:var(--card2)">
    <div class="hrow" style="gap:9px">${icons.shield('#22d3ee')}
      <div class="t2" style="flex:1">Records verified from <b style="color:var(--text)">${esc(v.source)}</b><br>
      <span class="t3">Checked ${now} · Access logged for the owner · Link expires ${esc(v.expiresAt.slice(0, 10))}</span></div></div>
  </div>
  <div id="actions">${actions}</div>
  <div class="foot">No account needed. Powered by <a href="/">Vetara Health</a> — verified pet health records.</div>
  <script>
    async function act(btn, override){
      document.querySelectorAll('.btn').forEach(b=>b.disabled=true);
      try{
        await fetch(location.pathname + '/confirm', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({override})});
        document.getElementById('actions').innerHTML = '<div class="banner ' + (override?'b-amber':'b-green') + '" style="justify-content:center"><div class="bt" style="font-size:.9rem">' +
          (override ? 'Acceptance recorded — the owner has been notified' : 'Confirmed — the owner has been notified') + '</div></div>';
      }catch(e){ document.querySelectorAll('.btn').forEach(b=>b.disabled=false); }
    }
  </script>`));
});

router.post('/:token/confirm', require('express').json(), (req, res) => {
  const share = getShare(req.params.token);
  if (!share || share.expires_at < new Date().toISOString()) return res.status(404).json({ error: 'Link not available' });
  const override = !!(req.body || {}).override;
  db.prepare('INSERT INTO share_access_log (share_id,action,note) VALUES (?,?,?)')
    .run(share.id, override ? 'override' : 'confirmed', req.get('user-agent') || null);
  res.json({ ok: true });
});

module.exports = router;
