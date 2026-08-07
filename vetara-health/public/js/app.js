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
      <a href="#features">Health Records</a><a href="#network">Provider Network</a><a href="#analytics">Analytics</a>
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
  <div class="sect center" id="analytics" style="padding-bottom:110px">
    <span class="kicker">Get Started</span>
    <h2 class="big">Ready to transform your pet's care?</h2>
    <p class="sub">Create a free account as a pet owner or provider and start managing health records today.</p>
    <button class="btn btn-p" onclick="showAuth('register')">Create Free Account ${I('arrow', 16)}</button>
  </div>`;
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
    ? [['dash', 'grid', 'Dashboard'], ['pets', 'paw', 'My Pets'], ['records', 'doc', 'Health Records'], ['providers', 'steth', 'Find Providers'], ['appts', 'cal', 'Appointments']]
    : [['dash', 'grid', 'Dashboard'], ['patients', 'paw', 'Patients'], ['appts', 'cal', 'Appointments'], ['records', 'doc', 'Records']];
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
    appts: apptsScreen, patients: patientsScreen
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
  const recs = await api('/records');
  $('page').innerHTML = `<div class="screen">
    ${S.user.role === 'owner' ? `<div class="filters"><div class="grow"></div>
      <button class="btn btn-p btn-sm" onclick="openRecordModal()">${I('plus', 14)} Add record</button></div>` : ''}
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
  const provs = await api('/providers' + (S.provType !== 'All' ? '?type=' + encodeURIComponent(S.provType) : ''));
  const types = ['All', 'Veterinarian', 'Emergency', 'Groomer', 'Dog Walker', 'Trainer', 'Boarding'];
  $('page').innerHTML = `<div class="screen">
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
