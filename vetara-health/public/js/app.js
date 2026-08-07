/* ============ Vetara Health SPA ============ */
const $ = id => document.getElementById(id);
let S = { user: null, screen: 'dash', pet: null, provider: null, provType: 'All', cache: {} };

const api = async (path, opts = {}) => {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const toast = (m, err = false) => {
  const t = document.createElement('div');
  t.className = 'toast' + (err ? ' err' : '');
  t.innerHTML = I(err ? 'x' : 'check', 16) + m;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
};

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = d => d ? new Date(d + (d.length === 10 ? 'T00:00' : '')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
const fmtDT = d => d ? new Date(d.replace(' ', 'T')).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
const initials = n => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

function qrSvg(seedStr = 'VETARA') {
  let seed = 0; for (const ch of seedStr) seed = (seed * 31 + ch.charCodeAt(0)) % 997;
  let c = '';
  const rnd = (i, j) => ((i * 7 + j * 13 + i * j * 3 + seed) % 5) < 2;
  for (let i = 0; i < 21; i++) for (let j = 0; j < 21; j++) {
    const f = (i < 7 && j < 7) || (i < 7 && j > 13) || (i > 13 && j < 7);
    if (f) {
      const oi = i < 7 ? 0 : 14, oj = j < 7 ? 0 : 14, di = i - oi, dj = j - oj;
      if (di === 0 || di === 6 || dj === 0 || dj === 6 || (di > 1 && di < 5 && dj > 1 && dj < 5)) c += `<rect x="${j * 8}" y="${i * 8}" width="8" height="8"/>`;
    } else if (rnd(i, j)) c += `<rect x="${j * 8}" y="${i * 8}" width="8" height="8"/>`;
  }
  return `<svg viewBox="0 0 168 168" width="100%" height="100%" fill="#0b1626">${c}</svg>`;
}

/* ============ BOOT ============ */
async function boot() {
  try { S.user = await api('/auth/me'); showApp(); }
  catch { showLanding(); }
}

/* ============ LANDING ============ */
function showLanding() {
  $('app').classList.remove('on');
  $('auth').innerHTML = '';
  $('landing').innerHTML = `
  <div class="ticker">Advanced Pet Health Analytics now available — experience the future</div>
  <nav class="top">
    <div class="logo"><div class="mark">${I('paw', 18)}</div><span>Vetara <b>Health</b></span></div>
    <div class="links">
      <a href="#features">Health Records</a><a href="#network">Provider Network</a><a href="#insurance-sect">Insurance</a><a href="#qr-sect">QR Protection</a><a href="#pricing">Pricing</a>
    </div>
    <button class="btn btn-line btn-sm" onclick="showAuth('login','provider')">${I('steth', 15)} For Providers</button>
    <button class="btn btn-ghost btn-sm" onclick="showAuth('login')">Sign In</button>
    <button class="btn btn-p btn-sm" onclick="showAuth('register')">Get Started</button>
  </nav>
  <div class="hero">
    <div>
      <span class="kicker">${I('spark', 13)} Next-Gen Pet Care Platform</span>
      <h1>Advanced Pet<br>Health <em>Management</em></h1>
      <p class="lead">Leverage cutting-edge technology for comprehensive pet health tracking, provider analytics, and intelligent insights that transform veterinary care.</p>
      <div class="cta">
        <button class="btn btn-p" onclick="showAuth('register')">Get Started Free ${I('arrow', 16)}</button>
        <button class="btn btn-ghost" onclick="showAuth('login')">Sign In</button>
      </div>
      <div class="nums">
        <div><div class="v">50K+</div><div class="l">Pets Protected</div></div>
        <div><div class="v">5,000+</div><div class="l">Verified Providers</div></div>
        <div><div class="v">98%</div><div class="l">Uptime SLA</div></div>
        <div><div class="v">24/7</div><div class="l">Support</div></div>
      </div>
    </div>
    <div class="glass">
      <div class="hrow"><div class="gicon" style="background:var(--grad)">${I('chart', 20)}</div>
        <div class="grow"><div class="t1">Health Analytics</div><div class="t2">Real-time insights</div></div>
        <span class="badge bg-green">● Live</span></div>
      <div class="mini"><div class="micon" style="background:var(--grad-gm)">${I('check', 15)}</div>
        <div class="grow"><div class="t">Medical records encrypted &amp; stored</div><div class="bar"><i style="width:100%;background:var(--grad-gm)"></i></div></div></div>
      <div class="mini"><div class="micon" style="background:var(--grad-bp)">${I('bolt', 15)}</div>
        <div class="grow"><div class="t">AI health score: 96/100</div><div class="bar"><i style="width:96%"></i></div></div></div>
      <div class="mini"><div class="micon" style="background:var(--grad-pp)">${I('qr', 15)}</div>
        <div class="grow"><div class="t">Smart QR protection active</div><div class="bar"><i style="width:100%;background:var(--grad-pp)"></i></div></div></div>
      <div class="mini" style="margin-bottom:0"><div class="micon" style="background:var(--grad-or)">${I('coin', 15)}</div>
        <div class="grow"><div class="t">Insurance discount: 25% applied</div><div class="bar"><i style="width:80%;background:var(--grad-or)"></i></div></div></div>
    </div>
  </div>
  <div class="sect center" id="features">
    <span class="kicker">Platform Features</span>
    <h2 class="big">Enterprise-Grade Pet Health Solutions</h2>
    <p class="sub">A comprehensive toolkit designed for modern veterinary practices and pet owners who demand excellence.</p>
    <div class="grid3" style="text-align:left">
      ${[['shield', 'var(--grad)', 'Secure Health Records', 'Bank-grade encryption for all medical data with complete, owner-controlled access logs.'],
         ['bolt', 'var(--grad-bp)', 'AI Health Analytics', 'Machine learning provides predictive health insights and an evolving health score for every pet.'],
         ['qr', 'var(--grad-pp)', 'Smart QR Technology', 'Next-gen collar QR codes with location alerts and emergency protocols.'],
         ['chart', 'var(--grad-gm)', 'Provider Analytics', 'Advanced metrics and performance insights for veterinary providers.'],
         ['coin', 'var(--grad-or)', 'Insurance Integration', 'Seamless integration with major pet insurers — health scores unlock real discounts.'],
         ['clock', 'var(--grad)', '24/7 Monitoring', 'Real-time health monitoring with automated alerts for due care and anomalies.']]
        .map(f => `<div class="card hov feat"><div class="gicon" style="background:${f[1]}">${I(f[0], 20)}</div><h3>${f[2]}</h3><p>${f[3]}</p></div>`).join('')}
    </div>
  </div>
  <div class="sect center" id="network">
    <span class="kicker">Provider Network</span>
    <h2 class="big">Trusted Veterinary Provider Network</h2>
    <p class="sub">Connect with verified veterinarians, specialists, and pet care providers in your area.</p>
    <div class="grid3" style="text-align:left">
      ${[['pin', 'var(--grad)', '5,000+ Providers', 'Nationwide network of verified veterinary professionals.'],
         ['star', 'var(--grad-bp)', 'Quality Verified', 'Every provider is graded on safety, outcomes, communication, and timeliness.'],
         ['clock', 'var(--grad-pp)', '24/7 Availability', 'Emergency care providers available around the clock.']]
        .map(f => `<div class="card hov feat"><div class="gicon" style="background:${f[1]}">${I(f[0], 20)}</div><h3>${f[2]}</h3><p>${f[3]}</p></div>`).join('')}
    </div>
  </div>
  <div class="sect" id="insurance-sect" style="display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center">
    <div>
      <span class="kicker">Insurance Integration</span>
      <h2 class="big">Smart Insurance Management</h2>
      <p class="muted" style="margin-bottom:28px">Seamlessly integrate with major pet insurance providers and optimize your coverage.</p>
      ${[['check', 'var(--grad-gm)', 'Health Score Discounts', "Earn up to 25% insurance discounts based on your pet's health score."],
         ['bolt', 'var(--grad-bp)', 'Automated Claims', 'Streamlined claim processing with digital health records.'],
         ['chart', 'var(--grad-pp)', 'Coverage Optimization', 'AI-powered recommendations for optimal insurance coverage.']]
        .map(f => `<div class="hrow" style="margin-bottom:20px"><div class="gicon" style="background:${f[1]};width:38px;height:38px">${I(f[0], 17)}</div>
          <div><div class="t1">${f[2]}</div><div class="t2">${f[3]}</div></div></div>`).join('')}
    </div>
    <div class="card" style="padding:30px">
      <div class="gicon" style="background:var(--grad-gm);width:56px;height:56px;margin:0 auto 16px">${I('coin', 26)}</div>
      <div class="center"><div style="font-size:1.5rem;font-weight:800">Save up to $2,400/year</div>
      <div class="t2" style="margin-bottom:18px">Average savings with health score optimization</div></div>
      ${[['Excellent Health (90–100)', '25% discount'], ['Good Health (80–89)', '20% discount'], ['Fair Health (70–79)', '15% discount']]
        .map(t => `<div class="tierrow"><span class="muted">${t[0]}</span><b style="color:var(--green)">${t[1]}</b></div>`).join('')}
    </div>
  </div>
  <div class="sect" id="qr-sect" style="display:grid;grid-template-columns:1fr 1.2fr;gap:60px;align-items:center">
    <div class="card center" style="padding:34px">
      <div class="qrbox">${qrSvg('LANDING')}</div>
      <div class="t1" style="margin-top:18px">Instant Pet ID</div>
      <div class="t2">Scan to access pet information, medical history, and emergency contacts</div>
    </div>
    <div>
      <span class="kicker">QR Protection Technology</span>
      <h2 class="big">Next-Generation Pet Identification</h2>
      <p class="muted" style="margin-bottom:28px">Smart QR codes with location alerts, emergency protocols, and instant access to critical information.</p>
      ${[['pin', 'var(--grad)', 'Location Alerts', "Real-time location updates the moment your pet's tag is scanned."],
         ['bell', 'var(--grad-or)', 'Emergency Protocol', 'Automatic alerts to emergency contacts and nearby veterinarians.'],
         ['shield', 'var(--grad-gm)', 'Secure & Private', "End-to-end encryption protects your pet's sensitive information."]]
        .map(f => `<div class="hrow" style="margin-bottom:20px"><div class="gicon" style="background:${f[1]};width:38px;height:38px">${I(f[0], 17)}</div>
          <div><div class="t1">${f[2]}</div><div class="t2">${f[3]}</div></div></div>`).join('')}
    </div>
  </div>
  <div class="sect center" id="pricing">
    <span class="kicker">${I('steth', 13)} Veterinary Professionals</span>
    <h2 class="big">The Provider Portal</h2>
    <p class="sub">A dedicated workspace for vets, groomers, and trainers to access patient records, submit visit notes, and manage their practice — all in one place.</p>
    <div class="grid3" style="text-align:left">
      ${[['BASIC', '$29.99', 'Up to 50 patients', 0, ['Full medical history access', 'AI document import', 'Record submission', 'Appointment reminders to clients', 'HIPAA-compliant platform']],
         ['PRO', '$49.99', 'Up to 150 patients', 1, ['Everything in Basic', 'Priority patient access', 'Email record parsing', 'Open-slot broadcasts (Smart Fill)', 'Advanced analytics']],
         ['ENTERPRISE', '$99.99', 'Up to 500 patients', 0, ['Everything in Pro', 'Custom notification workflows', 'Dedicated support', 'Custom integrations', 'Multi-provider accounts']]]
        .map(p => `<div class="card price ${p[3] ? 'pop' : ''}">${p[3] ? '<span class="poptag">Most Popular</span>' : ''}
          <div class="tier">${p[0]}</div><div class="amt">${p[1]}<small> /mo</small></div><div class="t2">${p[2]}</div>
          <ul>${p[4].map(f => `<li>${I('check', 14)}${f}</li>`).join('')}</ul>
          <button class="btn ${p[3] ? 'btn-p' : 'btn-ghost'}" onclick="showAuth('register','provider')">Start 30-Day Free Trial</button></div>`).join('')}
    </div>
    <div class="t3" style="margin-top:18px">All plans include a 30-day free trial. No credit card required.</div>
  </div>
  <div class="sect grid2" id="analytics" style="padding-top:0">
    <div class="card" style="padding:28px">
      <div class="hrow" style="margin-bottom:14px"><div class="gicon" style="background:var(--grad)">${I('heart', 19)}</div>
        <div><div class="t1" style="font-size:1.05rem">I'm a Pet Owner</div><div class="t2">Manage health records &amp; share access</div></div></div>
      <ul style="list-style:none;margin-bottom:20px">${['Store lifelong medical records in one place', 'Book with verified providers instantly', 'Get a QR code for emergency identification', 'Track vaccinations, visits & prescriptions'].map(f => `<li style="display:flex;gap:9px;font-size:.82rem;color:var(--muted);padding:5px 0">${I('check', 14)}<span>${f}</span></li>`).join('')}</ul>
      <div style="display:flex;gap:10px"><button class="btn btn-p" style="flex:1" onclick="showAuth('register')">Create Free Account</button><button class="btn btn-ghost" style="flex:1" onclick="showAuth('login')">Sign In</button></div>
    </div>
    <div class="card" style="padding:28px;border-color:rgba(59,130,246,.4)">
      <div class="hrow" style="margin-bottom:14px"><div class="gicon" style="background:var(--grad-bp)">${I('steth', 19)}</div>
        <div class="grow"><div class="t1" style="font-size:1.05rem">I'm a Veterinary Professional</div><div class="t2">Vets · Groomers · Trainers</div></div>
        <span class="badge bg-blue">Pro Portal</span></div>
      <ul style="list-style:none;margin-bottom:20px">${["Access records for patients who've booked you", 'Submit visit notes & treatment records directly', 'Broadcast open slots to nearby owners', 'Manage your reviews and reputation'].map(f => `<li style="display:flex;gap:9px;font-size:.82rem;color:var(--muted);padding:5px 0">${I('check', 14)}<span>${f}</span></li>`).join('')}</ul>
      <div style="display:flex;gap:10px"><button class="btn btn-p" style="flex:1;background:var(--grad-bp)" onclick="showAuth('login','provider')">Sign In to Provider Portal</button><button class="btn btn-ghost" style="flex:1" onclick="showAuth('register','provider')">Register as Provider</button></div>
      <div class="t3 center" style="margin-top:12px">30-day free trial · No credit card required</div>
    </div>
  </div>
  <footer>
    <div class="col">
      <div class="logo" style="margin-bottom:12px"><div class="mark">${I('paw', 18)}</div><span>Vetara <b>Health</b></span></div>
      <div class="t2" style="max-width:260px">Enterprise-grade pet health management platform for the modern world.</div>
      <div class="t3" style="margin-top:18px">© 2026 Vetara Health. Enterprise-grade pet health solutions.</div>
    </div>
    <div class="col"><h4>Platform</h4><a onclick="showAuth('login')">Health Records</a><a onclick="showAuth('login')">QR Technology</a><a onclick="showAuth('login')">Provider Network</a><a onclick="showAuth('login')">Analytics Dashboard</a></div>
    <div class="col"><h4>Enterprise</h4><a onclick="showAuth('login')">Insurance</a><a onclick="showAuth('login','provider')">Provider Portal</a><a onclick="showAuth('login')">Dashboard</a><a onclick="showAuth('login')">Directory</a></div>
    <div class="col"><h4>Legal</h4><a onclick="toast('Coming soon')">Privacy</a><a onclick="toast('Coming soon')">Terms</a><a onclick="toast('Coming soon')">Security</a></div>
  </footer>`;
  window.scrollTo(0, 0);
}

/* ============ AUTH ============ */
let authState = { mode: 'login', role: 'owner' };
function showAuth(mode, role) {
  authState = { mode, role: role || 'owner' };
  renderAuth();
}
function renderAuth(errMsg = '') {
  $('landing').innerHTML = '';
  $('app').classList.remove('on');
  const { mode, role } = authState;
  $('auth').innerHTML = `
  <div class="auth-wrap"><div class="auth-card screen">
    <div class="logo"><div class="mark">${I('paw', 18)}</div><span>Vetara <b>Health</b></span></div>
    <h2>${mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
    <div class="t2">${mode === 'login' ? 'Sign in to your account' : 'Join the pet health platform'}</div>
    ${mode === 'register' ? `
    <div class="rolepick">
      <button class="${role === 'owner' ? 'on' : ''}" onclick="authState.role='owner';renderAuth()">${I('paw', 15)} Pet Owner</button>
      <button class="${role === 'provider' ? 'on' : ''}" onclick="authState.role='provider';renderAuth()">${I('steth', 15)} Provider</button>
    </div>` : ''}
    <form class="field" onsubmit="submitAuth(event)">
      ${mode === 'register' ? `<label>Full name</label><input id="a-name" required placeholder="Jane Doe">` : ''}
      ${mode === 'register' && role === 'provider' ? `<label>Clinic / practice name</label><input id="a-clinic" placeholder="Riverbend Animal Hospital">` : ''}
      <label>Email</label><input id="a-email" type="email" required placeholder="you@example.com">
      <label>Password</label><input id="a-pass" type="password" required minlength="8" placeholder="••••••••">
      <div class="auth-err">${esc(errMsg)}</div>
      <button class="btn btn-p" style="width:100%" type="submit">${mode === 'login' ? 'Sign In' : 'Create Account'} ${I('arrow', 15)}</button>
    </form>
    <div class="auth-alt">
      ${mode === 'login'
        ? `No account? <a onclick="showAuth('register')">Create one</a> · <a onclick="showLanding()">Back to site</a>`
        : `Have an account? <a onclick="showAuth('login')">Sign in</a> · <a onclick="showLanding()">Back to site</a>`}
    </div>
    <div class="demo-box"><b>Demo accounts</b> (after running <b>npm run seed</b>) — password <b>demo1234</b><br>
      Owner: sarah@demo.vetara · Provider: elena@demo.vetara</div>
  </div></div>`;
}
async function submitAuth(e) {
  e.preventDefault();
  const { mode, role } = authState;
  try {
    const body = { email: $('a-email').value, password: $('a-pass').value };
    if (mode === 'register') {
      body.name = $('a-name').value;
      body.role = role;
      if (role === 'provider') body.clinicName = $('a-clinic').value;
    }
    S.user = await api(`/auth/${mode}`, { method: 'POST', body });
    $('auth').innerHTML = '';
    S.screen = 'dash';
    showApp();
  } catch (err) { renderAuth(err.message); }
}
async function logout() {
  await api('/auth/logout', { method: 'POST' });
  S = { user: null, screen: 'dash', pet: null, provider: null, provType: 'All', cache: {} };
  showLanding();
}

/* ============ APP SHELL ============ */
function showApp() {
  $('landing').innerHTML = '';
  $('auth').innerHTML = '';
  $('app').classList.add('on');
  go(S.screen || 'dash');
}
function go(screen, extra = {}) {
  Object.assign(S, { screen }, extra);
  render();
  window.scrollTo(0, 0);
}
function nav() {
  const owner = S.user.role === 'owner';
  const items = owner
    ? [['dash', 'grid', 'Dashboard'], ['pets', 'paw', 'My Pets'], ['records', 'doc', 'Health Records'], ['providers', 'steth', 'Find Providers'], ['grading', 'star', 'Top-Rated Vets'], ['appts', 'cal', 'Appointments'], ['insurance', 'coin', 'Insurance'], ['ai', 'brain', 'AI Vet Assistant'], ['community', 'users', 'Community']]
    : [['dash', 'grid', 'Dashboard'], ['patients', 'paw', 'Patients'], ['appts', 'cal', 'Appointments'], ['slots', 'bolt', 'Open Slots'], ['inbox', 'mail', 'AI Import Inbox'], ['records', 'doc', 'Records'], ['prreviews', 'star', 'Reviews']];
  const active = { petDetail: 'pets', providerDetail: 'providers' }[S.screen] || S.screen;
  $('sidebar').innerHTML = `
    <div class="logo"><div class="mark">${I('paw', 18)}</div><span>Vetara <b>Health</b></span></div>
    <div class="grp">${owner ? 'Pet Owner' : 'Provider Portal'}</div>
    ${items.map(([id, ic, l]) => `<button class="nv ${active === id ? 'on' : ''}" onclick="go('${id}')">${I(ic, 17)} ${l}</button>`).join('')}
    <div class="grp">Account</div>
    <button class="nv" onclick="logout()">${I('out', 17)} Sign Out</button>
    <div class="userbox">
      <div class="uava">${initials(S.user.name)}</div>
      <div class="grow"><div class="t1" style="font-size:.8rem">${esc(S.user.name)}</div>
      <div class="t3">${esc(S.user.clinicName || (owner ? 'Pet Owner' : 'Provider'))}</div></div>
    </div>`;
}
function topbar(title, crumb) {
  $('topbar').innerHTML = `<h1>${title}</h1><span class="crumb">${crumb || ''}</span>`;
}
async function render() {
  nav();
  const fn = {
    dash: S.user.role === 'owner' ? ownerDash : providerDash,
    pets: petsScreen, petDetail: petDetailScreen, records: recordsScreen,
    providers: providersScreen, providerDetail: providerDetailScreen,
    appts: apptsScreen, patients: patientsScreen,
    grading: gradingScreen, insurance: insuranceScreen, ai: aiScreen, community: communityScreen,
    slots: slotsScreen, inbox: inboxScreen, prreviews: prReviewsScreen
  }[S.screen];
  $('page').innerHTML = '<div class="empty">Loading…</div>';
  try { await fn(); } catch (e) { $('page').innerHTML = `<div class="empty">${esc(e.message)}</div>`; }
}

/* ============ OWNER SCREENS ============ */
async function ownerDash() {
  topbar('Dashboard', 'Overview');
  const [pets, reminders, appts] = await Promise.all([api('/pets'), api('/reminders'), api('/appointments')]);
  S.cache.pets = pets;
  const avg = pets.length ? Math.round(pets.reduce((a, p) => a + p.health_score, 0) / pets.length) : 0;
  const upcoming = appts.filter(a => a.status === 'confirmed');
  $('page').innerHTML = `<div class="screen">
  <div class="statgrid">
    ${[[pets.length, 'My pets', 'paw', 'var(--grad)'],
       [avg + '/100', 'Avg health score', 'bolt', 'var(--grad-bp)'],
       [reminders.length, 'Open reminders', 'bell', 'var(--grad-or)'],
       [upcoming.length, 'Upcoming appointments', 'cal', 'var(--grad-gm)']]
      .map(s => `<div class="card stat"><div class="gicon" style="background:${s[3]};width:36px;height:36px">${I(s[2], 17)}</div>
        <div class="v">${s[0]}</div><div class="l">${s[1]}</div></div>`).join('')}
  </div>
  <div class="twocol">
    <div>
      <h3 class="sec">Care reminders <span class="seemore" onclick="openReminderModal()">+ Add reminder</span></h3>
      <div class="card">
        ${reminders.length ? reminders.map(r => `
        <div class="rowitem">
          <span class="badge ${r.level === 'red' ? 'bg-red' : 'bg-amber'}">${r.level === 'red' ? 'Overdue' : 'Upcoming'}</span>
          <div class="grow"><div class="t1">${esc(r.what)}</div><div class="t2">${esc(r.pet_name)} · ${esc(r.due_note || '')}</div></div>
          <button class="btn btn-ghost btn-sm" onclick="doneReminder(${r.id})">${I('check', 13)} Done</button>
        </div>`).join('') : '<div class="empty">No open reminders — nice work.</div>'}
      </div>
      <h3 class="sec">My pets <span class="seemore" onclick="go('pets')">View all</span></h3>
      ${pets.map(petCard).join('') || '<div class="card empty">No pets yet — add your first pet.</div>'}
    </div>
    <div>
      <h3 class="sec">Upcoming appointments</h3>
      <div class="card">
        ${upcoming.length ? upcoming.map(a => `
        <div class="rowitem">
          <div class="gicon" style="background:var(--grad);width:36px;height:36px">${I('cal', 16)}</div>
          <div class="grow"><div class="t1">${esc(a.reason)}</div>
          <div class="t2">${esc(a.pet_name)} · ${esc(a.provider_name)}</div>
          <div class="t3">${fmtDT(a.scheduled_at)}</div></div>
        </div>`).join('') : '<div class="empty">Nothing scheduled.</div>'}
        <button class="btn btn-line btn-sm" style="width:100%;margin-top:12px" onclick="go('providers')">${I('plus', 13)} Book an appointment</button>
      </div>
    </div>
  </div></div>`;
}

function petCard(p) {
  const due = p.vaccinations.some(v => v.status === 'due');
  return `<div class="card hov" style="margin-bottom:12px" onclick="go('petDetail',{pet:${p.id}})">
    <div class="hrow">
      <div class="pet-head" style="background:${p.color}">${esc(p.name[0])}</div>
      <div class="grow">
        <div class="t1">${esc(p.name)}</div>
        <div class="t2">${esc(p.breed || p.species)} · ${esc(p.sex || '')} · ${p.weight_kg ? p.weight_kg + ' kg' : ''}</div>
        <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
          ${due ? '<span class="badge bg-amber">Vaccines due</span>' : '<span class="badge bg-green">Vaccines current</span>'}
          <span class="badge bg-slate">Health ${p.health_score}</span>
        </div>
      </div>
      <span class="dim">${I('arrow', 17)}</span>
    </div>
  </div>`;
}

async function petsScreen() {
  topbar('My Pets', 'Manage your pets');
  const pets = await api('/pets');
  S.cache.pets = pets;
  $('page').innerHTML = `<div class="screen">
    <div class="filters"><div class="grow"></div>
      <button class="btn btn-p btn-sm" onclick="openPetModal()">${I('plus', 14)} Add pet</button></div>
    ${pets.map(petCard).join('') || '<div class="card empty">No pets yet.</div>'}
  </div>`;
}

async function petDetailScreen() {
  const p = await api('/pets/' + S.pet);
  topbar(p.name, p.breed || p.species);
  const vaxRow = v => `<div class="kv"><div><div class="v" style="text-align:left">${esc(v.name)}</div>
    <div class="t3">Given ${fmtDate(v.given_on)} · Due ${fmtDate(v.due_on)}</div></div>
    <span style="display:flex;gap:8px;align-items:center">
      <span class="badge ${v.status === 'ok' ? 'bg-green' : 'bg-amber'}">${v.status === 'ok' ? 'Current' : 'Due'}</span>
      <button class="btn btn-danger btn-sm" onclick="delVax(${p.id},${v.id})">${I('trash', 12)}</button></span></div>`;
  $('page').innerHTML = `<div class="screen">
  <div class="backbar"><button onclick="go('pets')">${I('back', 17)}</button><div class="t">${esc(p.name)}</div></div>
  <div class="card" style="margin-bottom:18px">
    <div class="hrow">
      <div class="pet-head" style="background:${p.color};width:60px;height:60px;font-size:1.35rem">${esc(p.name[0])}</div>
      <div class="grow">
        <div class="t1" style="font-size:1.1rem">${esc(p.name)}</div>
        <div class="t2">${esc(p.breed || '')} · ${esc(p.sex || '')} · ${p.weight_kg ? p.weight_kg + ' kg' : ''} · DOB ${fmtDate(p.dob)}</div>
        <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">
          <span class="badge bg-green">Health ${p.health_score}/100</span>
          ${(p.conditions || '').split(',').filter(Boolean).map(c => `<span class="badge bg-amber">${esc(c.trim())}</span>`).join('')}
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick='openPetModal(${JSON.stringify(p.id)})'>Edit</button>
    </div>
  </div>
  <div class="twocol">
    <div>
      <h3 class="sec">Medical history <span class="seemore" onclick="openRecordModal(${p.id})">+ Add record</span></h3>
      <div class="card"><div class="tl">
        ${p.records.length ? p.records.map(r => `
        <div class="tl-i ${r.type === 'Emergency' ? 'red' : ''}">
          <div class="hrow" style="align-items:baseline"><div class="t1 grow">${esc(r.title)}</div><div class="t3">${fmtDate(r.visited_on)}</div></div>
          <div class="t2">${esc(r.author_label || '')}</div>
          ${r.diagnosis ? `<div class="t2" style="color:var(--cyan)">${esc(r.diagnosis)}</div>` : ''}
          <div class="t2" style="color:var(--text);margin-top:3px">${esc(r.note || '')}</div>
        </div>`).join('') : '<div class="empty">No records yet.</div>'}
      </div></div>
    </div>
    <div>
      <h3 class="sec">Vaccinations <span class="seemore" onclick="openVaxModal(${p.id})">+ Add</span></h3>
      <div class="card">${p.vaccinations.map(vaxRow).join('') || '<div class="empty">None recorded.</div>'}</div>
      <h3 class="sec">Medications <span class="seemore" onclick="openMedModal(${p.id})">+ Add</span></h3>
      <div class="card">
        ${p.medications.length ? p.medications.map(m => `<div class="kv">
          <div><div class="v" style="text-align:left">${esc(m.name)}</div><div class="t3">${esc(m.dose || '')}</div></div>
          <span style="display:flex;gap:8px;align-items:center"><span class="t2">${esc(m.until_note || '')}</span>
          <button class="btn btn-danger btn-sm" onclick="delMed(${p.id},${m.id})">${I('trash', 12)}</button></span></div>`).join('')
          : '<div class="empty">No active medications.</div>'}
      </div>
      <h3 class="sec">Smart QR Tag</h3>
      <div class="card" style="text-align:center">
        <div class="qrbox" style="width:150px;height:150px">${qrSvg(p.tag_id || p.name)}</div>
        <div class="t1" style="margin-top:12px">${esc(p.tag_id || '—')}</div>
        <div class="t2" style="margin-bottom:14px">Scans show ${esc(p.name)}'s public profile, critical alerts, and your contact preferences — never your address.</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-ghost btn-sm" style="flex:1" onclick="toast('Tag image downloaded')">Download</button>
          <button class="btn btn-p btn-sm" style="flex:1" onclick="toast('Lost-pet mode armed — scans now alert you instantly')">Lost-Pet Mode</button>
        </div>
      </div>
      <h3 class="sec">Identity</h3>
      <div class="card">
        <div class="kv"><span class="k">Microchip</span><span class="v">${esc(p.microchip || '—')}</span></div>
        <div class="kv"><span class="k">QR tag</span><span class="v">${esc(p.tag_id || '—')}</span></div>
        <div class="kv"><span class="k">Species</span><span class="v">${esc(p.species)}</span></div>
      </div>
    </div>
  </div></div>`;
}

async function recordsScreen() {
  topbar('Health Records', 'All visits & documents');
  const all = await api('/records');
  const types = ['All Types', 'Vaccination', 'Routine Checkup', 'Lab Results', 'Emergency', 'Dental', 'Surgery', 'Other'];
  const petNames = ['All Pets', ...new Set(all.map(r => r.pet_name))];
  let recs = all;
  if (S.recType && S.recType !== 'All Types') recs = recs.filter(r => r.type === S.recType);
  if (S.recPet && S.recPet !== 'All Pets') recs = recs.filter(r => r.pet_name === S.recPet);
  $('page').innerHTML = `<div class="screen">
    <div class="statgrid">
      ${[[all.length, 'Total Records'], [all.filter(r => r.type === 'Vaccination').length, 'Vaccinations'],
         [all.filter(r => r.type === 'Routine Checkup').length, 'Routine Checkups'], [all.filter(r => r.type === 'Emergency').length, 'Emergency']]
        .map(s => `<div class="card stat"><div class="l">${s[1]}</div><div class="v">${s[0]}</div></div>`).join('')}
    </div>
    <div class="filters">
      <select onchange="go('records',{recType:this.value})">${types.map(t => `<option ${S.recType === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
      <select onchange="go('records',{recPet:this.value})">${petNames.map(t => `<option ${S.recPet === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>
      <div class="grow"></div>
      ${S.user.role === 'owner' ? `<button class="btn btn-p btn-sm" onclick="openRecordModal()">${I('plus', 14)} Add record</button>` : ''}
    </div>
    <div class="card">
    ${recs.length ? recs.map(r => `
      <div class="rowitem">
        <div class="gicon" style="background:${r.type === 'Emergency' ? 'var(--grad-or)' : r.type === 'Vaccination' ? 'var(--grad-gm)' : 'var(--grad)'};width:38px;height:38px">
          ${I(r.type === 'Vaccination' ? 'syringe' : r.type === 'Lab Results' ? 'chart' : 'doc', 16)}</div>
        <div class="grow">
          <div class="t1">${esc(r.title)} <span class="badge bg-slate" style="margin-left:6px">${esc(r.type)}</span></div>
          <div class="t2">${esc(r.pet_name)}${r.owner_name ? ' · ' + esc(r.owner_name) : ''} · ${esc(r.author_label || '')}</div>
          ${r.diagnosis ? `<div class="t3">${esc(r.diagnosis)}</div>` : ''}
        </div>
        <div class="t3">${fmtDate(r.visited_on)}</div>
      </div>`).join('') : '<div class="empty">No records yet.</div>'}
    </div></div>`;
}

async function providersScreen() {
  topbar('Find Providers', 'Verified network');
  const [provs, slots] = await Promise.all([
    api('/providers' + (S.provType !== 'All' ? '?type=' + encodeURIComponent(S.provType) : '')),
    S.user.role === 'owner' ? api('/slots') : Promise.resolve([])
  ]);
  const types = ['All', 'Veterinarian', 'Emergency', 'Groomer', 'Dog Walker', 'Trainer', 'Boarding'];
  $('page').innerHTML = `<div class="screen">
  ${slots.length ? `
  <div class="card" style="margin-bottom:18px;border-color:rgba(34,211,238,.35)">
    <div class="hrow" style="margin-bottom:6px">
      <div class="gicon" style="background:var(--grad)">${I('bolt', 18)}</div>
      <div class="grow"><div class="t1">Last-minute openings near you</div>
      <div class="t2">Providers broadcast cancellations to owners nearby — claim before they expire</div></div>
      <span class="badge bg-cyan">● Live</span>
    </div>
    ${slots.map(l => `<div class="rowitem">
      <div class="gicon" style="background:var(--card2);border:1px solid var(--line2);width:36px;height:36px;color:var(--cyan)">${I('clock', 15)}</div>
      <div class="grow"><div class="t1" style="font-size:.84rem">${esc(l.provider_name)} <span class="muted" style="font-weight:500">· ${esc(l.distance || '')}</span></div>
      <div class="t2">${esc(l.service)} · <b style="color:var(--text)">${fmtDT(l.slot_at)}</b></div></div>
      ${l.incentive ? `<span class="badge bg-green">${esc(l.incentive)}</span>` : ''}
      <button class="btn btn-p btn-sm" onclick="openClaimModal(${l.id},'${esc(l.provider_name)}')">Claim</button>
    </div>`).join('')}
  </div>` : ''}
  <div class="pills">${types.map(t => `<button class="${S.provType === t ? 'on' : ''}" onclick="go('providers',{provType:'${t}'})">${t}</button>`).join('')}</div>
  ${provs.map(v => `
  <div class="card hov" style="margin-bottom:12px" onclick="go('providerDetail',{provider:${v.id}})">
    <div class="hrow">
      <div class="gicon" style="background:${v.gradient}">${I(v.icon || 'steth', 19)}</div>
      <div class="grow">
        <div class="t1">${esc(v.name)} <span class="badge bg-blue" style="margin-left:6px">${esc(v.grade)}</span></div>
        <div class="t2">${esc(v.doctor || '')} · ${esc(v.distance || '')}</div>
        <div class="hrow" style="gap:6px;margin-top:4px">${v.rating ? stars(v.rating) + `<span class="t3">${v.rating} (${v.reviewCount})</span>` : '<span class="t3">No reviews yet</span>'}
        <span class="badge bg-slate">${esc(v.type)}</span></div>
      </div>
      <span class="dim">${I('arrow', 17)}</span>
    </div>
  </div>`).join('') || '<div class="card empty">No providers of this type.</div>'}
  </div>`;
}

async function providerDetailScreen() {
  const v = await api('/providers/' + S.provider);
  topbar(v.name, v.type);
  $('page').innerHTML = `<div class="screen">
  <div class="backbar"><button onclick="go('providers')">${I('back', 17)}</button><div class="t">${esc(v.name)}</div></div>
  <div class="card" style="margin-bottom:18px">
    <div class="hrow">
      <div class="gicon" style="background:${v.gradient};width:52px;height:52px">${I(v.icon || 'steth', 22)}</div>
      <div class="grow">
        <div class="t1" style="font-size:1.05rem">${esc(v.name)}</div>
        <div class="t2">${esc(v.doctor || '')} · ${esc(v.distance || '')}</div>
        <div class="hrow" style="gap:6px;margin-top:4px">${v.rating ? stars(v.rating, 15) + `<span class="t2"><b>${v.rating}</b> · ${v.reviewCount} verified reviews</span>` : '<span class="t3">No reviews yet</span>'}</div>
        <div style="margin-top:7px;display:flex;gap:6px;flex-wrap:wrap">${v.tags.map(t => `<span class="badge bg-slate">${esc(t)}</span>`).join('')}</div>
      </div>
    </div>
    ${S.user.role === 'owner' ? `<div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn btn-p btn-sm" onclick="openBookModal(${v.id},'${esc(v.name)}')">${I('cal', 14)} Book appointment</button>
      <button class="btn btn-line btn-sm" onclick="openReviewModal(${v.id})">${I('star', 14)} Write a review</button>
    </div>` : ''}
  </div>
  <h3 class="sec">Verified reviews</h3>
  ${v.reviews.length ? v.reviews.map(r => `
  <div class="card" style="margin-bottom:12px">
    <div class="hrow">
      <div class="uava" style="width:32px;height:32px;font-size:.7rem;background:var(--grad-bp)">${initials(r.reviewer)}</div>
      <div class="grow"><div class="t1" style="font-size:.82rem">${esc(r.reviewer)} <span class="badge bg-green" style="margin-left:5px">${I('check', 10)} Verified</span></div>
      <div class="hrow" style="gap:6px">${stars(r.rating, 11)}<span class="t3">${fmtDate(r.created_at?.slice(0, 10))}</span></div></div>
    </div>
    ${r.title ? `<div class="t1" style="margin-top:8px">${esc(r.title)}</div>` : ''}
    <div class="t2" style="color:var(--text);margin-top:4px">${esc(r.text || '')}</div>
  </div>`).join('') : '<div class="card empty">No reviews yet — be the first.</div>'}
  </div>`;
}

async function apptsScreen() {
  topbar('Appointments', S.user.role === 'owner' ? 'Your bookings' : 'Your schedule');
  const appts = await api('/appointments');
  const owner = S.user.role === 'owner';
  const badge = s => ({ 'confirmed': 'bg-blue', 'checked-in': 'bg-green', 'completed': 'bg-slate', 'cancelled': 'bg-red' }[s]);
  $('page').innerHTML = `<div class="screen">
  ${owner ? `<div class="filters"><div class="grow"></div>
    <button class="btn btn-p btn-sm" onclick="go('providers')">${I('plus', 14)} Book new</button></div>` : ''}
  <div class="card">
  ${appts.length ? appts.map(a => `
    <div class="rowitem">
      <div class="gicon" style="background:var(--grad);width:38px;height:38px">${I('cal', 16)}</div>
      <div class="grow">
        <div class="t1">${esc(a.reason)}</div>
        <div class="t2">${esc(a.pet_name)}${a.breed ? ' · ' + esc(a.breed) : ''} · ${owner ? esc(a.provider_name) : esc(a.owner_name)}</div>
        <div class="t3">${fmtDT(a.scheduled_at)}</div>
      </div>
      <span class="badge ${badge(a.status)}">${a.status}</span>
      ${a.status === 'confirmed' && owner ? `<button class="btn btn-danger btn-sm" onclick="setAppt(${a.id},'cancelled')">Cancel</button>` : ''}
      ${!owner && a.status === 'confirmed' ? `<button class="btn btn-ghost btn-sm" onclick="setAppt(${a.id},'checked-in')">Check in</button>` : ''}
      ${!owner && a.status === 'checked-in' ? `<button class="btn btn-p btn-sm" onclick="setAppt(${a.id},'completed')">Complete</button>` : ''}
    </div>`).join('') : '<div class="empty">No appointments.</div>'}
  </div></div>`;
}

/* ============ PROVIDER SCREENS ============ */
async function providerDash() {
  topbar('Provider Dashboard', S.user.clinicName || '');
  const [appts, pets] = await Promise.all([api('/appointments'), api('/pets')]);
  const active = appts.filter(a => ['confirmed', 'checked-in'].includes(a.status));
  const badge = s => ({ 'confirmed': 'bg-blue', 'checked-in': 'bg-green', 'completed': 'bg-slate', 'cancelled': 'bg-red' }[s]);
  $('page').innerHTML = `<div class="screen">
  <div class="statgrid">
    ${[[active.length, 'Upcoming appointments', 'cal', 'var(--grad)'],
       [pets.length, 'Active patients', 'paw', 'var(--grad-gm)'],
       [appts.filter(a => a.status === 'completed').length, 'Completed visits', 'check', 'var(--grad-bp)'],
       [appts.filter(a => a.status === 'checked-in').length, 'Checked in now', 'clock', 'var(--grad-or)']]
      .map(s => `<div class="card stat"><div class="gicon" style="background:${s[3]};width:36px;height:36px">${I(s[2], 17)}</div>
        <div class="v">${s[0]}</div><div class="l">${s[1]}</div></div>`).join('')}
  </div>
  <div class="twocol">
    <div>
      <h3 class="sec">Schedule</h3>
      <div class="card">
      ${active.length ? active.map(a => `
        <div class="rowitem">
          <div class="grow"><div class="t1">${esc(a.pet_name)}${a.breed ? ' · ' + esc(a.breed) : ''}</div>
          <div class="t2">${esc(a.owner_name)} · ${esc(a.reason)}</div>
          <div class="t3">${fmtDT(a.scheduled_at)}</div></div>
          <span class="badge ${badge(a.status)}">${a.status}</span>
          ${a.status === 'confirmed' ? `<button class="btn btn-ghost btn-sm" onclick="setAppt(${a.id},'checked-in')">Check in</button>` : ''}
          ${a.status === 'checked-in' ? `<button class="btn btn-p btn-sm" onclick="setAppt(${a.id},'completed')">Complete</button>` : ''}
        </div>`).join('') : '<div class="empty">No upcoming appointments.</div>'}
      </div>
    </div>
    <div>
      <h3 class="sec">Patients <span class="seemore" onclick="go('patients')">View all</span></h3>
      <div class="card">
      ${pets.length ? pets.slice(0, 6).map(p => `
        <div class="rowitem">
          <div class="pet-head" style="background:${p.color};width:38px;height:38px;font-size:.9rem">${esc(p.name[0])}</div>
          <div class="grow"><div class="t1">${esc(p.name)}</div><div class="t2">${esc(p.breed || p.species)} · ${esc(p.owner_name || '')}</div></div>
        </div>`).join('') : '<div class="empty">No patients yet — patients appear when owners book with you.</div>'}
      </div>
    </div>
  </div></div>`;
}

async function patientsScreen() {
  topbar('Patients', 'Pets under your care');
  const pets = await api('/pets');
  $('page').innerHTML = `<div class="screen">
  ${pets.length ? pets.map(p => `
  <div class="card" style="margin-bottom:12px">
    <div class="hrow">
      <div class="pet-head" style="background:${p.color}">${esc(p.name[0])}</div>
      <div class="grow">
        <div class="t1">${esc(p.name)}</div>
        <div class="t2">${esc(p.breed || p.species)} · Owner: ${esc(p.owner_name || '')}</div>
        <div style="margin-top:5px;display:flex;gap:6px;flex-wrap:wrap">
          ${p.vaccinations.some(v => v.status === 'due') ? '<span class="badge bg-amber">Vaccines due</span>' : '<span class="badge bg-green">Vaccines current</span>'}
          ${(p.conditions || '').split(',').filter(Boolean).map(c => `<span class="badge bg-slate">${esc(c.trim())}</span>`).join('')}
        </div>
      </div>
      <button class="btn btn-p btn-sm" onclick="openRecordModal(${p.id})">${I('plus', 13)} Add record</button>
    </div>
    ${p.records.slice(0, 2).map(r => `<div class="rowitem" style="padding:10px 0 0;border:0;margin-top:8px;border-top:1px solid var(--line)">
      <div class="grow"><div class="t2"><b style="color:var(--text)">${esc(r.title)}</b> · ${fmtDate(r.visited_on)}</div>
      <div class="t3">${esc(r.note || '')}</div></div></div>`).join('')}
  </div>`).join('') : '<div class="card empty">No patients yet.</div>'}
  </div>`;
}

/* ============ TOP-RATED VETS (GRADING) ============ */
async function gradingScreen() {
  topbar('Top-Rated Veterinary Providers', 'Quality grades');
  const provs = (await api('/providers')).filter(v => ['Veterinarian', 'Emergency'].includes(v.type));
  $('page').innerHTML = `<div class="screen">
  <div class="card" style="margin-bottom:18px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
    ${[['shield', 'Patient Safety', 'Complication rates, emergency response'], ['heart', 'Patient Experience', 'Communication, compassion, satisfaction'],
       ['bolt', 'Clinical Quality', 'Treatment success, outcomes'], ['clock', 'Timeliness', 'Wait times, scheduling reliability']]
      .map(m => `<div class="hrow"><div class="gicon" style="background:var(--grad-bp);width:34px;height:34px">${I(m[0], 15)}</div>
        <div><div class="t1" style="font-size:.78rem">${m[1]}</div><div class="t3">${m[2]}</div></div></div>`).join('')}
  </div>
  ${provs.map(v => {
    const met = v.metrics ? JSON.parse(v.metrics) : {};
    return `<div class="card hov" style="margin-bottom:14px" onclick="go('providerDetail',{provider:${v.id}})">
    <div class="hrow">
      <div class="grade ${v.grade === 'A+' ? 'gA' : 'gB'}"><span class="g">${esc(v.grade)}</span><small>${esc((v.grade_word || '').toUpperCase())}</small></div>
      <div class="grow"><div class="t1" style="font-size:.95rem">${esc(v.name)}</div><div class="t2">${esc(v.doctor || '')} · ${esc(v.distance || '')}</div>
        <div class="hrow" style="gap:7px;margin-top:3px">${v.rating ? stars(v.rating) + `<span class="t2">${v.rating} (${v.reviewCount})</span>` : '<span class="t3">No reviews yet</span>'}</div></div>
      <div class="center"><div style="font-size:1.3rem;font-weight:800;color:var(--green)">${v.rec_rate}%</div><div class="t3">Recommendation<br>Rate</div></div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-top:16px">
      ${[['Patient Safety', met.safety], ['Experience', met.exp], ['Clinical Quality', met.clinical], ['Communication', met.comm], ['Timeliness', met.time]]
        .map(m => `<div class="metric"><div class="mrow"><span class="muted" style="font-size:.68rem">${m[0]}</span><b style="font-size:.7rem">${m[1] || '—'}</b></div>
          <div class="bar" style="height:5px"><i style="width:${m[1] || 0}%;background:${(m[1] || 0) >= 95 ? 'var(--grad-gm)' : 'var(--grad)'}"></i></div></div>`).join('')}
    </div>
  </div>`;
  }).join('')}</div>`;
}

/* ============ INSURANCE ============ */
async function insuranceScreen() {
  topbar('Pet Insurance Dashboard', 'Health-score discounts');
  const { policies, claims, tiers } = await api('/insurance');
  const saved = policies.reduce((a, p) => a + (parseInt((p.saved_note || '').replace(/[^0-9]/g, '')) || 0), 0);
  $('page').innerHTML = `<div class="screen">
  <div class="statgrid">
    ${[[policies.length, 'Active Policies'], ['$' + saved, 'Total Savings YTD'],
       [claims.filter(c => c.status === 'Reimbursed').length + ' of ' + claims.length, 'Claims Reimbursed'],
       [(policies[0] ? '−' + Math.max(...policies.map(p => p.discount)) + '%' : '—'), 'Best Discount']]
      .map(s => `<div class="card stat"><div class="l">${s[1]}</div><div class="v">${s[0]}</div></div>`).join('')}
  </div>
  <div class="twocol">
    <div>
      <h3 class="sec">Policies &amp; Health-Score Discounts</h3>
      ${policies.length ? policies.map(p => `<div class="card" style="margin-bottom:12px">
        <div class="hrow">
          <div class="pet-head" style="background:${p.color};width:42px;height:42px;font-size:.95rem">${esc(p.pet_name[0])}</div>
          <div class="grow"><div class="t1">${esc(p.pet_name)} — ${esc(p.carrier)}</div><div class="t2">${esc(p.coverage || '')} · ${esc(p.premium || '')}</div></div>
          <span class="badge bg-green">−${p.discount}% discount</span>
        </div>
        <div class="metric" style="margin-top:14px"><div class="mrow"><span class="muted">Health score ${p.health_score} → discount tier</span><b style="color:var(--green)">${p.discount}%</b></div>
        <div class="bar"><i style="width:${p.health_score}%;background:var(--grad-gm)"></i></div></div>
        <div class="t3">${esc(p.saved_note || '')}</div>
      </div>`).join('') : '<div class="card empty">No policies on file.</div>'}
      <h3 class="sec">Recent Claims</h3>
      <div class="card">
        ${claims.length ? claims.map(c => `<div class="rowitem">
          <div class="grow"><div class="t1">${esc(c.what)}</div><div class="t2">${esc(c.pet_name)} · ${fmtDate(c.claimed_on)}</div></div>
          <div class="t1" style="margin-right:12px">${esc(c.amount || '')}</div>
          <span class="badge ${c.status === 'Reimbursed' ? 'bg-green' : c.status === 'Denied' ? 'bg-red' : 'bg-amber'}">${c.status}</span>
        </div>`).join('') : '<div class="empty">No claims yet.</div>'}
      </div>
    </div>
    <div>
      <h3 class="sec">How Insurance Discounts Work</h3>
      <div class="card">
        <div class="t2" style="margin-bottom:14px">Keeping records current, vaccinations on time, and wellness visits regular raises each pet's health score — which maps directly to premium discounts.</div>
        ${tiers.map(t => `<div class="tierrow"><span class="muted">${t[0]}</span><b style="color:var(--green)">${t[1]}</b></div>`).join('')}
      </div>
      <div class="card" style="margin-top:14px;border-color:rgba(52,211,153,.35)">
        <div class="hrow"><div class="gicon" style="background:var(--grad-gm)">${I('coin', 18)}</div>
          <div><div class="t1">Save up to $2,400/year</div><div class="t2">Average savings with health-score optimization</div></div></div>
      </div>
    </div>
  </div></div>`;
}

/* ============ AI VET ASSISTANT ============ */
const CHAT_TOPICS = [
  ['Vaccinations', 'What vaccinations do my pets need, and are any due?'],
  ['Medications', 'What medications are my pets currently on?'],
  ['Appointments', 'What appointments do I have coming up?'],
  ['Pet Nutrition', 'What should I look for in a high-quality pet food?'],
  ['Flea Prevention', "What's the best year-round flea prevention strategy?"],
  ['Dental Care', 'How do I care for my pet\u2019s teeth?'],
  ['Senior Pet Care', 'How should care change as my pet gets older?']
];
async function aiScreen() {
  topbar('AI Vet Health Assistant', 'Grounded in your records');
  if (!S.msgs) S.msgs = [];
  $('page').innerHTML = `<div class="screen">
  <div class="chatwrap">
    <div class="card chatlist">
      <div class="t1" style="margin-bottom:10px">Topics</div>
      ${CHAT_TOPICS.map(([t, q]) => `<div class="ci" onclick="askAI('${esc(q).replace(/'/g, "\\'")}')">
        <div class="t1" style="font-size:.78rem">${t}</div>
        <div class="t3" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${q}</div></div>`).join('')}
    </div>
    <div class="card chatbox">
      <div class="hrow" style="padding-bottom:14px;border-bottom:1px solid var(--line)">
        <div class="gicon" style="background:var(--grad-bp);width:38px;height:38px">${I('brain', 17)}</div>
        <div class="grow"><div class="t1">Vetara Health AI Assistant</div><div class="t2">Answers grounded in your pets' actual records</div></div>
        <span class="badge bg-purple">${I('spark', 11)} AI</span>
      </div>
      <div class="msgs" id="msgs" style="padding-top:14px">
        ${S.msgs.length ? S.msgs.map(m => `<div class="msg ${m.role}">${m.role === 'user' ? esc(m.text) : m.text}</div>`).join('') : `
        <div class="msg ai">Hi ${esc(S.user.name.split(' ')[0])} — ask me anything about your pets. I can see their vaccination status, medications, visits, and appointments.<br><br>Try a suggested topic:</div>
        <div class="sugg">${CHAT_TOPICS.map(([t, q]) => `<button onclick="askAI('${esc(q).replace(/'/g, "\\'")}')">${t}</button>`).join('')}</div>`}
      </div>
      <div class="chatinput">
        <input id="aiq" placeholder="Ask about your pet's health…" onkeydown="if(event.key==='Enter')sendAI()">
        <button class="btn btn-p" onclick="sendAI()">${I('send', 16)} Send</button>
      </div>
    </div>
  </div></div>`;
  const m = $('msgs'); if (m) m.scrollTop = m.scrollHeight;
}
async function askAI(q) {
  S.msgs = S.msgs || [];
  S.msgs.push({ role: 'user', text: q });
  await aiScreen();
  try {
    const { answer } = await api('/assistant', { method: 'POST', body: { question: q } });
    S.msgs.push({ role: 'ai', text: answer });
  } catch (e) { S.msgs.push({ role: 'ai', text: 'Sorry — something went wrong. ' + esc(e.message) }); }
  aiScreen();
}
function sendAI() {
  const el = $('aiq');
  if (!el || !el.value.trim()) return;
  const q = el.value.trim(); el.value = '';
  askAI(q);
}

/* ============ COMMUNITY ============ */
async function communityScreen() {
  topbar('Pet Community', 'Owners near you');
  const posts = await api('/posts');
  $('page').innerHTML = `<div class="screen">
  <div class="twocol">
    <div>
      <div class="card" style="margin-bottom:16px">
        <div class="hrow"><div class="uava">${initials(S.user.name)}</div>
          <input id="newpost" style="flex:1;background:#0a1424;border:1px solid var(--line2);border-radius:99px;padding:11px 18px;color:var(--text);font-size:.84rem;outline:0"
            placeholder="Share an update about your pet…" onkeydown="if(event.key==='Enter')submitPost()">
          <button class="btn btn-p btn-sm" onclick="submitPost()">Post</button></div>
      </div>
      ${posts.map(p => `<div class="card" style="margin-bottom:14px">
        <div class="hrow"><div class="uava" style="background:var(--grad-bp)">${initials(p.author)}</div>
          <div class="grow"><div class="t1" style="font-size:.84rem">${esc(p.author)}${p.clinic_name ? ' · ' + esc(p.clinic_name) : ''}</div>
          <div class="t3">${fmtDate((p.created_at || '').slice(0, 10))}${p.sponsored ? ' · <span style="color:#7eb3fa;font-weight:700">Partner</span>' : ''}</div></div>
          ${p.sponsored ? '<span class="badge bg-blue">Partner</span>' : ''}
          ${p.user_id === S.user.id ? `<button class="btn btn-danger btn-sm" onclick="delPost(${p.id})">${I('trash', 12)}</button>` : ''}</div>
        <div class="t2" style="color:var(--text);margin-top:11px">${esc(p.text)}</div>
        ${p.image_style ? `<div class="postimg" style="background:${p.image_style}"><span>${esc(p.image_caption || '')}</span></div>` : ''}
        <div class="pact">
          <span onclick="likePost(${p.id},this)">${I('heart', 15)} <b id="likes-${p.id}">${p.likes}</b></span>
          <span>${I('msg', 15)} ${p.comments}</span>
        </div>
      </div>`).join('')}
    </div>
    <div>
      <h3 class="sec">Trending Nearby</h3>
      <div class="card">
        ${['Pollen spike: itchy paws reported at Fairview Park', 'New cat-only clinic opening in NoDa', 'Lost-pet reunions via QR up 32% this quarter']
          .map(t => `<div class="rowitem"><div class="gicon" style="background:var(--card2);border:1px solid var(--line2);width:30px;height:30px;color:var(--cyan)">${I('up', 13)}</div><div class="t2 grow">${t}</div></div>`).join('')}
      </div>
      <h3 class="sec">Community Guidelines</h3>
      <div class="card"><div class="t2">Share wins, ask questions, and flag local health trends. Medical advice in the feed is peer experience — always confirm with your vet.</div></div>
    </div>
  </div></div>`;
}
async function submitPost() {
  const el = $('newpost');
  if (!el || !el.value.trim()) return;
  try { await api('/posts', { method: 'POST', body: { text: el.value } }); toast('Posted'); render(); }
  catch (e) { toast(e.message, true); }
}
async function likePost(id, el) {
  try { const { likes } = await api(`/posts/${id}/like`, { method: 'POST' }); $('likes-' + id).textContent = likes; }
  catch { }
}
async function delPost(id) {
  try { await api('/posts/' + id, { method: 'DELETE' }); toast('Post deleted'); render(); }
  catch (e) { toast(e.message, true); }
}

/* ============ PROVIDER: OPEN SLOTS (SMART FILL) ============ */
async function slotsScreen() {
  topbar('Open Slots & Smart Fill', 'Broadcast cancellations');
  const slots = await api('/slots');
  const claimed = slots.filter(s => s.status === 'claimed').length;
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  $('page').innerHTML = `<div class="screen">
  <div class="statgrid">
    ${[[slots.filter(s => s.status === 'open').length, 'Live broadcasts'], [claimed, 'Slots recovered'],
       [slots.reduce((a, s) => a + s.reached, 0).toLocaleString(), 'Total owners reached'], ['24 min', 'Avg time to fill']]
      .map(s => `<div class="card stat"><div class="l">${s[1]}</div><div class="v">${s[0]}</div></div>`).join('')}
  </div>
  <div class="twocol">
    <div class="card">
      <div class="t1" style="margin-bottom:4px">Broadcast an open slot</div>
      <div class="t2">Notifies every Vetara owner inside your chosen radius. Slots are claimed first-come, first-served and auto-fill your calendar.</div>
      <form class="field" onsubmit="broadcastSlot(event)">
        <label>Service</label>
        <select id="s-svc">${['Wellness exam', 'Vaccination visit', 'Dental consult', 'Dermatology recheck', 'Surgery consult'].map(s => `<option>${s}</option>`).join('')}</select>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div><label>Date</label><input id="s-date" type="date" required value="${tomorrow}"></div>
          <div><label>Time</label><input id="s-time" type="time" required value="11:00"></div>
        </div>
        <label>Notification radius — <b id="rlabel" style="color:var(--cyan)">30 miles</b></label>
        <input type="range" min="5" max="50" step="5" value="30" id="s-radius" style="accent-color:var(--blue);padding:0"
          oninput="document.getElementById('rlabel').textContent=this.value+' miles';document.getElementById('reach').textContent=Math.max(40,Math.round(2314*this.value*this.value/900)).toLocaleString()">
        <div class="card" style="background:var(--card2);padding:14px;margin-top:12px">
          <div class="hrow"><div class="gicon" style="background:var(--grad-bp);width:34px;height:34px">${I('users', 15)}</div>
          <div class="t2">Estimated reach: <b style="color:var(--text)"><span id="reach">2,314</span> owners</b> with matching pets &amp; notification preferences</div></div>
        </div>
        <label>Incentive (optional)</label>
        <select id="s-inc"><option value="">None</option><option>15% off — short-notice discount</option><option>10% off</option><option>Waived exam fee for new patients</option></select>
        <button class="btn btn-p" style="width:100%;margin-top:18px" type="submit">${I('send', 15)} Broadcast to nearby owners</button>
      </form>
    </div>
    <div>
      <h3 class="sec">How Smart Fill works</h3>
      <div class="card">
        ${[['bell', 'A slot opens', 'Cancellation or no-show is detected from your calendar.'],
           ['users', 'Owners are notified', 'Notification goes to every opted-in owner in your radius — nearest and overdue-for-care pets first.'],
           ['check', 'First claim wins', 'The slot books instantly, records are shared, and your calendar updates.']]
          .map((s, i) => `<div class="rowitem"><div class="gicon" style="background:var(--grad);width:34px;height:34px">${I(s[0], 15)}</div>
            <div class="grow"><div class="t1" style="font-size:.82rem">${i + 1}. ${s[1]}</div><div class="t2">${s[2]}</div></div></div>`).join('')}
      </div>
      <h3 class="sec">Broadcast history</h3>
      ${slots.length ? slots.map(b => `<div class="card" style="margin-bottom:11px">
        <div class="hrow">
          <div class="grow"><div class="t1" style="font-size:.82rem">${fmtDT(b.slot_at)} — ${esc(b.service)}</div>
          <div class="t3">${esc(b.cause)} · ${b.radius} mi radius · reached ${b.reached.toLocaleString()} owners</div></div>
          <span class="badge ${b.status === 'open' ? 'bg-cyan' : b.status === 'claimed' ? 'bg-green' : 'bg-slate'}">${b.status === 'open' ? 'Live' : b.status === 'claimed' ? 'Claimed' : 'Expired'}</span>
        </div>
        ${b.claimed_by ? `<div class="t2" style="margin-top:7px">${I('check', 12)} Claimed by <b style="color:var(--text)">${esc(b.claimed_by)}</b></div>` : ''}
      </div>`).join('') : '<div class="card empty">No broadcasts yet.</div>'}
    </div>
  </div></div>`;
}
async function broadcastSlot(e) {
  e.preventDefault();
  try {
    const s = await api('/slots', { method: 'POST', body: {
      service: $('s-svc').value, slotAt: $('s-date').value + ' ' + $('s-time').value,
      radius: +$('s-radius').value, incentive: $('s-inc').value || null } });
    toast(`Broadcast sent to ${s.reached.toLocaleString()} owners within ${s.radius} miles`);
    render();
  } catch (err) { toast(err.message, true); }
}

/* ============ PROVIDER: AI IMPORT INBOX (demo) ============ */
const INBOX_DOCS = [
  { from: 'records@banfield.com', subj: "Attached is Max's vaccination certificate", pet: 'Max · Labrador (matched by chip ID)', conf: 99.2, fields: ['Rabies 3-yr · Jun 04, 2026', 'DHPP · Jun 04, 2026', 'Vet: Dr. A. Costa'], status: 'ready' },
  { from: 'discharge@westview-er.com', subj: 'Post-op discharge summary — Zeus Morris', pet: 'Zeus · Rottweiler (existing patient)', conf: 97.8, fields: ['TPLO post-op day 14', 'Suture removal cleared', 'Restricted activity 4 wks'], status: 'ready' },
  { from: 'tessa@happypaws.studio', subj: 'Grooming notes and coat treatment summary', pet: 'Coco · French Bulldog (matched by name+owner)', conf: 94.1, fields: ['Medicated bath — chlorhexidine', 'Skin irritation L flank noted', 'Recommend vet recheck'], status: 'review' }
];
async function inboxScreen() {
  topbar('AI Document Import', 'Email-to-chart parsing');
  $('page').innerHTML = `<div class="screen">
  <div class="card" style="margin-bottom:16px">
    <div class="hrow"><div class="gicon" style="background:var(--grad-bp)">${I('mail', 18)}</div>
      <div class="grow"><div class="t1">records@vetarahealth.com</div><div class="t2">Emailed documents are parsed by AI and matched to patients automatically</div></div>
      <span class="badge bg-purple">${I('spark', 11)} AI parsing on</span></div>
  </div>
  ${INBOX_DOCS.map((d, i) => `<div class="card" style="margin-bottom:13px" id="doc${i}">
    <div class="hrow">
      <div class="gicon" style="background:${d.status === 'ready' ? 'var(--grad-gm)' : 'var(--grad-or)'};width:38px;height:38px">${I('file', 16)}</div>
      <div class="grow"><div class="t1" style="font-size:.88rem">${d.subj}</div><div class="t2">From ${d.from} · matched to <b style="color:var(--text)">${d.pet}</b></div></div>
      <span class="badge ${d.status === 'ready' ? 'bg-green' : 'bg-amber'}">${d.conf}% confidence</span>
    </div>
    <div style="display:flex;gap:7px;margin:12px 0;flex-wrap:wrap">${d.fields.map(f => `<span class="badge bg-slate">${f}</span>`).join('')}</div>
    <div style="display:flex;gap:9px">
      <button class="btn btn-p btn-sm" onclick="acceptDoc(${i},0)">${I('check', 13)} Accept &amp; File to Chart</button>
      <button class="btn btn-ghost btn-sm" onclick="toast('Opening original document')">${I('eye', 13)} View Original</button>
      <button class="btn btn-ghost btn-sm" onclick="acceptDoc(${i},1)">${I('x', 13)} Reject</button>
    </div>
  </div>`).join('')}
  <div class="card"><div class="t2">These sample documents demonstrate the import workflow. Connect an inbound-email service (e.g. SendGrid Inbound Parse) to make this live.</div></div>
  </div>`;
}
function acceptDoc(i, rej) {
  const el = $('doc' + i);
  if (el) { el.style.opacity = .4; el.querySelectorAll('button').forEach(b => b.disabled = true); }
  toast(rej ? 'Document rejected' : 'Filed to patient chart — owner notified');
}

/* ============ PROVIDER: REVIEWS & REPUTATION ============ */
async function prReviewsScreen() {
  topbar('Reviews & Reputation', S.user.clinicName || '');
  const provs = await api('/providers');
  const mine = provs.find(p => p.user_id === S.user.id);
  const detail = mine ? await api('/providers/' + mine.id) : { reviews: [], rating: null, reviewCount: 0 };
  $('page').innerHTML = `<div class="screen">
  <div class="statgrid">
    ${[[detail.rating ?? '—', 'Average Rating'], [detail.reviewCount, 'Verified Reviews'],
       [(mine?.rec_rate ?? '—') + '%', 'Recommendation Rate'], [detail.reviews.length ? '100%' : '—', 'From confirmed visits']]
      .map(s => `<div class="card stat"><div class="l">${s[1]}</div><div class="v">${s[0]}</div></div>`).join('')}
  </div>
  ${detail.reviews.length ? detail.reviews.map(r => `<div class="card" style="margin-bottom:12px">
    <div class="hrow">
      <div class="uava" style="background:var(--card2);border:1px solid var(--line2);color:var(--muted)">${initials(r.reviewer)}</div>
      <div class="grow"><div class="t1" style="font-size:.84rem">${esc(r.reviewer)} <span class="badge bg-green" style="margin-left:5px">${I('check', 10)} Verified visit</span></div>
      <div class="hrow" style="gap:7px">${stars(r.rating, 11)}<span class="t3">${fmtDate((r.created_at || '').slice(0, 10))}</span></div></div>
    </div>
    ${r.title ? `<div class="t1" style="margin-top:8px">${esc(r.title)}</div>` : ''}
    <div class="t2" style="color:var(--text);margin-top:4px">${esc(r.text || '')}</div>
  </div>`).join('') : '<div class="card empty">No reviews yet — reviews appear when owners rate their visits.</div>'}
  </div>`;
}

/* ============ ACTIONS ============ */
async function doneReminder(id) { await api(`/reminders/${id}/done`, { method: 'PATCH' }); toast('Reminder completed'); render(); }
async function setAppt(id, status) { await api(`/appointments/${id}`, { method: 'PATCH', body: { status } }); toast('Appointment ' + status); render(); }
async function delVax(pid, vid) { await api(`/pets/${pid}/vaccinations/${vid}`, { method: 'DELETE' }); toast('Vaccination removed'); render(); }
async function delMed(pid, mid) { await api(`/pets/${pid}/medications/${mid}`, { method: 'DELETE' }); toast('Medication ended'); render(); }

/* ============ MODALS ============ */
function modal(html) {
  $('overlay').innerHTML = `<div class="modal-bg" onclick="if(event.target===this)closeModal()"><div class="modal screen">${html}</div></div>`;
}
function closeModal() { $('overlay').innerHTML = ''; }

async function openPetModal(id) {
  const p = id ? ((S.cache.pets || []).find(x => x.id === id) || await api('/pets/' + id)) : null;
  modal(`<h3>${p ? 'Edit ' + esc(p.name) : 'Add a pet'}</h3>
  <form class="field" onsubmit="savePet(event,${id || 'null'})">
    <label>Name</label><input id="m-name" required value="${esc(p?.name || '')}">
    <label>Species</label><select id="m-species">${['Dog', 'Cat', 'Bird', 'Rabbit', 'Reptile', 'Other'].map(s => `<option ${p?.species === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
    <label>Breed</label><input id="m-breed" value="${esc(p?.breed || '')}">
    <label>Sex</label><input id="m-sex" placeholder="F (spayed)" value="${esc(p?.sex || '')}">
    <label>Date of birth</label><input id="m-dob" type="date" value="${p?.dob || ''}">
    <label>Weight (kg)</label><input id="m-weight" type="number" step="0.1" value="${p?.weight_kg || ''}">
    <label>Microchip</label><input id="m-chip" value="${esc(p?.microchip || '')}">
    <label>Conditions (comma-separated)</label><input id="m-cond" value="${esc(p?.conditions || '')}">
    <div style="display:flex;gap:10px;margin-top:20px">
      <button class="btn btn-p grow" type="submit">${p ? 'Save changes' : 'Add pet'}</button>
      <button class="btn btn-ghost" type="button" onclick="closeModal()">Cancel</button>
    </div>
  </form>`);
}
async function savePet(e, id) {
  e.preventDefault();
  const body = {
    name: $('m-name').value, species: $('m-species').value, breed: $('m-breed').value,
    sex: $('m-sex').value, dob: $('m-dob').value, weightKg: parseFloat($('m-weight').value) || null,
    microchip: $('m-chip').value, conditions: $('m-cond').value
  };
  try {
    if (id) await api('/pets/' + id, { method: 'PUT', body });
    else await api('/pets', { method: 'POST', body });
    closeModal(); toast(id ? 'Pet updated' : 'Pet added'); render();
  } catch (err) { toast(err.message, true); }
}

async function openRecordModal(petId) {
  const pets = S.cache.pets || await api('/pets');
  S.cache.pets = pets;
  modal(`<h3>Add medical record</h3>
  <form class="field" onsubmit="saveRecord(event)">
    <label>Pet</label><select id="m-pet">${pets.map(p => `<option value="${p.id}" ${p.id === petId ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>
    <label>Type</label><select id="m-type">${['Routine Checkup', 'Vaccination', 'Lab Results', 'Emergency', 'Dental', 'Surgery', 'Other'].map(t => `<option>${t}</option>`).join('')}</select>
    <label>Title</label><input id="m-title" required placeholder="Annual wellness exam">
    <label>Diagnosis</label><input id="m-dx" placeholder="Healthy — BCS 5/9">
    <label>Notes</label><textarea id="m-note" rows="3"></textarea>
    <label>Visit date</label><input id="m-date" type="date" required value="${new Date().toISOString().slice(0, 10)}">
    <div style="display:flex;gap:10px;margin-top:20px">
      <button class="btn btn-p grow" type="submit">Save record</button>
      <button class="btn btn-ghost" type="button" onclick="closeModal()">Cancel</button>
    </div>
  </form>`);
}
async function saveRecord(e) {
  e.preventDefault();
  try {
    await api('/records', { method: 'POST', body: {
      petId: +$('m-pet').value, type: $('m-type').value, title: $('m-title').value,
      diagnosis: $('m-dx').value, note: $('m-note').value, visitedOn: $('m-date').value } });
    closeModal(); toast('Record saved'); render();
  } catch (err) { toast(err.message, true); }
}

function openVaxModal(petId) {
  modal(`<h3>Add vaccination</h3>
  <form class="field" onsubmit="saveVax(event,${petId})">
    <label>Vaccine</label><input id="m-vname" required placeholder="Rabies (3-yr)">
    <label>Date given</label><input id="m-vgiven" type="date" value="${new Date().toISOString().slice(0, 10)}">
    <label>Next due</label><input id="m-vdue" type="date">
    <div style="display:flex;gap:10px;margin-top:20px">
      <button class="btn btn-p grow" type="submit">Save</button>
      <button class="btn btn-ghost" type="button" onclick="closeModal()">Cancel</button>
    </div>
  </form>`);
}
async function saveVax(e, petId) {
  e.preventDefault();
  try {
    await api(`/pets/${petId}/vaccinations`, { method: 'POST', body: { name: $('m-vname').value, givenOn: $('m-vgiven').value, dueOn: $('m-vdue').value } });
    closeModal(); toast('Vaccination added'); render();
  } catch (err) { toast(err.message, true); }
}

function openMedModal(petId) {
  modal(`<h3>Add medication</h3>
  <form class="field" onsubmit="saveMed(event,${petId})">
    <label>Medication</label><input id="m-mname" required placeholder="Apoquel 16mg">
    <label>Dose</label><input id="m-mdose" placeholder="1 tablet daily">
    <label>Duration note</label><input id="m-muntil" placeholder="Ongoing — allergy season">
    <div style="display:flex;gap:10px;margin-top:20px">
      <button class="btn btn-p grow" type="submit">Save</button>
      <button class="btn btn-ghost" type="button" onclick="closeModal()">Cancel</button>
    </div>
  </form>`);
}
async function saveMed(e, petId) {
  e.preventDefault();
  try {
    await api(`/pets/${petId}/medications`, { method: 'POST', body: { name: $('m-mname').value, dose: $('m-mdose').value, untilNote: $('m-muntil').value } });
    closeModal(); toast('Medication added'); render();
  } catch (err) { toast(err.message, true); }
}

async function openReminderModal() {
  const pets = S.cache.pets || await api('/pets');
  S.cache.pets = pets;
  modal(`<h3>Add care reminder</h3>
  <form class="field" onsubmit="saveReminder(event)">
    <label>Pet</label><select id="m-pet">${pets.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select>
    <label>What</label><input id="m-what" required placeholder="Annual vaccines due">
    <label>Due note</label><input id="m-due" placeholder="Aug 2026 — in 2 months">
    <label>Priority</label><select id="m-level"><option value="amber">Upcoming</option><option value="red">Overdue</option></select>
    <div style="display:flex;gap:10px;margin-top:20px">
      <button class="btn btn-p grow" type="submit">Save</button>
      <button class="btn btn-ghost" type="button" onclick="closeModal()">Cancel</button>
    </div>
  </form>`);
}
async function saveReminder(e) {
  e.preventDefault();
  try {
    await api('/reminders', { method: 'POST', body: { petId: +$('m-pet').value, what: $('m-what').value, dueNote: $('m-due').value, level: $('m-level').value } });
    closeModal(); toast('Reminder added'); render();
  } catch (err) { toast(err.message, true); }
}

async function openBookModal(providerId, providerName) {
  const pets = S.cache.pets || await api('/pets');
  S.cache.pets = pets;
  if (!pets.length) return toast('Add a pet first', true);
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  modal(`<h3>Book at ${esc(providerName)}</h3>
  <form class="field" onsubmit="saveBooking(event,${providerId})">
    <label>Pet</label><select id="m-pet">${pets.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select>
    <label>Reason</label><input id="m-reason" required placeholder="Wellness exam">
    <label>Date</label><input id="m-date" type="date" required value="${tomorrow}">
    <label>Time</label><input id="m-time" type="time" required value="09:00">
    <div style="display:flex;gap:10px;margin-top:20px">
      <button class="btn btn-p grow" type="submit">${I('cal', 15)} Confirm booking</button>
      <button class="btn btn-ghost" type="button" onclick="closeModal()">Cancel</button>
    </div>
  </form>`);
}
async function saveBooking(e, providerId) {
  e.preventDefault();
  try {
    await api('/appointments', { method: 'POST', body: {
      petId: +$('m-pet').value, providerId, reason: $('m-reason').value,
      scheduledAt: $('m-date').value + ' ' + $('m-time').value } });
    closeModal(); toast('Appointment booked'); go('appts');
  } catch (err) { toast(err.message, true); }
}

async function openClaimModal(slotId, providerName) {
  const pets = S.cache.pets || await api('/pets');
  S.cache.pets = pets;
  if (!pets.length) return toast('Add a pet first', true);
  modal(`<h3>Claim this opening</h3>
  <div class="t2" style="margin-bottom:6px">${esc(providerName)} — first come, first served. Records are shared automatically.</div>
  <form class="field" onsubmit="claimSlot(event,${slotId})">
    <label>Pet</label><select id="m-pet">${pets.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select>
    <div style="display:flex;gap:10px;margin-top:20px">
      <button class="btn btn-p grow" type="submit">${I('check', 15)} Claim slot</button>
      <button class="btn btn-ghost" type="button" onclick="closeModal()">Cancel</button>
    </div>
  </form>`);
}
async function claimSlot(e, slotId) {
  e.preventDefault();
  try {
    await api(`/slots/${slotId}/claim`, { method: 'POST', body: { petId: +$('m-pet').value } });
    closeModal(); toast('Slot claimed — appointment confirmed'); go('appts');
  } catch (err) { toast(err.message, true); }
}

let reviewRating = 5;
function openReviewModal(providerId) {
  reviewRating = 5;
  modal(`<h3>Write a review</h3>
  <form class="field" onsubmit="saveReview(event,${providerId})">
    <label>Rating</label>
    <div id="m-stars" style="font-size:1.3rem;display:flex;gap:4px;color:var(--amber)"></div>
    <label>Title</label><input id="m-rtitle" placeholder="Excellent care">
    <label>Review</label><textarea id="m-rtext" rows="4" placeholder="Tell others about your experience…"></textarea>
    <div style="display:flex;gap:10px;margin-top:20px">
      <button class="btn btn-p grow" type="submit">Post review</button>
      <button class="btn btn-ghost" type="button" onclick="closeModal()">Cancel</button>
    </div>
  </form>`);
  drawStars();
}
function drawStars() {
  $('m-stars').innerHTML = [1, 2, 3, 4, 5].map(i =>
    `<span style="cursor:pointer" onclick="reviewRating=${i};drawStars()">${I(i <= reviewRating ? 'starF' : 'star', 24)}</span>`).join('');
}
async function saveReview(e, providerId) {
  e.preventDefault();
  try {
    await api(`/providers/${providerId}/reviews`, { method: 'POST', body: { rating: reviewRating, title: $('m-rtitle').value, text: $('m-rtext').value } });
    closeModal(); toast('Review posted'); render();
  } catch (err) { toast(err.message, true); }
}

boot();
