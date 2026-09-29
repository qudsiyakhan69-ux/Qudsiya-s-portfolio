/* Monster Energy — unofficial app concept
   Clickable prototype: screen routing, scan flow, XP, caffeine tracking. */
(function () {
  'use strict';

  /* ---------- data ---------- */
  const FLAVOURS = [
    { id: 'original',           name: 'Original',      kind: 'Original',         group: 'original', accent: '#1f7a24', price: '£1.75', caffeine: 160, sugar: '54g',  kcal: '~210 kcal', desc: 'The one that started it. Full sugar, full hit, the classic green claw.' },
    { id: 'ultra-red',          name: 'Ultra Red',     kind: 'Ultra · zero sugar', group: 'ultra',  accent: '#e0262b', price: '£1.85', caffeine: 160, sugar: '0g',   kcal: '~10 kcal',  desc: 'Mixed berry, light and crisp. Zero sugar, full Monster energy blend.' },
    { id: 'ultra-sunrise',      name: 'Ultra Sunrise', kind: 'Ultra · zero sugar', group: 'ultra',  accent: '#e88a1e', price: '£1.85', caffeine: 150, sugar: '0g',   kcal: '~10 kcal',  desc: 'Orange and citrus, bright and clean. Zero sugar, easy in the morning.' },
    { id: 'cotton-candy-grape', name: 'Cotton Candy',  kind: 'Ultra · zero sugar', group: 'ultra',  accent: '#4aa8e0', price: '£1.85', caffeine: 150, sugar: '0g',   kcal: '~10 kcal',  desc: 'Candyfloss and grape. Sweet on the nose, zero sugar in the can.' },
    { id: 'ultra-wild-passion', name: 'Wild Passion',  kind: 'Ultra · drop',       group: 'ultra',  accent: '#c9a2e8', price: '£1.95', caffeine: 150, sugar: '0g',   kcal: '~10 kcal',  desc: 'Passion fruit, zero sugar. A limited drop — first cans go to members.', drop: true },
    { id: 'rio-punch',          name: 'Rio Punch',     kind: 'Punch',              group: 'punch',  accent: '#d8d81e', price: '£1.85', caffeine: 160, sugar: '29g',  kcal: '~120 kcal', desc: 'Tropical punch with juice. Loud yellow can, loud flavour.' },
    { id: 'mixxd',              name: 'Mixxd Punch',   kind: 'Punch',              group: 'punch',  accent: '#e0247f', price: '£1.85', caffeine: 160, sugar: '31g',  kcal: '~130 kcal', desc: 'Berry punch with juice. The pink one everybody asks about.' }
  ];

  const REWARDS = [
    { name: 'Free can of your choice',  cost: 800,   icon: 'ultra-red' },
    { name: 'Tour hoodie',              cost: 3000,  icon: 'original' },
    { name: 'Gaming headset prize draw', cost: 1500, icon: 'rio-punch' },
    { name: 'Festival weekend ticket draw', cost: 5000, icon: 'ultra-wild-passion' }
  ];

  const DAILY_GUIDE = 400;
  const SCAN_LIMIT = 3;
  const LEVELS = [
    { name: 'Rookie', at: 0 },
    { name: 'Rider',  at: 1500 },
    { name: 'Pro',    at: 3000 },
    { name: 'Legend', at: 6000 }
  ];

  const state = { xp: 2450, caffeine: 160, scansToday: 1, lastScan: null, logCaffeine: true };

  /* ---------- helpers ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const canSrc = (id) => `assets/cans/${id}.jpg`;
  const flavour = (id) => FLAVOURS.find(f => f.id === id) || FLAVOURS[1];
  const nextLevel = () => LEVELS.find(l => l.at > state.xp) || LEVELS[LEVELS.length - 1];

  /* ---------- screen routing ---------- */
  const TABS = { home: 'home', flavours: 'flavours', scan: 'scan', rewards: 'rewards', caffeine: 'caffeine' };
  const tabbar = $('#tabbar');
  let current = 'splash';
  let history = [];

  function show(name, opts) {
    const next = $(`#screen-${name}`);
    if (!next) return;
    const prev = $('.screen.is-active');
    if (prev === next) return;
    if (prev && !(opts && opts.replace)) history.push(current);
    if (prev) prev.classList.remove('is-active');
    next.classList.add('is-active');
    next.scrollTop = 0;
    current = name;

    tabbar.hidden = (name === 'splash' || name === 'onboarding');
    $$('.tab', tabbar).forEach(t => t.classList.toggle('is-on', t.dataset.tab === name));
    if (name === 'home') render();
  }

  function back() {
    const prev = history.pop();
    show(prev || 'home', { replace: true });
  }

  document.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go) { show(go.dataset.go); return; }
    if (e.target.closest('[data-back]')) { back(); return; }
    const t = e.target.closest('[data-toast]');
    if (t) toast(t.dataset.toast);
  });

  $('#screen-splash').addEventListener('click', () => show('onboarding'));
  $('#screen-splash').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show('onboarding'); }
  });

  $$('.tab, .tab-scan', tabbar).forEach(btn => {
    btn.addEventListener('click', () => show(TABS[btn.dataset.tab]));
  });

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1900);
  }

  /* ---------- toggles & chips ---------- */
  document.addEventListener('click', (e) => {
    const sw = e.target.closest('.switch');
    if (sw) {
      const on = sw.getAttribute('aria-checked') === 'true';
      sw.setAttribute('aria-checked', String(!on));
      if (sw.id === 'logSwitch') state.logCaffeine = !on;
      return;
    }
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const group = chip.parentElement;
    if (group.id === 'laneChips') {
      chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    } else {
      $$('.chip', group).forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
      if (group.id === 'flavourFilters') renderFlavours(chip.textContent.trim());
    }
  });

  /* ---------- rendering ---------- */
  function renderRail() {
    $('#homeRail').innerHTML = FLAVOURS.slice(0, 5).map(f => `
      <button class="rail-item" type="button" data-flavour="${f.id}">
        <img src="${canSrc(f.id)}" alt="">
        <span>${f.name}</span>
      </button>`).join('');
  }

  function renderFlavours(filter) {
    const map = { 'All': null, 'Ultra · zero sugar': 'ultra', 'Punch': 'punch', 'Original': 'original' };
    const group = map[filter] === undefined ? null : map[filter];
    const list = group ? FLAVOURS.filter(f => f.group === group) : FLAVOURS;
    $('#flavourGrid').innerHTML = list.map(f => `
      <button class="flavour-card" type="button" data-flavour="${f.id}">
        ${f.drop ? '<span class="tag-drop">Drop</span>' : ''}
        <img src="${canSrc(f.id)}" alt="">
        <strong>${f.name}</strong>
        <small>${f.kind}</small>
      </button>`).join('');
  }

  function renderRewards() {
    $('#rewardList').innerHTML = REWARDS.map(r => {
      const affordable = state.xp >= r.cost;
      return `
        <div class="reward">
          <span class="reward-icon"><img src="${canSrc(r.icon)}" alt=""></span>
          <span class="reward-text">
            <strong>${r.name}</strong>
            <small>${r.cost.toLocaleString()} XP</small>
          </span>
          ${affordable
            ? `<button class="btn btn-sm" type="button" data-redeem="${r.cost}">Redeem</button>`
            : `<span class="locked">${(r.cost - state.xp).toLocaleString()} to go</span>`}
        </div>`;
    }).join('');
  }

  function render() {
    const pct = Math.min(100, Math.round((state.caffeine / DAILY_GUIDE) * 100));
    const lvl = nextLevel();
    const levelFloor = 1500;
    const progress = Math.min(100, Math.round(((state.xp - levelFloor) / (lvl.at - levelFloor)) * 100));

    $('#xpHome').textContent = state.xp.toLocaleString();
    $('#xpRewards').textContent = state.xp.toLocaleString();
    $('#xpBar').style.width = Math.max(4, progress) + '%';
    $('#xpToNext').textContent = Math.max(0, lvl.at - state.xp).toLocaleString();

    $('#caffHome').textContent = state.caffeine;
    $('#caffValue').textContent = state.caffeine;
    $('#miniRing').style.setProperty('--pct', pct);
    const ring = $('#caffRing');
    ring.style.setProperty('--pct', pct);
    ring.style.setProperty('--ring-color', state.caffeine > DAILY_GUIDE ? 'var(--red)' : 'var(--green)');
    $('#todayBar').style.height = Math.max(6, pct) + '%';

    const over = state.caffeine > DAILY_GUIDE;
    $('#caffHeadline').textContent = over
      ? "You're over the daily guide"
      : state.caffeine > DAILY_GUIDE * 0.75
        ? "You're close to the daily guide"
        : "You're well within the daily guide";
    $('#caffHomeNote').textContent = over ? 'Over the 400mg daily guide' : 'Well within the daily guide';
    $('#caffSub').textContent = `${state.scansToday} can${state.scansToday === 1 ? '' : 's'} logged · last at ${state.lastScan || '3:40pm'}`;

    renderRewards();
  }

  /* ---------- flavour detail ---------- */
  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-flavour]');
    if (!card) return;
    openFlavour(card.dataset.flavour);
  });

  let currentFlavour = 'ultra-red';
  function openFlavour(id) {
    const f = flavour(id);
    currentFlavour = id;
    $('#detailHero').style.setProperty('--accent', f.accent);
    $('#detailCan').src = canSrc(f.id);
    $('#detailCan').alt = `Monster ${f.name} can`;
    $('#detailKind').textContent = f.kind;
    $('#detailName').textContent = f.name;
    $('#detailPrice').textContent = f.price;
    $('#detailDesc').textContent = f.desc;
    $('#detailCaff').textContent = f.caffeine + 'mg';
    $('#detailSugar').textContent = f.sugar;
    $('#detailKcal').textContent = f.kcal;
    $('#detailGuide').textContent = `That's ${Math.round((f.caffeine / DAILY_GUIDE) * 100)}% of your daily caffeine guide.`;
    $('#favBtn').textContent = '♡';
    $('#scanView').style.backgroundImage =
      `linear-gradient(rgba(0,0,0,.25), rgba(0,0,0,.45)), url('${canSrc(f.id)}')`;
    show('detail');
  }

  $('#favBtn').addEventListener('click', function () {
    const saved = this.textContent === '♥';
    this.textContent = saved ? '♡' : '♥';
    toast(saved ? 'Removed from saved' : 'Saved to your flavours');
  });

  /* ---------- scan flow ---------- */
  $('#scanBtn').addEventListener('click', () => {
    if (state.scansToday >= SCAN_LIMIT) {
      toast(`Daily limit reached · ${SCAN_LIMIT} scans a day`);
      return;
    }
    const pill = $('#scanPill');
    pill.textContent = 'Reading code…';
    setTimeout(() => {
      const f = flavour(currentFlavour);
      pill.textContent = `✓ ${f.name} detected`;
      setTimeout(() => {
        state.xp += 50;
        state.scansToday += 1;
        if (state.logCaffeine) state.caffeine += f.caffeine;
        state.lastScan = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();

        $('#successCan').src = canSrc(f.id);
        $('#successCan').alt = `Monster ${f.name} can`;
        $('#successCaff').textContent = f.caffeine + 'mg';
        $('#successCaffNote').textContent = `Today: ${state.caffeine} / ${DAILY_GUIDE}mg`;
        $('#successTotal').textContent =
          `New total ${state.xp.toLocaleString()} XP · ${Math.max(0, nextLevel().at - state.xp).toLocaleString()} to ${nextLevel().name}`;
        render();
        pill.textContent = 'Looking for a code…';
        show('success');
      }, 700);
    }, 900);
  });

  /* ---------- redeem ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-redeem]');
    if (!btn) return;
    const cost = Number(btn.dataset.redeem);
    if (state.xp < cost) return;
    state.xp -= cost;
    render();
    toast('Redeemed · check your email');
  });

  /* ---------- drop countdown ---------- */
  const dropAt = Date.now() + (2 * 3600 + 14 * 60 + 36) * 1000;
  function tickCountdown() {
    const left = Math.max(0, dropAt - Date.now());
    const s = Math.floor(left / 1000);
    const dd = Math.floor(s / 86400);
    const hh = Math.floor((s % 86400) / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    const pad = (n) => String(n).padStart(2, '0');
    $$('[data-countdown]').forEach(el => { el.textContent = `${pad(hh)}:${pad(mm)}:${pad(ss)}`; });
    const parts = $('[data-countdown-parts]');
    if (parts) {
      $('[data-dd]', parts).textContent = pad(dd);
      $('[data-hh]', parts).textContent = pad(hh);
      $('[data-mm]', parts).textContent = pad(mm);
      $('[data-ss]', parts).textContent = pad(ss);
    }
  }
  setInterval(tickCountdown, 1000);
  tickCountdown();

  $('#notifyBtn').addEventListener('click', function () {
    const on = this.dataset.on === '1';
    this.dataset.on = on ? '0' : '1';
    this.textContent = on ? 'Notify me when it drops' : '✓ You\'re on the list';
    this.classList.toggle('btn-ghost', !on);
    const waiting = $('#waiting');
    waiting.textContent = (2184 + (on ? 0 : 1)).toLocaleString();
    toast(on ? 'Reminder removed' : 'We\'ll ping you at 9am');
  });

  /* ---------- status bar clock ---------- */
  function tickClock() {
    $('#clock').textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  setInterval(tickClock, 20000);
  tickClock();

  /* ---------- reset ---------- */
  $('#resetBtn').addEventListener('click', () => {
    state.xp = 2450; state.caffeine = 160; state.scansToday = 1; state.lastScan = null; state.logCaffeine = true;
    $('#logSwitch').setAttribute('aria-checked', 'true');
    history = [];
    render();
    show('splash', { replace: true });
  });

  /* ---------- go ---------- */
  renderRail();
  renderFlavours('All');
  render();
})();
