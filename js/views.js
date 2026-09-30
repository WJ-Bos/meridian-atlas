// Full-screen sheets: the sortable country index and the progress report.
(function (GA) {
  const { data: D, store, esc } = GA;
  const idx = { q: '', region: '', sort: 'name', dir: 1, territories: false };
  const COLS = [
    ['name', 'Country', c => c.name, false],
    ['capital', 'Capital', c => c.capital[0] || '', false],
    ['subregion', 'Region', c => c.subregion || c.region, false],
    ['population', 'Population', c => c.population, true, v => GA.fmtShort(v)],
    ['area', 'Area km²', c => c.area, true, v => GA.fmtInt(v)],
    ['density', 'Per km²', c => c.density, true, v => GA.fmtInt(v)],
    ['gdpPc', 'Income per person', c => c.stats.gdpPc?.v, true, v => '$' + GA.fmtInt(v)],
    ['lifeExp', 'Life exp.', c => c.stats.lifeExp?.v, true, v => v.toFixed(1)],
    ['mastery', 'You', c => store.mastery(c.id), true],
  ];

  function index() {
    const s = GA.$('#sheetInner');
    s.innerHTML = `
      <div class="sheet-head">
        <div><p class="kicker">Index</p><h1 class="display">Every country, side by side</h1></div>
        <div class="toolbar">
          <input id="ixQ" type="search" placeholder="Filter by name or capital" value="${esc(idx.q)}" aria-label="Filter countries">
          <select id="ixR" aria-label="Region"><option value="">All regions</option>${D.regions.map(r => `<option ${idx.region === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
          <label class="check"><input type="checkbox" id="ixT" ${idx.territories ? 'checked' : ''}> Territories</label>
        </div>
      </div>
      <p class="muted small" id="ixCount"></p>
      <div class="table-wrap"><table class="atlas"><thead><tr>${COLS.map(([k, l, , r]) => `<th class="${r ? 'r' : ''}" data-k="${k}" ${idx.sort === k ? `aria-sort="${idx.dir > 0 ? 'ascending' : 'descending'}"` : ''} tabindex="0">${l}${idx.sort === k ? (idx.dir > 0 ? ' ↑' : ' ↓') : ''}</th>`).join('')}</tr></thead><tbody id="ixBody"></tbody></table></div>
      <p class="source">Population and indicators: World Bank, latest available year. Country facts: the world-countries dataset (mledoze/countries).</p>`;
    GA.$('#ixQ').oninput = e => { idx.q = e.target.value; rows(); };
    GA.$('#ixR').onchange = e => { idx.region = e.target.value; rows(); };
    GA.$('#ixT').onchange = e => { idx.territories = e.target.checked; rows(); };
    GA.$$('th', s).forEach(th => {
      const sort = () => { const k = th.dataset.k; idx.dir = idx.sort === k ? -idx.dir : (COLS.find(c => c[0] === k)[3] ? -1 : 1); idx.sort = k; index(); };
      th.onclick = sort; th.onkeydown = e => { if (e.key === 'Enter') sort(); };
    });
    rows();
    D.lazy('flags').then(() => D.refreshFlags(s));
  }
  function rows() {
    const q = GA.norm(idx.q);
    const col = COLS.find(c => c[0] === idx.sort);
    const list = D.countries.filter(c => (idx.territories || c.sovereign) && (!idx.region || c.region === idx.region) && (!q || c.searchKey.includes(q)))
      .sort((a, b) => {
        const va = col[2](a), vb = col[2](b);
        if (va == null) return 1; if (vb == null) return -1;
        return (typeof va === 'string' ? va.localeCompare(vb) : va - vb) * idx.dir;
      });
    GA.$('#ixCount').textContent = `${list.length} ${list.length === 1 ? 'country' : 'countries'}`;
    GA.$('#ixBody').innerHTML = list.map(c => `<tr data-id="${c.id}">
      <td><span class="cname">${D.flagImg(c.id, 'flag flag-sm')}${esc(c.name)}</span></td>
      <td>${esc(c.capital[0] || '—')}</td><td class="muted">${esc(c.subregion || c.region)}</td>
      ${COLS.slice(3, 8).map(([, , f, , fmt]) => { const v = f(c); return `<td class="r">${v == null ? '<span class="faint">—</span>' : fmt(v)}</td>`; }).join('')}
      <td class="r">${dots(store.mastery(c.id))}</td></tr>`).join('');
    GA.$$('#ixBody tr').forEach(tr => (tr.onclick = () => GA.app.openCountry(tr.dataset.id)));
  }
  function dots(m) { const n = Math.round(m * 5); return `<span class="mastery-dots" aria-label="${n} of 5">${[0, 1, 2, 3, 4].map(i => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`; }

  function progress() {
    const s = GA.$('#sheetInner'), st = store.state;
    const sovereign = D.countries.filter(c => c.sovereign);
    const visited = Object.keys(st.visited).length;
    const known = sovereign.filter(c => store.mastery(c.id) >= .6).length;
    const answers = Object.values(st.cards).reduce((a, c) => a + c.n, 0);
    const correct = Object.values(st.cards).reduce((a, c) => a + c.c, 0);
    const lessonsDone = Object.keys(st.lessons).length;
    const weakest = D.countries.filter(c => store.weak(c.id)).sort((a, b) => store.mastery(a.id) - store.mastery(b.id)).slice(0, 12);

    // last 20 weeks of activity, Monday-first columns
    const days = [], d = new Date(); d.setHours(12);
    const back = 7 * 19 + ((d.getDay() + 6) % 7);
    d.setDate(d.getDate() - back);
    for (let i = 0; i <= back; i++) {
      const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const n = st.days[k] || 0; days.push({ k, n, l: n === 0 ? 0 : n < 15 ? 1 : n < 40 ? 2 : 3 });
      d.setDate(d.getDate() + 1);
    }

    s.innerHTML = `
      <div class="sheet-head"><div><p class="kicker">Progress</p><h1 class="display">What you know so far</h1></div></div>
      <div class="stats-row">
        <div class="stat"><b>${known}</b><span>of ${sovereign.length} countries known well</span></div>
        <div class="stat"><b>${visited}</b><span>country profiles opened</span></div>
        <div class="stat"><b>${lessonsDone}/${GA.lessons.length}</b><span>lessons finished</span></div>
        <div class="stat"><b>${answers ? Math.round(correct / answers * 100) + '%' : '—'}</b><span>${GA.fmtInt(answers)} answers overall</span></div>
        <div class="stat"><b>${store.streak()}</b><span>day streak</span></div>
      </div>
      <div class="two-col">
        <section>
          <h2 class="h2">By continent</h2>
          <p class="muted small" style="margin:0 0 14px">Green is known well, amber is in progress, empty is not yet practised.</p>
          <div class="bars">${D.regions.map(r => {
            const list = sovereign.filter(c => c.region === r), n = list.length;
            const k = list.filter(c => store.mastery(c.id) >= .6).length, pr = list.filter(c => store.practised(c.id) && store.mastery(c.id) < .6).length;
            return `<div class="bar-row"><span>${r}</span><div class="bar-track" role="img" aria-label="${r}: ${k} known, ${pr} in progress, of ${n}"><i style="width:${k / n * 100}%;background:var(--good)"></i><i style="width:${pr / n * 100}%;background:var(--amber)"></i></div><span class="num">${k}/${n}</span></div>`;
          }).join('')}</div>
          <h2 class="h2" style="margin-top:32px">By skill</h2>
          <div class="bars">${[['locate', 'Finding on the globe'], ['name', 'Naming from the globe'], ['capital', 'Capitals'], ['flag', 'Flags']].map(([sk, label]) => {
            const k = sovereign.filter(c => (store.card(c.id, sk)?.b || 0) >= 3).length;
            return `<div class="bar-row"><span>${label}</span><div class="bar-track"><i style="width:${k / sovereign.length * 100}%;background:var(--good)"></i></div><span class="num">${k}/${sovereign.length}</span></div>`;
          }).join('')}</div>
          <h2 class="h2" style="margin-top:32px">Activity, last 20 weeks</h2>
          <div class="calendar" role="img" aria-label="Answers per day">${days.map(x => `<i data-l="${x.l}" title="${x.k}: ${x.n} answers"></i>`).join('')}</div>
        </section>
        <section>
          <h2 class="h2">Keep missing</h2>
          ${weakest.length ? `<ul class="miss-list">${weakest.map(c => `<li>${D.flagImg(c.id, 'flag flag-sm')}<button class="linkish" data-go="${c.id}">${esc(c.name)}</button><span class="muted">${dots(store.mastery(c.id))}</span></li>`).join('')}</ul>
            <div class="btn-row" style="margin-top:14px"><button class="btn btn-primary" id="pWeak">Practise these</button></div>`
            : `<p class="muted">Nothing yet. Countries you answer wrong will appear here so you can target them.</p>
               <div class="btn-row"><button class="btn btn-primary" id="pStart">Start practising</button></div>`}
          <h2 class="h2" style="margin-top:32px">Your home country</h2>
          <p class="muted small" style="margin:0 0 10px">Every country profile will compare its size and population with this one.</p>
          <div class="field" style="margin-top:0"><select id="homeSel" aria-label="Home country"><option value="">None</option>${D.countries.slice().sort((a, b) => a.name.localeCompare(b.name)).map(c => `<option value="${c.id}" ${st.home === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
          <h2 class="h2" style="margin-top:32px">Notes</h2>
          ${Object.keys(st.notes).length ? `<ul class="miss-list">${Object.entries(st.notes).map(([id, t]) => `<li><button class="linkish" data-go="${id}">${esc(D.byId[id]?.name || id)}</button><span class="muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60%">${esc(t.slice(0, 80))}</span></li>`).join('')}</ul>` : `<p class="muted">Notes you write on country profiles collect here.</p>`}
          <h2 class="h2" style="margin-top:32px">Start over</h2>
          <p class="muted small" style="margin:0 0 10px">Progress is saved in this browser only. Clearing it cannot be undone.</p>
          <div id="resetBox"><button class="btn" id="resetBtn">Clear all progress</button></div>
        </section>
      </div>`;
    GA.$$('[data-go]', s).forEach(b => (b.onclick = () => GA.app.openCountry(b.dataset.go)));
    const w = GA.$('#pWeak'); if (w) w.onclick = () => GA.app.go('practice', { scope: 'weak', start: true });
    const ps = GA.$('#pStart'); if (ps) ps.onclick = () => GA.app.go('practice');
    GA.$('#homeSel').onchange = e => { store.setHome(e.target.value); GA.toast(e.target.value ? `Home country set to ${D.byId[e.target.value].name}` : 'Home country cleared'); };
    GA.$('#resetBtn').onclick = () => {
      GA.$('#resetBox').innerHTML = `<p class="danger small" style="margin:0 0 8px">This deletes every answer, note and finished lesson.</p><div class="btn-row"><button class="btn" id="resetYes">Yes, clear everything</button><button class="btn btn-quiet" id="resetNo">Keep my progress</button></div>`;
      GA.$('#resetYes').onclick = () => { store.reset(); GA.toast('Progress cleared'); progress(); };
      GA.$('#resetNo').onclick = progress;
    };
    D.lazy('flags').then(() => D.refreshFlags(s));
  }

  GA.views = { index, progress };
})(window.GA);
