// Course: lesson list, scroll-driven lesson reader, end-of-lesson check, region tours, glossary.
(function (GA) {
  const { data: D, store, esc } = GA;
  let observer = null;
  const PARTS = { 1: 'Part one: the physical world', 2: 'Part two: the human world' };

  function panel() { return GA.$('#panelInner'); }
  function stopObserver() { if (observer) { observer.disconnect(); observer = null; } }

  // ----- globe instructions from lesson sections -----
  function resolveIds(h) {
    if (h === 'landlocked') return D.countries.filter(c => c.landlocked && c.sovereign).map(c => c.id);
    return h || null;
  }
  function applyGlobe(spec) {
    if (!spec) return;
    const g = GA.globe;
    g.clearFlashes();
    g.setHighlight(resolveIds(spec.highlight));
    g.setMarkers(spec.markers || []);
    g.setGuides(spec.guides || []);
    GA.app.setPlates(!!spec.plates, true);
    GA.app.setLens(spec.lens || 'region', true);
    if (spec.view) g.view(spec.view[0], spec.view[1], spec.view[2]);
  }
  function clearGlobe() {
    stopObserver();
    const g = GA.globe; g.setHighlight(null); g.setMarkers([]); g.setGuides([]); g.clearFlashes();
    GA.app.setPlates(GA.app.userPlates, true);
  }

  // ----- home -----
  function home() {
    clearGlobe();
    const lessons = GA.lessons, done = store.state.lessons;
    const next = lessons.find(l => !done[l.id]);
    const subs = D.subregions();
    const byRegion = {}; subs.forEach(s => (byRegion[s.region] ||= []).push(s));
    const p = panel();
    p.innerHTML = `
      <p class="kicker">Course</p>
      <h1 class="display">Learn the world from the ground up</h1>
      <div class="prose" style="margin-top:14px"><p>Ten lessons cover how the planet works and how people have divided it. Read them in order: each one moves the globe as you scroll. Then tour the world region by region, country by country.</p></div>
      ${next ? `<div class="callout" style="margin-top:6px">Up next: <b>${esc(next.title)}</b>, about ${next.minutes} minutes.
        <div class="btn-row" style="margin-top:10px"><button class="btn btn-primary" data-lesson="${next.id}">${Object.keys(done).length ? 'Continue' : 'Start lesson 1'}</button></div></div>`
        : `<div class="callout" style="margin-top:6px">You have finished all ten lessons. Keep going with the region tours below.</div>`}
      ${[1, 2].map(part => `<div class="part"><h2 class="part-title">${PARTS[part]}</h2><ol class="lesson-list">
        ${lessons.filter(l => l.part === part).map(l => {
          const i = lessons.indexOf(l) + 1, d = done[l.id];
          return `<li class="lesson-item"><button data-lesson="${l.id}"><span class="lesson-no">${i}</span>
            <span><span class="lesson-name">${esc(l.title)}</span><span class="lesson-sum">${esc(l.summary)}</span></span>
            <span class="lesson-state ${d ? 'done' : ''}">${d ? `Done, ${d.score}/${d.of}` : l.minutes + ' min'}</span></button></li>`;
        }).join('')}</ol></div>`).join('')}
      <div class="part"><h2 class="part-title">Part three: region by region</h2>
        <p class="muted small" style="margin:0 0 14px">Each tour visits every country in a region, largest first. Bars show how much of the region you know.</p>
        ${Object.entries(byRegion).map(([region, list]) => `<h3 class="h3" style="margin-top:18px">${esc(region)}</h3><div class="region-grid">
          ${list.map(s => {
            const known = s.ids.filter(id => store.mastery(id) >= .6).length;
            return `<button class="region-card" data-tour="${esc(s.name)}"><b>${esc(s.name)}</b><span>${s.ids.length} countries${store.state.tours[s.name] ? ', toured' : ''}</span>
              <div class="region-bar"><i style="width:${known / s.ids.length * 100}%"></i></div></button>`;
          }).join('')}</div>`).join('')}
      </div>
      <div class="part"><h2 class="part-title">Reference</h2><button class="btn" id="glossaryBtn">Open the glossary</button></div>`;
    GA.$$('[data-lesson]', p).forEach(b => (b.onclick = () => GA.app.go('course', { lesson: b.dataset.lesson })));
    GA.$$('[data-tour]', p).forEach(b => (b.onclick = () => GA.app.go('course', { tour: b.dataset.tour })));
    GA.$('#glossaryBtn').onclick = glossary;
    p.scrollTop = 0;
    GA.globe.view(20, 15, GA.isNarrow() ? 3.1 : 2.5);
  }

  // ----- lesson reader -----
  function lesson(id) {
    const L = GA.lessons.find(l => l.id === id); if (!L) return home();
    stopObserver();
    const idx = GA.lessons.indexOf(L), next = GA.lessons[idx + 1];
    const p = panel();
    p.innerHTML = `
      <button class="linkish small" id="backCourse">Back to the course</button>
      <p class="kicker" style="margin-top:14px">Lesson ${idx + 1} of ${GA.lessons.length}, about ${L.minutes} minutes</p>
      <h1 class="display">${esc(L.title)}</h1>
      <p class="official" style="margin-top:10px">${esc(L.summary)}</p>
      <hr class="section-rule">
      ${L.sections.map((s, i) => `<section class="lesson-section" data-sec="${i}">
        <h3>${esc(s.h)}</h3>
        ${s.globe ? `<button class="show-btn" data-show="${i}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18"/></svg>Show on the globe</button>` : ''}
        <div class="prose">${s.body.map(b => `<p>${esc(b)}</p>`).join('')}</div>
        ${s.callout ? `<div class="callout">${s.callout}</div>` : ''}
      </section>`).join('')}
      <hr class="section-rule">
      <h2 class="h2">Key terms</h2>
      <dl class="terms">${L.terms.map(t => `<div><dt>${esc(t.t)}</dt><dd>${esc(t.d)}</dd></div>`).join('')}</dl>
      <hr class="section-rule">
      <h2 class="h2">Check your understanding</h2>
      <p class="muted small" style="margin:0 0 16px">Five questions. Your score is saved when you finish.</p>
      <div id="lessonCheck"></div>
      <div id="lessonNext" hidden style="margin-top:22px">
        ${next ? `<button class="btn btn-primary" data-next="${next.id}">Next: ${esc(next.title)}</button>` : `<button class="btn btn-primary" data-home>Start the region tours</button>`}
      </div>`;
    GA.$('#backCourse').onclick = () => GA.app.go('course');
    GA.$$('[data-show]', p).forEach(b => (b.onclick = () => { setActive(+b.dataset.show); }));
    const nb = GA.$('[data-next]', p); if (nb) nb.onclick = () => GA.app.go('course', { lesson: nb.dataset.next });
    const hb = GA.$('[data-home]', p); if (hb) hb.onclick = () => GA.app.go('course');
    p.scrollTop = 0;

    let active = -1;
    function setActive(i) {
      if (i === active) return; active = i;
      GA.$$('.lesson-section', p).forEach(s => s.classList.toggle('active', +s.dataset.sec === i));
      applyGlobe(L.sections[i].globe);
    }
    setActive(0);
    // the section nearest the top third of the reading panel drives the globe
    const visible = new Map();
    observer = new IntersectionObserver(entries => {
      for (const e of entries) visible.set(+e.target.dataset.sec, e.isIntersecting ? e.boundingClientRect.top : null);
      const cand = [...visible.entries()].filter(([, t]) => t != null).sort((a, b) => a[0] - b[0]);
      if (cand.length) setActive(cand[0][0]);
    }, { root: p, rootMargin: '-20% 0px -55% 0px' });
    GA.$$('.lesson-section', p).forEach(s => observer.observe(s));

    runCheck(L);
  }

  function runCheck(L) {
    const box = GA.$('#lessonCheck');
    const qs = L.check.map(q => ({ ...q, opts: GA.shuffle(q.a), right: q.a[0] }));
    let answered = 0, score = 0;
    box.innerHTML = qs.map((q, i) => `<div class="check-q" style="margin-bottom:22px">
      <p class="check-q-title">${i + 1}. ${esc(q.q)}</p>
      <div class="options">${q.opts.map(o => `<button class="option" data-q="${i}" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>
      <p class="small muted" data-explain="${i}" hidden style="margin-top:8px"></p></div>`).join('');
    GA.$$('.option', box).forEach(b => (b.onclick = () => {
      const i = +b.dataset.q, q = qs[i], ok = b.dataset.o === q.right;
      GA.$$(`.option[data-q="${i}"]`, box).forEach(x => { x.disabled = true; if (x.dataset.o === q.right) x.classList.add('correct'); });
      if (!ok) b.classList.add('wrong');
      const ex = GA.$(`[data-explain="${i}"]`, box); ex.hidden = false; ex.textContent = (ok ? 'Correct. ' : `The answer is: ${q.right}. `) + q.explain;
      answered++; if (ok) score++;
      if (answered === qs.length) {
        store.lessonDone(L.id, score, qs.length);
        const r = GA.h(`<div class="feedback ${score >= 4 ? 'good' : 'bad'}"><p class="feedback-title">${score} of ${qs.length}</p><p>${score >= 4 ? 'Lesson complete. It is marked as done in your progress.' : 'Lesson marked as done. Scroll back up and reread the sections you missed, then try the next lesson.'}</p></div>`);
        box.appendChild(r);
        GA.$('#lessonNext').hidden = false;
      }
    }));
  }

  // ----- region tours -----
  function tour(subName, atId) {
    const sub = D.subregions().find(s => s.name === subName); if (!sub) return home();
    stopObserver();
    const ids = sub.ids.slice().sort((a, b) => (D.byId[b].population || 0) - (D.byId[a].population || 0));
    const territories = D.countries.filter(c => c.subregion === subName && !c.sovereign);
    let i = atId && ids.includes(atId) ? ids.indexOf(atId) + 1 : 0;
    const g = GA.globe;
    GA.app.setLens('region', true); g.setMarkers([]); g.setGuides([]);
    g.setHighlight(ids);
    const totalPop = ids.reduce((s, id) => s + (D.byId[id].population || 0), 0);
    const totalArea = ids.reduce((s, id) => s + (D.byId[id].area || 0), 0);
    const largest = ids.map(id => D.byId[id]).sort((a, b) => b.area - a.area)[0];

    async function draw() {
      const p = panel();
      const bar = `<div class="tour-progress" aria-label="Stop ${i} of ${ids.length}">${ids.map((_, k) => `<i class="${k < i ? 'on' : ''}"></i>`).join('')}</div>`;
      if (i === 0) {
        g.select(null, { fly: false });
        const lat = ids.reduce((s, id) => s + D.byId[id].latlng[0], 0) / ids.length;
        const lng = D.byId[ids[0]].latlng[1];
        g.view(lat, lng, Math.min(2.6, 0.9 + Math.sqrt(totalArea) / 3000));
        p.innerHTML = `<button class="linkish small" id="backCourse">Back to the course</button>
          <p class="kicker" style="margin-top:14px">Region tour, ${esc(sub.region)}</p>
          <h1 class="display">${esc(sub.name)}</h1>
          <dl class="facts"><dt>Countries</dt><dd>${ids.length}</dd><dt>People</dt><dd class="num">${GA.fmtBig(totalPop)}</dd><dt>Area</dt><dd class="num">${GA.fmtInt(totalArea)} km²</dd>
          <dt>Largest</dt><dd>${esc(largest.name)}</dd><dt>Most people</dt><dd>${esc(D.byId[ids[0]].name)}</dd></dl>
          <p class="prose" style="margin-top:18px">This tour visits each country from most to least populous. For each one, note the capital and find it on the globe before moving on.</p>
          <div class="chips" style="margin:14px 0 20px">${ids.map(id => `<span class="chip" style="cursor:default">${D.flagImg(id, 'flag flag-sm')}${esc(D.byId[id].name)}</span>`).join('')}</div>
          ${territories.length ? `<p class="small muted">Also in this region, not sovereign: ${esc(territories.map(t => t.name).join(', '))}.</p>` : ''}
          <div class="btn-row" style="margin-top:18px"><button class="btn btn-primary" id="tNext">Start the tour</button></div>`;
      } else if (i > ids.length) {
        store.tourDone(sub.name);
        g.select(null, { fly: false });
        p.innerHTML = `${bar}<p class="kicker" style="margin-top:18px">Tour complete</p><h1 class="display">${esc(sub.name)}</h1>
          <p class="prose" style="margin-top:14px">You visited ${ids.length} countries. The best way to make it stick is to test yourself now, while it is fresh.</p>
          <div class="btn-row"><button class="btn btn-primary" id="tPractise">Practise ${esc(sub.name)}</button><button class="btn" id="backCourse">Back to the course</button></div>`;
        GA.$('#tPractise').onclick = () => GA.app.go('practice', { scope: 'sub:' + sub.name, start: true });
      } else {
        const c = D.byId[ids[i - 1]];
        g.select(c.id);
        store.visit(c.id);
        p.innerHTML = `${bar}
          <div class="tour-step" style="margin-top:18px">
            <p class="kicker">${esc(sub.name)}, stop ${i} of ${ids.length}</p>
            ${D.flagImg(c.id, 'flag flag-lg')}
            <h1 class="display">${esc(c.name)}</h1>
            <div class="coords">${GA.dms(c.latlng[0], c.latlng[1])}</div>
            <dl class="facts" style="margin-top:6px"><dt>Capital</dt><dd>${esc(c.capital[0] || '—')}</dd><dt>Population</dt><dd class="num">${GA.fmtBig(c.population)}</dd>
              <dt>Area</dt><dd class="num">${GA.fmtInt(c.area)} km²</dd><dt>Languages</dt><dd>${esc(c.languages.slice(0, 4).join(', '))}</dd>
              ${c.borders.length ? `<dt>Neighbours</dt><dd>${esc(c.borders.map(b => D.byId[b]?.name).filter(Boolean).join(', '))}</dd>` : ''}</dl>
            <div class="prose" id="tourText"><p class="muted">Loading</p></div>
          </div>
          <div class="btn-row" style="margin-top:14px">
            <button class="btn" id="tPrev">Previous</button>
            <button class="btn btn-primary" id="tNext">${i === ids.length ? 'Finish the tour' : 'Next: ' + esc(D.byId[ids[i]].name)}</button>
            <button class="btn btn-quiet" id="tOpen">Open full profile</button>
          </div>`;
        GA.$('#tPrev').onclick = () => { i--; draw(); };
        GA.$('#tOpen').onclick = () => GA.app.openCountry(c.id);
        await D.lazy('texts');
        const t = D.texts[c.id]?.overview, box = GA.$('#tourText');
        if (box && D.byId[ids[i - 1]] === c) box.innerHTML = t ? t.text.slice(0, 2).map(x => `<p>${esc(x)}</p>`).join('') + `<p class="source">From Wikipedia, CC BY-SA 4.0.</p>` : '';
      }
      const nx = GA.$('#tNext'); if (nx) nx.onclick = () => { i++; draw(); };
      const bk = GA.$('#backCourse'); if (bk) bk.onclick = () => GA.app.go('course');
      p.scrollTop = 0;
      D.refreshFlags(p);
    }
    draw();
  }

  function glossary() {
    clearGlobe();
    const all = GA.lessons.flatMap(l => l.terms.map(t => ({ ...t, lesson: l }))).sort((a, b) => a.t.localeCompare(b.t));
    const p = panel();
    p.innerHTML = `<button class="linkish small" id="backCourse">Back to the course</button>
      <p class="kicker" style="margin-top:14px">Reference</p><h1 class="display">Glossary</h1>
      <p class="muted" style="margin:10px 0 20px">${all.length} terms from the lessons, A to Z.</p>
      <dl class="terms">${all.map(t => `<div><dt>${esc(t.t)}</dt><dd>${esc(t.d)} <button class="linkish small" data-lesson="${t.lesson.id}">${esc(t.lesson.title)}</button></dd></div>`).join('')}</dl>`;
    GA.$('#backCourse').onclick = () => GA.app.go('course');
    GA.$$('[data-lesson]', p).forEach(b => (b.onclick = () => GA.app.go('course', { lesson: b.dataset.lesson })));
    p.scrollTop = 0;
  }

  GA.course = { home, lesson, tour, glossary, leave: clearGlobe };
})(window.GA);
