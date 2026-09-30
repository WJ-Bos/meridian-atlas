// Practice: six question types, scoped by region, scheduled with Leitner-box spaced repetition.
(function (GA) {
  const { data: D, store, esc } = GA;
  const MODES = [
    { id: 'smart', name: 'Smart review', desc: 'A mix of every type, weighted towards what you are due to review or keep missing.', icon: '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>' },
    { id: 'locate', name: 'Find it on the globe', desc: 'You get a name. Click the country on the globe.', skill: 'locate', icon: '<circle cx="12" cy="10" r="3"/><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/>' },
    { id: 'name', name: 'Name the highlighted country', desc: 'The globe lights up a country. Pick its name.', skill: 'name', icon: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/>' },
    { id: 'capital', name: 'Capitals', desc: 'Country to capital, and capital to country.', skill: 'capital', icon: '<path d="M4 21h16M6 21V10l6-5 6 5v11M10 21v-5h4v5"/>' },
    { id: 'flag', name: 'Flags', desc: 'Match flags to countries, both ways.', skill: 'flag', icon: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>' },
    { id: 'scale', name: 'Bigger or smaller', desc: 'Which has more people? Which covers more land? Builds a sense of scale.', skill: 'scale', icon: '<path d="M4 20V14M10 20V8M16 20V4"/>' },
  ];
  const setup = { mode: 'smart', scope: 'world', length: 10, territories: false };
  let S = null; // running session

  const panel = () => GA.$('#panelInner');
  const scopeIds = scope => D.countries.filter(c => (setup.territories || c.sovereign) && (
    scope === 'world' || (scope.startsWith('reg:') && c.region === scope.slice(4)) || (scope.startsWith('sub:') && c.subregion === scope.slice(4)) ||
    (scope === 'weak' && store.weak(c.id)) || (scope.startsWith('ids:') && scope.slice(4).split(',').includes(c.id))
  )).map(c => c.id);
  function scopeLabel(scope) {
    if (scope === 'world') return 'the whole world';
    if (scope === 'weak') return 'countries you keep missing';
    if (scope.startsWith('ids:')) return 'your missed countries';
    return scope.slice(4);
  }

  // ----- setup screen -----
  function home(opts = {}) {
    leave(true);
    if (opts.scope) setup.scope = opts.scope;
    if (opts.start) return start(opts.focus);
    D.lazy('flags').then(() => D.refreshFlags(panel()));
    const subs = D.subregions();
    const weakN = D.countries.filter(c => store.weak(c.id)).length;
    const dueN = D.countries.filter(c => c.sovereign && store.practised(c.id) && store.SKILLS.some(s => store.card(c.id, s) && store.due(c.id, s))).length;
    const p = panel();
    p.innerHTML = `
      <p class="kicker">Practice</p>
      <h1 class="display">Test yourself</h1>
      <p class="prose" style="margin-top:12px">Every answer updates your memory schedule. Countries you get right come back less often. Ones you miss come back soon, until they stick.</p>
      ${dueN || weakN ? `<div class="callout">${dueN ? `<b>${dueN}</b> countries are due for review. ` : ''}${weakN ? `<b>${weakN}</b> keep tripping you up.` : ''}</div>` : ''}
      <div class="field"><span class="field-label">What to practise</span>
        <div class="mode-list">${MODES.map(m => `<button class="mode" data-mode="${m.id}" aria-pressed="${setup.mode === m.id}"><svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">${m.icon}</svg><div><b>${m.name}</b><span>${m.desc}</span></div></button>`).join('')}</div></div>
      <div class="field"><label for="scopeSel">Which countries</label>
        <select id="scopeSel">
          <option value="world">Whole world</option>
          ${weakN ? `<option value="weak">Ones I keep missing (${weakN})</option>` : ''}
          <optgroup label="Continents">${D.regions.map(r => `<option value="reg:${r}">${r}</option>`).join('')}</optgroup>
          <optgroup label="Regions">${subs.map(s => `<option value="sub:${esc(s.name)}">${esc(s.name)} (${s.ids.length})</option>`).join('')}</optgroup>
        </select></div>
      <div class="field"><span class="field-label">Questions</span>
        <div class="seg" id="lenSeg">${[10, 20, 30].map(n => `<button data-len="${n}" aria-pressed="${setup.length === n}">${n}</button>`).join('')}</div></div>
      <div class="field"><label class="check"><input type="checkbox" id="terrChk" ${setup.territories ? 'checked' : ''}> Include territories and dependencies</label></div>
      <div class="btn-row" style="margin-top:24px"><button class="btn btn-primary" id="goBtn">Start</button></div>
      ${recent()}`;
    const sel = GA.$('#scopeSel'); sel.value = setup.scope; if (sel.value !== setup.scope) { setup.scope = 'world'; sel.value = 'world'; }
    sel.onchange = () => (setup.scope = sel.value);
    GA.$$('[data-mode]', p).forEach(b => (b.onclick = () => { setup.mode = b.dataset.mode; GA.$$('[data-mode]', p).forEach(x => x.setAttribute('aria-pressed', String(x === b))); }));
    GA.$$('[data-len]', p).forEach(b => (b.onclick = () => { setup.length = +b.dataset.len; GA.$$('[data-len]', p).forEach(x => x.setAttribute('aria-pressed', String(x === b))); }));
    GA.$('#terrChk').onchange = e => (setup.territories = e.target.checked);
    GA.$('#goBtn').onclick = () => start(opts.focus);
    p.scrollTop = 0;
  }
  function recent() {
    const s = store.state.sessions.slice(-5).reverse();
    if (!s.length) return '';
    return `<hr class="section-rule"><h2 class="h3">Recent sessions</h2><ul class="miss-list">${s.map(x => `<li><span>${esc(MODES.find(m => m.id === x.mode)?.name || x.mode)}, ${esc(scopeLabel(x.scope))}</span><span class="muted num">${x.correct}/${x.n}</span></li>`).join('')}</ul>`;
  }

  // ----- question generation -----
  function priority(id, skill) {
    const c = store.card(id, skill);
    if (!c) return 3;                        // new
    if (c.due <= Date.now()) return 4 + (5 - c.b); // due, weaker = sooner
    return 0.4;
  }
  function weightedPick(ids, skill, avoid) {
    const cand = ids.filter(id => !avoid.has(id));
    const pool = cand.length ? cand : ids;
    const w = pool.map(id => priority(id, skill) * (0.6 + Math.random() * 0.8));
    let best = 0; for (let i = 1; i < pool.length; i++) if (w[i] > w[best]) best = i;
    return pool[best];
  }
  function distractors(target, n, valid) {
    const t = D.byId[target];
    const tiers = [
      D.countries.filter(c => c.subregion === t.subregion),
      D.countries.filter(c => c.region === t.region),
      D.countries,
    ];
    const out = new Set();
    for (const tier of tiers) {
      for (const c of GA.shuffle(tier)) {
        if (out.size >= n) break;
        if (c.id !== target && (setup.territories || c.sovereign) && valid(c)) out.add(c.id);
      }
      if (out.size >= n) break;
    }
    return [...out];
  }

  function makeQuestion(mode, ids, avoid) {
    const kinds = mode === 'smart' ? ['locate', 'name', 'capital', 'capitalRev', 'flag', 'flagRev', 'scale'] : mode === 'capital' ? ['capital', 'capitalRev'] : mode === 'flag' ? ['flag', 'flagRev'] : [mode];
    const kind = GA.pick(kinds);
    const skill = { locate: 'locate', name: 'name', capital: 'capital', capitalRev: 'capital', flag: 'flag', flagRev: 'flag', scale: 'scale' }[kind];
    const usable = ids.filter(id => {
      const c = D.byId[id];
      if (skill === 'capital') return c.capital.length;
      if (skill === 'locate' || skill === 'name') return c.latlng;
      if (kind === 'scale') return c.population && c.area;
      return true;
    });
    if (!usable.length) return null;
    const id = S.focus && !S.asked.size ? S.focus : weightedPick(usable, skill, avoid);
    const c = D.byId[id];
    const q = { kind, skill, id };
    if (kind === 'locate') { q.prompt = `Find ${c.name}`; q.hint = `Click it on the globe. ${c.area < 1200 ? 'It is small: look for the dot.' : ''}`; }
    if (kind === 'name') { q.prompt = 'Which country is highlighted?'; q.options = GA.shuffle([id, ...distractors(id, 3, x => x.latlng)]); q.label = x => D.byId[x].name; }
    if (kind === 'capital') { q.prompt = `What is the capital of ${c.name}?`; q.options = GA.shuffle([id, ...distractors(id, 3, x => x.capital.length && x.capital[0] !== c.capital[0])]); q.label = x => D.byId[x].capital[0]; }
    if (kind === 'capitalRev') { q.prompt = `${c.capital[0]} is the capital of…`; q.options = GA.shuffle([id, ...distractors(id, 3, x => x.capital.length)]); q.label = x => D.byId[x].name; }
    if (kind === 'flag') { q.prompt = 'Whose flag is this?'; q.flag = id; q.options = GA.shuffle([id, ...distractors(id, 3, () => true)]); q.label = x => D.byId[x].name; }
    if (kind === 'flagRev') { q.prompt = `Which is the flag of ${c.name}?`; q.options = GA.shuffle([id, ...distractors(id, 3, () => true)]); q.flagOptions = true; }
    if (kind === 'scale') {
      const measure = Math.random() < .5 ? 'population' : 'area';
      const others = D.countries.filter(o => o.id !== id && o.sovereign && o[measure] && Math.abs(Math.log(o[measure] / c[measure])) < 1.2 && Math.abs(Math.log(o[measure] / c[measure])) > 0.08);
      const o = others.length ? GA.pick(others) : D.byId[distractors(id, 1, x => x[measure])[0]];
      q.measure = measure; q.options = GA.shuffle([id, o.id]);
      q.prompt = measure === 'population' ? 'Which has more people?' : 'Which covers more land?';
      q.answerId = c[measure] >= o[measure] ? id : o.id; q.label = x => D.byId[x].name;
    }
    return q;
  }

  // ----- session -----
  async function start(focus) {
    const ids = scopeIds(setup.scope);
    if (ids.length < 4) { GA.toast('Pick a larger set of countries: this one has fewer than 4.'); return; }
    await D.lazy('flags');
    S = { ids, n: Math.min(setup.length, setup.mode === 'locate' ? 99 : 99), i: 0, correct: 0, misses: [], asked: new Set(), focus: focus && ids.includes(focus) ? focus : null, mode: setup.mode, scope: setup.scope };
    GA.globe.setHighlight(setup.scope === 'world' ? null : ids);
    next();
  }
  function next() {
    GA.globe.clearFlashes();
    if (S.i >= setup.length) return finish();
    let q = makeQuestion(S.mode, S.ids, S.asked);
    for (let t = 0; !q && t < 5; t++) q = makeQuestion(S.mode, S.ids, S.asked);
    if (!q) return finish();
    S.q = q; S.asked.add(q.id); S.i++;
    render();
  }
  function render() {
    const q = S.q, p = panel(), c = D.byId[q.id];
    const g = GA.globe;
    g.select(null, { fly: false });
    g.setInteraction({ tooltips: false, onClick: q.kind === 'locate' ? onGlobeAnswer : () => { } });
    if (q.kind === 'name') { g.select(q.id); }
    else if (q.kind === 'locate') { g.view(20, (((c.latlng[1] + 180 + (Math.random() * 140 - 70)) % 360) + 360) % 360 - 180, 2.6); }

    let body = '';
    if (q.options && !q.flagOptions) {
      body = `<div class="options">${q.options.map((id, k) => `<button class="option" data-id="${id}"><kbd>${k + 1}</kbd>${q.kind === 'scale' ? D.flagImg(id, 'flag flag-md') : ''}<span>${esc(q.label(id))}</span></button>`).join('')}</div>`;
    } else if (q.flagOptions) {
      body = `<div class="options flag-options">${q.options.map((id, k) => `<button class="option" data-id="${id}" aria-label="Option ${k + 1}"><kbd>${k + 1}</kbd>${D.flagImg(id, 'flag').replace(/alt="[^"]*"/, 'alt=""')}</button>`).join('')}</div>`;
    }
    p.innerHTML = `
      <div class="q-meta"><span>Question ${S.i} of ${setup.length}</span><span>${S.correct} right</span><button class="linkish small" id="qQuit">End session</button></div>
      <div class="q-track"><i style="width:${(S.i - 1) / setup.length * 100}%"></i></div>
      ${q.flag ? D.flagImg(q.flag, 'flag q-flag').replace(/alt="[^"]*"/, 'alt="A flag to identify"') : ''}
      <h1 class="q-prompt">${esc(q.prompt)}</h1>
      ${q.hint ? `<p class="q-hint">${esc(q.hint)}</p>` : ''}
      ${q.kind === 'locate' ? `<div class="btn-row"><button class="btn btn-quiet" id="qSkip">Show me</button></div>` : ''}
      ${body}
      <div id="qFeedback"></div>`;
    GA.$$('.option', p).forEach(b => (b.onclick = () => answer(b.dataset.id)));
    GA.$('#qQuit').onclick = finish;
    const sk = GA.$('#qSkip'); if (sk) sk.onclick = () => onGlobeAnswer(null, null, true);
    GA.$('#banner').hidden = q.kind !== 'locate' || !GA.isNarrow();
    GA.$('#banner').textContent = q.prompt;
    p.scrollTop = 0;
  }

  function onGlobeAnswer(id, coords, gaveUp) {
    if (!S || S.q.done) return;
    const q = S.q, target = D.byId[q.id];
    const ok = id === q.id;
    let extra = '';
    if (!ok && id) {
      GA.globe.flash(id, 'signal');
      const km = GA.haversine(D.byId[id].latlng, target.latlng);
      extra = `You clicked ${D.byId[id].name}, about ${GA.fmtInt(Math.round(km / 10) * 10)} km away.`;
    } else if (!ok && coords && !gaveUp) {
      const km = GA.haversine([coords.lat, coords.lng], target.latlng);
      extra = `You clicked open water, about ${GA.fmtInt(Math.round(km / 10) * 10)} km from it.`;
    }
    settle(ok, extra);
  }
  function answer(id) {
    const q = S.q; if (q.done) return;
    const right = q.answerId || q.id;
    const ok = id === right;
    GA.$$('.option', panel()).forEach(b => { b.disabled = true; if (b.dataset.id === right) b.classList.add('correct'); if (b.dataset.id === id && !ok) b.classList.add('wrong'); });
    let extra = '';
    if (q.kind === 'scale') {
      const [a, b] = q.options.map(x => D.byId[x]);
      const f = q.measure === 'population' ? x => GA.fmtBig(x.population) + ' people' : x => GA.fmtInt(x.area) + ' km²';
      extra = `${a.name}: ${f(a)}. ${b.name}: ${f(b)}.`;
    } else if (!ok && q.kind === 'capital') extra = `${D.byId[id].capital[0]} is the capital of ${D.byId[id].name}.`;
    else if (!ok && (q.kind === 'capitalRev' || q.kind === 'name' || q.kind === 'flag' || q.kind === 'flagRev')) extra = `You chose ${D.byId[id].name}${q.kind === 'capitalRev' && D.byId[id].capital[0] ? ', whose capital is ' + D.byId[id].capital[0] : ''}.`;
    if (!ok && id && q.kind !== 'scale') GA.globe.flash(id, 'signal');
    settle(ok, extra);
  }
  function settle(ok, extra) {
    const q = S.q; q.done = true;
    const c = D.byId[q.id];
    store.answer(q.id, q.skill, ok);
    if (ok) S.correct++; else S.misses.push(q.id);
    GA.globe.flash(q.id, 'verdigris');
    if (q.kind !== 'scale') GA.globe.flyTo(q.id);
    GA.$('#banner').hidden = true;
    const fb = GA.$('#qFeedback');
    fb.innerHTML = `<div class="feedback ${ok ? 'good' : 'bad'}">
      <p class="feedback-title">${ok ? 'Correct' : q.kind === 'locate' ? `That is ${esc(c.name)}, shown in green` : 'Not quite'}</p>
      <p>${esc(extra)} ${q.kind !== 'scale' ? `${esc(c.name)}: capital ${esc(c.capital[0] || 'none')}, ${esc(c.subregion || c.region)}, ${GA.fmtBig(c.population)} people.` : ''}</p>
      <div class="btn-row"><button class="btn btn-primary" id="qNext">${S.i >= setup.length ? 'See results' : 'Next question'}</button>${q.kind !== 'scale' ? `<button class="btn btn-quiet" id="qOpen">Open ${esc(c.name)}</button>` : ''}</div></div>`;
    GA.$('#qNext').onclick = next;
    GA.$('#qNext').focus({ preventScroll: true });
    const op = GA.$('#qOpen'); if (op) op.onclick = () => { finish(true); GA.app.openCountry(q.id); };
    fb.scrollIntoView({ block: 'nearest', behavior: GA.reducedMotion() ? 'auto' : 'smooth' });
  }

  function finish(silent) {
    if (!S) return;
    const answered = S.i - (S.q && !S.q.done ? 1 : 0);
    if (answered > 0) store.session({ mode: S.mode, scope: S.scope, n: answered, correct: S.correct });
    const done = S; S = null;
    GA.globe.setInteraction(); GA.globe.clearFlashes(); GA.globe.select(null, { fly: false }); GA.globe.setHighlight(null);
    GA.$('#banner').hidden = true;
    if (silent === true) return;
    const pct = answered ? Math.round(done.correct / answered * 100) : 0;
    const misses = [...new Set(done.misses)];
    const p = panel();
    p.innerHTML = `
      <p class="kicker">Session complete: ${esc(MODES.find(m => m.id === done.mode).name)}, ${esc(scopeLabel(done.scope))}</p>
      <div class="result-score">${done.correct}<span class="faint" style="font-size:32px"> / ${answered}</span></div>
      <p class="muted">${pct}% correct. ${pct >= 90 ? 'Excellent. Try a larger region or a harder mode.' : pct >= 60 ? 'Solid. The misses below will come back sooner in future sessions.' : 'This is how learning starts. Review the misses, then go again.'}</p>
      ${misses.length ? `<hr class="section-rule"><h2 class="h3">To review</h2><ul class="miss-list">${misses.map(id => `<li>${D.flagImg(id, 'flag flag-sm')}<button class="linkish" data-go="${id}">${esc(D.byId[id].name)}</button><span class="muted">${esc(D.byId[id].capital[0] || '')}</span></li>`).join('')}</ul>` : ''}
      <div class="btn-row" style="margin-top:22px">
        <button class="btn btn-primary" id="rAgain">Go again</button>
        ${misses.length >= 4 ? `<button class="btn" id="rMisses">Practise only these ${misses.length}</button>` : ''}
        <button class="btn btn-quiet" id="rSetup">Change settings</button>
      </div>`;
    GA.$$('[data-go]', p).forEach(b => (b.onclick = () => GA.app.openCountry(b.dataset.go)));
    GA.$('#rAgain').onclick = () => start();
    GA.$('#rSetup').onclick = () => home();
    const rm = GA.$('#rMisses'); if (rm) rm.onclick = () => { setup.scope = 'ids:' + misses.join(','); start(); };
    p.scrollTop = 0;
  }

  function leave(keepPanel) {
    if (S) finish(true);
    GA.globe.setInteraction(); GA.globe.clearFlashes();
  }

  // number keys answer, Enter advances
  document.addEventListener('keydown', e => {
    if (!S || /INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName)) return;
    const opts = GA.$$('.option:not([disabled])', panel());
    if (/^[1-4]$/.test(e.key) && opts[+e.key - 1]) { opts[+e.key - 1].click(); e.preventDefault(); }
  });

  GA.practice = { home, start, leave, get active() { return !!S; } };
})(window.GA);
