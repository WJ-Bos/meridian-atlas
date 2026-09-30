// App shell: routing between Globe / Course / Practice / Index / Progress, search, and map controls.
(function (GA) {
  const { data: D, store, esc } = GA;
  const stage = () => GA.$('#stage');
  let view = null, ignoreHash = false;

  const app = GA.app = {
    userPlates: false,

    go(v, opts = {}) {
      let hash = v;
      if (v === 'course' && opts.lesson) hash = 'lesson-' + opts.lesson;
      else if (v === 'course' && opts.tour) hash = 'tour-' + slug(opts.tour);
      else if (v === 'explore' && opts.country && opts.region != null) hash = `region-${opts.country}-${opts.region}`;
      else if (v === 'explore' && opts.country) hash = 'country-' + opts.country;
      if (location.hash.slice(1) !== hash) { ignoreHash = true; location.hash = hash; }
      show(v, opts);
    },
    openCountry(id) { app.go('explore', { country: id }); },
    openRegion(id, k) { app.go('explore', { country: id, region: k }); },
    closeCountry() { GA.globe.select(null, { fly: false }); app.go('explore'); },
    setLens(key, programmatic) { GA.globe.setLens(key); GA.$('#lensSelect').value = key; },
    setPlates(on, programmatic) {
      if (!programmatic) app.userPlates = on;
      GA.globe.setPlates(on); GA.$('#togglePlates').setAttribute('aria-pressed', String(on));
    },
  };

  const slug = s => s.toLowerCase().replace(/[^a-z]+/g, '-');

  function show(v, opts) {
    const prev = view; view = v;
    if (prev === 'practice' && v !== 'practice') GA.practice.leave();
    if (prev === 'course' && v !== 'course') GA.course.leave();
    if (prev === 'explore' && v !== 'explore') GA.dossier.stopQuiz();
    GA.$$('.nav-link').forEach(a => a.dataset.view === v ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    const sheet = GA.$('#sheet');
    sheet.hidden = !(v === 'index' || v === 'progress');
    stage().classList.remove('panel-closed');
    GA.$('#mapControls').hidden = v === 'practice';
    if (v === 'explore') {
      if (opts.country && D.byId[opts.country] && opts.region != null) { GA.globe.selectRegion(opts.country, +opts.region); GA.dossier.renderRegion(opts.country, +opts.region); }
      else if (opts.country && D.byId[opts.country]) { GA.globe.select(opts.country); GA.dossier.render(opts.country, opts.tab); }
      else { GA.globe.select(null, { fly: false }); exploreHome(); }
    } else if (v === 'course') {
      GA.globe.select(null, { fly: false });
      if (opts.lesson) GA.course.lesson(opts.lesson);
      else if (opts.tour) GA.course.tour(opts.tour, opts.at);
      else GA.course.home();
    } else if (v === 'practice') {
      GA.globe.select(null, { fly: false });
      GA.practice.home(opts);
    } else if (v === 'index') GA.views.index();
    else if (v === 'progress') GA.views.progress();
    D.refreshFlags(GA.$('#panelInner'));
  }

  function route() {
    if (ignoreHash) { ignoreHash = false; return; }
    const h = location.hash.slice(1);
    if (h.startsWith('country-')) return show('explore', { country: h.slice(8) });
    if (h.startsWith('region-')) { const [, id, k] = h.split('-'); return show('explore', { country: id, region: +k }); }
    if (h.startsWith('lesson-')) return show('course', { lesson: h.slice(7) });
    if (h.startsWith('tour-')) { const s = D.subregions().find(x => slug(x.name) === h.slice(5)); return show('course', s ? { tour: s.name } : {}); }
    if (['course', 'practice', 'index', 'progress'].includes(h)) return show(h, {});
    show('explore', {});
  }

  // ----- the Globe home panel -----
  function countryOfDay() {
    const pool = D.countries.filter(c => c.sovereign).sort((a, b) => a.id.localeCompare(b.id));
    const d = new Date(), n = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate();
    return pool[(n * 7919) % pool.length];
  }
  function exploreHome() {
    const p = GA.$('#panelInner');
    const next = GA.lessons.find(l => !store.state.lessons[l.id]);
    const cod = countryOfDay();
    const recent = Object.entries(store.state.visited).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id]) => id).filter(id => D.byId[id]);
    const known = D.countries.filter(c => c.sovereign && store.mastery(c.id) >= .6).length;
    p.innerHTML = `
      <button class="panel-close" id="homeClose" aria-label="Hide this panel"><svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2 2 12" stroke="currentColor" stroke-width="1.6"/></svg></button>
      <p class="kicker">${D.countries.length} countries and territories</p>
      <h1 class="display">Meridian Atlas</h1>
      <div class="prose" style="margin-top:14px"><p>Drag to turn the globe and scroll to zoom. Click any country to open its profile: key facts, a full history, geography, politics, economy, people and culture.</p></div>
      <h2 class="h3" style="margin-top:22px">Where to begin</h2>
      <ol class="lesson-list">
        <li class="lesson-item"><button id="hCourse"><span class="lesson-no">1</span><span><span class="lesson-name">${next ? (GA.lessons.indexOf(next) ? 'Continue the course' : 'Start the course') : 'Tour the regions'}</span><span class="lesson-sum">${next ? `Lesson ${GA.lessons.indexOf(next) + 1}: ${esc(next.title)}` : 'All ten lessons done. Visit each region country by country.'}</span></span><span class="lesson-state">${next ? next.minutes + ' min' : ''}</span></button></li>
        <li class="lesson-item"><button id="hTour"><span class="lesson-no">2</span><span><span class="lesson-name">Tour a region</span><span class="lesson-sum">Walk through every country in ${esc(cod.subregion)}, largest first.</span></span><span class="lesson-state"></span></button></li>
        <li class="lesson-item"><button id="hPractice"><span class="lesson-no">3</span><span><span class="lesson-name">Test yourself</span><span class="lesson-sum">Find countries on the globe, capitals, flags and scale.</span></span><span class="lesson-state">${known ? known + ' known' : ''}</span></button></li>
      </ol>
      <hr class="section-rule">
      <p class="kicker">Country of the day</p>
      <div style="display:flex;gap:14px;align-items:center;margin-top:6px">
        ${D.flagImg(cod.id, 'flag flag-md')}
        <div style="min-width:0"><div class="h2" style="margin:0">${esc(cod.name)}</div><div class="small muted">Capital ${esc(cod.capital[0] || '—')}, ${GA.fmtBig(cod.population)} people</div></div>
      </div>
      <div class="btn-row" style="margin-top:14px"><button class="btn btn-primary" id="hCod">Open ${esc(cod.name)}</button><button class="btn" id="hRandom">Surprise me</button></div>
      ${recent.length ? `<hr class="section-rule"><p class="kicker">Recently opened</p><div class="chips" style="margin-top:8px">${recent.map(id => `<button class="chip" data-go="${id}">${D.flagImg(id, 'flag flag-sm')}${esc(D.byId[id].name)}</button>`).join('')}</div>` : ''}
      <hr class="section-rule">
      <p class="small faint">Keyboard: press / to search. In practice, 1–4 choose an answer.</p>`;
    GA.$('#homeClose').onclick = () => stage().classList.add('panel-closed');
    GA.$('#hCourse').onclick = () => next ? app.go('course', { lesson: next.id }) : app.go('course');
    GA.$('#hTour').onclick = () => app.go('course', { tour: cod.subregion });
    GA.$('#hPractice').onclick = () => app.go('practice');
    GA.$('#hCod').onclick = () => app.openCountry(cod.id);
    GA.$('#hRandom').onclick = () => app.openCountry(GA.pick(D.countries.filter(c => c.sovereign)).id);
    GA.$$('[data-go]', p).forEach(b => (b.onclick = () => app.openCountry(b.dataset.go)));
    p.scrollTop = 0;
  }

  // ----- search -----
  function initSearch() {
    const input = GA.$('#searchInput'), list = GA.$('#searchResults');
    let items = [], sel = 0;
    const draw = () => {
      list.hidden = !items.length;
      list.innerHTML = items.map((c, i) => `<li role="option" aria-selected="${i === sel}" data-id="${c.id}">${D.flagImg(c.id, 'flag flag-sm')}<span>${esc(c.name)}</span><span class="sub">${esc(c.capital[0] || '')}</span></li>`).join('');
      GA.$$('li', list).forEach(li => (li.onmousedown = e => { e.preventDefault(); choose(li.dataset.id); }));
    };
    const choose = id => { input.value = ''; items = []; draw(); input.blur(); app.openCountry(id); };
    input.oninput = () => { items = D.search(input.value); sel = 0; draw(); };
    input.onkeydown = e => {
      if (e.key === 'ArrowDown') { sel = Math.min(items.length - 1, sel + 1); draw(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); draw(); e.preventDefault(); }
      else if (e.key === 'Enter' && items[sel]) choose(items[sel].id);
      else if (e.key === 'Escape') { input.value = ''; items = []; draw(); input.blur(); }
    };
    input.onblur = () => setTimeout(() => { list.hidden = true; }, 100);
    input.onfocus = () => { if (items.length) list.hidden = false; };
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) { e.preventDefault(); if (view === 'index' || view === 'progress') app.go('explore'); input.focus(); }
    });
  }

  function initControls() {
    GA.$('#lensSelect').onchange = e => app.setLens(e.target.value);
    const tog = (id, fn) => { const b = GA.$(id); b.onclick = () => { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); fn(on); }; };
    tog('#toggleSatellite', on => GA.globe.setSatellite(on));
    tog('#toggleNames', on => GA.globe.setNames(on));
    initTheme();
    tog('#togglePlates', on => app.setPlates(on));
    tog('#toggleCapitals', on => GA.globe.setCapitals(on));
    tog('#toggleSpin', on => GA.globe.setSpin(on));
    GA.$$('.nav-link').forEach(a => a.addEventListener('click', e => {
      // clicking Globe while already there reopens the guide panel
      if (a.dataset.view === 'explore' && view === 'explore') { e.preventDefault(); app.go('explore'); }
    }));
  }

  // Dark is the default. The choice is remembered in this browser.
  function initTheme() {
    const btn = GA.$('#themeBtn');
    const label = () => {
      const light = document.documentElement.getAttribute('data-theme') === 'light';
      const t = light ? 'Switch to dark mode' : 'Switch to light mode';
      btn.setAttribute('aria-label', t); btn.title = t;
    };
    label();
    btn.onclick = () => {
      const light = document.documentElement.getAttribute('data-theme') !== 'light';
      if (light) document.documentElement.setAttribute('data-theme', 'light'); else document.documentElement.removeAttribute('data-theme');
      try { localStorage.setItem('meridian-theme', light ? 'light' : 'dark'); } catch { }
      label(); GA.globe.setTheme();
    };
  }

  async function boot() {
    const text = GA.$('#loadingText');
    try {
      const adminIndex = D.loadAdminIndex();
      await D.load(t => (text.textContent = t));
      await adminIndex;
      GA.globe.init(GA.$('#globe'));
      initSearch(); initControls();
      window.addEventListener('hashchange', route);
      route();
      GA.$('#loading').classList.add('gone');
      setTimeout(() => (GA.$('#loading').hidden = true), 600);
      // background loads
      D.lazy('flags').then(() => D.refreshFlags());
      D.prefetch();
    } catch (err) {
      console.error(err);
      text.innerHTML = `The atlas could not load its data: ${esc(err.message)}.<br>If you opened index.html directly from disk, run <b>start.bat</b> instead so the files are served over http.`;
    }
  }
  boot();
})(window.GA);
