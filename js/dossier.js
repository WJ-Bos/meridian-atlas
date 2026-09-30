// Country dossier: facts, indicators, Wikipedia-sourced overview/history/geography/politics/economy/people/culture, notes.
(function (GA) {
  const { data: D, store, esc } = GA;
  const TABS = [
    ['overview', 'Overview'], ['history', 'History'], ['geography', 'Geography'], ['politics', 'Politics'],
    ['economy', 'Economy'], ['demographics', 'People'], ['culture', 'Culture'], ['notes', 'Your notes'],
  ];
  const INDICATORS = [
    ['gdpPc', 'Income per person', v => '$' + GA.fmtInt(v), 'GDP per capita, current US$'],
    ['lifeExp', 'Life expectancy', v => v.toFixed(1) + ' years'],
    ['urban', 'Living in cities', v => v.toFixed(0) + '%'],
    ['fertility', 'Births per woman', v => v.toFixed(2), 'About 2.1 keeps a population stable without migration'],
    ['popGrowth', 'Population growth', v => (v > 0 ? '+' : '') + v.toFixed(2) + '% a year'],
    ['medianAgeProxy', 'Aged 65 and over', v => v.toFixed(1) + '% of people'],
    ['internet', 'Using the internet', v => v.toFixed(0) + '%'],
    ['forest', 'Forest cover', v => v.toFixed(0) + '% of land'],
    ['co2pc', 'CO₂ per person', v => v.toFixed(1) + ' t a year'],
  ];
  let current = null, tab = 'overview';

  function lookalike(c, key) {
    const v = c[key]; if (!v) return null;
    let best = null, bd = Infinity;
    for (const o of D.countries) {
      if (!o.sovereign || o.id === c.id || o.region === c.region || !o[key]) continue;
      const d = Math.abs(Math.log(o[key] / v)); if (d < bd) { bd = d; best = o; }
    }
    return best;
  }
  // "<b>2.3 times</b> the size of" / "<b>about a quarter</b> the size of"
  function versus(a, b, what) {
    const r = a / b;
    if (r > 0.9 && r < 1.1) return `<b>about</b> ${what}`;
    if (r >= 1.1) return `<b>${r >= 10 ? Math.round(r) : r.toFixed(1)} times</b> ${what}`;
    const pct = r * 100;
    return `<b>${pct >= 10 ? Math.round(pct) : pct.toFixed(1)}%</b> of ${what}`;
  }

  // countries with states/provinces get an extra tab named after them ("States", "Provinces", ...)
  function tabsFor(id) {
    const a = D.adminIndex && D.adminIndex[id];
    if (!a) return TABS;
    return [TABS[0], ['regions', D.plural(a.type)], ...TABS.slice(1)];
  }

  function render(id, startTab) {
    stopQuiz();
    const c = D.byId[id]; if (!c) return;
    current = id; tab = startTab || 'overview';
    store.visit(id);
    const p = GA.$('#panelInner');
    const rankTxt = (k, cnt) => c.ranks?.[k] ? `<span class="rank">${GA.ordinal(c.ranks[k])} of ${D['count_' + k]}</span>` : '';
    const home = store.state.home && store.state.home !== id ? D.byId[store.state.home] : null;
    const sizeTwin = lookalike(c, 'area'), popTwin = lookalike(c, 'population');
    const m = store.mastery(id);
    const statusTags = [
      c.sovereign ? 'Sovereign state' : 'Territory or dependency',
      c.un ? 'UN member' : null, c.landlocked ? 'Landlocked' : null,
      store.practised(id) ? `<span class="tag ${m >= .6 ? 'tag-known' : store.weak(id) ? 'tag-weak' : ''}">${m >= .6 ? 'You know this one' : store.weak(id) ? 'Needs review' : 'Learning'}</span>` : null,
    ].filter(Boolean).map(t => t.startsWith('<') ? t : `<span class="tag">${t}</span>`).join('');

    p.innerHTML = `
      <button class="panel-close" id="dossierClose" aria-label="Close country panel"><svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2 2 12" stroke="currentColor" stroke-width="1.6"/></svg></button>
      <header class="dossier-head">
        ${D.flagImg(id, 'flag flag-lg')}
        <div>
          <p class="kicker">${esc(c.subregion || c.region)}${c.subregion && c.region ? ', ' + esc(c.region) : ''}</p>
          <h1 class="display">${esc(c.name)}</h1>
        </div>
        ${c.official !== c.name ? `<p class="official">${esc(c.official)}</p>` : ''}
        <div class="coords">${c.latlng ? GA.dms(c.latlng[0], c.latlng[1]) : ''}</div>
        <div class="status-row">${statusTags}</div>
      </header>

      <dl class="facts">
        <dt>Capital</dt><dd>${esc(c.capital.join(', ') || 'None')}</dd>
        <dt>Population</dt><dd><span class="num">${GA.fmtBig(c.population)}</span> ${rankTxt('population')}${c.popYear ? ` <span class="rank">(${c.popYear})</span>` : ''}</dd>
        <dt>Area</dt><dd><span class="num">${GA.fmtInt(c.area)} km²</span> ${rankTxt('area')}</dd>
        <dt>Density</dt><dd><span class="num">${c.density ? GA.fmtInt(c.density) + ' people per km²' : '—'}</span></dd>
        <dt>Languages</dt><dd>${esc(c.languages.join(', ') || '—')}</dd>
        <dt>Currency</dt><dd>${c.currencies.map(x => `${esc(x.name)} <span class="faint">${esc(x.code)}${x.symbol ? ' ' + esc(x.symbol) : ''}</span>`).join(', ') || '—'}</dd>
        ${c.demonym ? `<dt>People are</dt><dd>${esc(c.demonym)}</dd>` : ''}
        ${c.stats.gdp ? `<dt>Economy</dt><dd><span class="num">${GA.fmtUsd(c.stats.gdp.v)}</span> GDP ${rankTxt('gdp')}</dd>` : ''}
        <dt>Borders</dt><dd>${c.borders.length ? `<div class="chips">${c.borders.map(b => D.byId[b] ? `<button class="chip" data-go="${b}">${D.flagImg(b, 'flag flag-sm')}${esc(D.byId[b].name)}</button>` : '').join('')}</div>` : (c.landlocked ? 'None' : 'No land borders')}</dd>
        <dt>Dialling code</dt><dd class="num">${esc(c.calling || '—')}</dd>
        <dt>Web domain</dt><dd>${esc(c.tld.join(', ') || '—')}</dd>
      </dl>

      ${(home || sizeTwin) ? `<div class="callout" style="margin-top:20px">
        ${home && c.area ? `${esc(c.name)} is ${versus(c.area, home.area, 'the size of')} ${esc(home.name)}${c.population && home.population ? `, and has ${versus(c.population, home.population, 'its population')}` : ''}.<br>` : ''}
        ${sizeTwin ? `Similar in area to <button class="linkish" data-go="${sizeTwin.id}">${esc(sizeTwin.name)}</button>` : ''}${popTwin ? `; similar in population to <button class="linkish" data-go="${popTwin.id}">${esc(popTwin.name)}</button>` : ''}.
      </div>` : ''}

      <div class="btn-row" style="margin-top:20px">
        <button class="btn btn-primary" id="dPractise">Practise ${esc(c.subregion || c.region)}</button>
        <button class="btn" id="dCompare">Compare</button>
        ${c.subregion ? `<button class="btn btn-quiet" id="dTour">Tour the region</button>` : ''}
      </div>

      <hr class="section-rule">
      <div class="tabs" role="tablist">${tabsFor(id).map(([k, l]) => `<button class="tab" role="tab" data-tab="${k}" aria-selected="${k === tab}">${l}</button>`).join('')}</div>
      <div id="tabBody"></div>
    `;
    GA.$('#dossierClose').onclick = () => GA.app.closeCountry();
    GA.$('#dPractise').onclick = () => GA.app.go('practice', { scope: c.subregion ? 'sub:' + c.subregion : 'reg:' + c.region, focus: id });
    GA.$('#dCompare').onclick = () => compare(id, null);
    const tourBtn = GA.$('#dTour'); if (tourBtn) tourBtn.onclick = () => GA.app.go('course', { tour: c.subregion, at: id });
    GA.$$('[data-go]', p).forEach(b => (b.onclick = () => GA.app.openCountry(b.dataset.go)));
    GA.$$('.tab', p).forEach(b => (b.onclick = () => { tab = b.dataset.tab; GA.$$('.tab', p).forEach(x => x.setAttribute('aria-selected', String(x === b))); renderTab(c); }));
    p.parentElement.scrollTop = 0; p.scrollTop = 0;
    renderTab(c);
  }

  function wikiLink(title) { return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`; }
  function source(title) { return `<p class="source">Text from the Wikipedia article <a href="${wikiLink(title)}" target="_blank" rel="noopener">${esc(title)}</a>, available under CC BY-SA 4.0. Read the full article for more.</p>`; }

  async function renderTab(c) {
    const body = GA.$('#tabBody'); if (!body) return;
    const id = c.id, which = tab;
    if (which === 'regions') return renderRegionsTab(c, body);
    if (which === 'notes') {
      body.innerHTML = `<div class="notes"><p class="muted small">Write what you want to remember about ${esc(c.name)}. Notes stay in this browser.</p>
        <textarea id="noteText" aria-label="Your notes on ${esc(c.name)}" placeholder="e.g. Capital ${esc(c.capital[0] || '')}; borders ${esc(c.borders.slice(0, 2).map(b => D.byId[b]?.name).filter(Boolean).join(' and ') || 'the sea')}">${esc(store.state.notes[id] || '')}</textarea></div>`;
      GA.$('#noteText').oninput = e => store.note(id, e.target.value);
      return;
    }
    if (which === 'history') {
      body.innerHTML = `<p class="muted">Loading history</p>`;
      await D.lazy('history');
      if (current !== id || tab !== which) return;
      const h = D.history[id];
      if (!h) { body.innerHTML = `<p class="muted">No history article is bundled for ${esc(c.name)}. Try the Overview tab.</p>`; return; }
      // Eras come from the article's top-level headings; if it has few, use the next level down.
      const BIB = /atlas|^histories of|bibliograph|^surveys|studies$|^reference works|^online|^journals/i;
      const secs = h.sections.filter(x => !BIB.test(x.h));
      const eraLevel = secs.filter(x => x.l === 2).length >= 3 ? 2 : 3;
      const eras = []; let era = null;
      for (const s of secs) {
        if (s.l === 1 || s.l <= eraLevel || !era) { era = { h: s.l === 1 ? 'Overview' : s.h, parts: [] }; eras.push(era); era.parts.push({ p: s.p }); continue; }
        era.parts.push({ h: s.h, p: s.p });
      }
      for (let k = eras.length - 1; k >= 0; k--) if (!eras[k].parts.some(x => x.p.length)) eras.splice(k, 1);
      body.innerHTML = `
        <div class="history-toc">${eras.map((e, i) => `<button class="chip" data-era="${i}">${esc(e.h)}</button>`).join('')}</div>
        ${eras.map((e, i) => `<section class="history-era" id="era-${i}"><h4>${esc(e.h)}</h4>
          <div class="prose">${e.parts.map(p => (p.h ? `<h5>${esc(p.h)}</h5>` : '') + p.p.map(x => `<p>${esc(x)}</p>`).join('')).join('')}</div></section>`).join('')}
        ${source(h.title)}`;
      GA.$$('[data-era]', body).forEach(b => (b.onclick = () => GA.$('#era-' + b.dataset.era).scrollIntoView({ behavior: GA.reducedMotion() ? 'auto' : 'smooth', block: 'start' })));
      return;
    }
    body.innerHTML = `<p class="muted">Loading text</p>`;
    await D.lazy('texts');
    if (current !== id || tab !== which) return;
    const t = D.texts[id]?.[which];
    let html = t ? `<div class="prose">${t.text.map(x => `<p>${esc(x)}</p>`).join('')}</div>${source(t.title)}`
      : `<p class="muted">There is no separate ${which} article for ${esc(c.name)}. The Overview tab covers it.</p>`;
    if (which === 'overview') html += indicators(c);
    body.innerHTML = html;
  }

  function indicators(c) {
    const rows = INDICATORS.filter(([k]) => c.stats[k]).map(([k, label, fmt, note]) => {
      const d = D.dist(k), v = c.stats[k].v;
      const pos = (x) => Math.max(0, Math.min(100, (x - d.min) / (d.max - d.min) * 100));
      return `<div><div class="meter-label"><span>${label}</span><b>${fmt(v)}</b></div>
        <div class="meter" role="img" aria-label="${label}: ${fmt(v)}; world median ${fmt(d.median)}"><div class="meter-fill" style="width:${pos(v)}%"></div><div class="meter-median" style="left:${pos(d.median)}%"></div></div>
        <div class="meter-note">${c.ranks?.[k] ? `${GA.ordinal(c.ranks[k])} highest of ${d.n}. ` : ''}World median ${fmt(d.median)} (tick).${note ? ' ' + note + '.' : ''} Data year ${c.stats[k].y}.</div></div>`;
    });
    if (!rows.length) return '';
    return `<hr class="section-rule"><h2 class="h2">How life compares</h2><p class="muted small" style="margin:0 0 14px">Bars run from the lowest to the highest country in the world. Source: World Bank.</p><div class="meters">${rows.join('')}</div>`;
  }

  // ----- compare two countries -----
  function compare(a, b) {
    const A = D.byId[a], B = b ? D.byId[b] : null;
    const p = GA.$('#panelInner');
    const rows = [
      ['Population', x => x.population, GA.fmtBig], ['Area (km²)', x => x.area, GA.fmtInt], ['People per km²', x => x.density, GA.fmtInt],
      ['GDP (US$)', x => x.stats.gdp?.v, GA.fmtBig], ['Income per person (US$)', x => x.stats.gdpPc?.v, GA.fmtInt],
      ['Life expectancy', x => x.stats.lifeExp?.v, v => v.toFixed(1)], ['Births per woman', x => x.stats.fertility?.v, v => v.toFixed(2)],
      ['Living in cities (%)', x => x.stats.urban?.v, v => v.toFixed(0)], ['Forest cover (%)', x => x.stats.forest?.v, v => v.toFixed(0)],
      ['CO₂ per person (t)', x => x.stats.co2pc?.v, v => v.toFixed(1)],
    ];
    p.innerHTML = `
      <button class="panel-close" id="cmpClose" aria-label="Back to ${esc(A.name)}"><svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2 2 12" stroke="currentColor" stroke-width="1.6"/></svg></button>
      <p class="kicker">Compare</p>
      <h1 class="display" style="font-size:34px">${esc(A.name)} and ${B ? esc(B.name) : '…'}</h1>
      <div class="field"><label for="cmpPick">Compare with</label>
        <input type="text" id="cmpPick" list="cmpList" placeholder="Type a country" value="${B ? esc(B.name) : ''}" autocomplete="off">
        <datalist id="cmpList">${D.countries.filter(x => x.id !== a).map(x => `<option value="${esc(x.name)}">`).join('')}</datalist></div>
      ${B ? `
      <div class="compare-grid" style="margin-top:20px">
        <div>${D.flagImg(A.id, 'flag flag-md')}<p class="small muted" style="margin:6px 0 0">Capital ${esc(A.capital[0] || '—')}</p></div>
        <div>${D.flagImg(B.id, 'flag flag-md')}<p class="small muted" style="margin:6px 0 0">Capital ${esc(B.capital[0] || '—')}</p></div>
      </div>
      <div style="margin-top:12px">${rows.map(([label, f, fmt]) => {
        const va = f(A), vb = f(B); if (va == null && vb == null) return '';
        const mx = Math.max(va || 0, vb || 0) || 1;
        return `<div class="cmp-row"><div class="cmp-label">${label}</div><div class="cmp-bars">
          <div><span>${va == null ? '—' : fmt(va)}</span><div class="cmp-bar"><i style="width:${(va || 0) / mx * 100}%"></i></div></div>
          <div><span>${vb == null ? '—' : fmt(vb)}</span><div class="cmp-bar b"><i style="width:${(vb || 0) / mx * 100}%"></i></div></div></div></div>`;
      }).join('')}</div>
      <div class="callout" style="margin-top:18px">${sharedFacts(A, B)}</div>
      <div class="btn-row" style="margin-top:14px"><button class="btn" data-go="${A.id}">Open ${esc(A.name)}</button><button class="btn" data-go="${B.id}">Open ${esc(B.name)}</button></div>`
      : `<p class="muted" style="margin-top:14px">Choose a second country to see them side by side.</p>`}`;
    GA.$('#cmpClose').onclick = () => render(a);
    const inp = GA.$('#cmpPick');
    inp.onchange = () => { const hit = D.countries.find(x => x.name.toLowerCase() === inp.value.trim().toLowerCase()) || D.search(inp.value)[0]; if (hit) compare(a, hit.id); };
    if (!B) inp.focus();
    GA.$$('[data-go]', p).forEach(bt => (bt.onclick = () => GA.app.openCountry(bt.dataset.go)));
    GA.globe.setHighlight(B ? [A.id, B.id] : [A.id]);
    if (B && A.latlng && B.latlng) {
      const km = Math.round(GA.haversine(A.latlng, B.latlng));
      GA.globe.view((A.latlng[0] + B.latlng[0]) / 2, midLng(A.latlng[1], B.latlng[1]), Math.min(3, 0.8 + km / 5000));
    }
  }
  function midLng(a, b) { let d = b - a; if (d > 180) d -= 360; if (d < -180) d += 360; return a + d / 2; }
  function sharedFacts(A, B) {
    const out = [];
    const km = A.latlng && B.latlng ? Math.round(GA.haversine(A.latlng, B.latlng)) : null;
    if (A.borders.includes(B.id)) out.push(`They share a border.`);
    else if (km) out.push(`Their centres are about <b>${GA.fmtInt(km)} km</b> apart.`);
    const langs = A.languages.filter(l => B.languages.includes(l));
    if (langs.length) out.push(`Both use ${esc(GA.listJoin(langs))}.`);
    const cur = A.currencies.filter(x => B.currencies.some(y => y.code === x.code));
    if (cur.length) out.push(`They share a currency: ${esc(cur[0].name)}.`);
    if (A.region === B.region) out.push(`Both are in ${esc(A.region)}.`);
    if (A.area && B.area) out.push(`${esc(A.area > B.area ? A.name : B.name)} is ${(Math.max(A.area, B.area) / Math.min(A.area, B.area)).toFixed(1)} times larger by area.`);
    return out.join(' ');
  }

  // ----- states and provinces -----
  async function renderRegionsTab(c, body) {
    body.innerHTML = `<p class="muted">Loading</p>`;
    const a = await D.admin(c.id).catch(() => null);
    if (current !== c.id || tab !== 'regions') return;
    if (!a) { body.innerHTML = `<p class="muted">The list of regions could not load. Check your connection and open the tab again.</p>`; return; }
    const type = D.adminIndex[c.id].type, plural = D.plural(type);
    const mixed = new Set(a.regions.map(r => r.type)).size > 1;
    const list = a.regions.filter(r => r.name !== 'Unnamed area').sort((x, y) => x.name.localeCompare(y.name));
    body.innerHTML = `
      <p class="muted" style="margin:0 0 12px">${esc(c.name)} is divided into <b>${list.length}</b> ${esc(plural.toLowerCase())}${mixed ? ' and similar units' : ''}. Zoom in on the globe to see them, or click one below.</p>
      <div class="btn-row" style="margin-bottom:14px"><button class="btn btn-primary" id="rQuiz">Find the ${esc(plural.toLowerCase())} on the globe</button></div>
      <input class="region-filter" id="rFilter" type="search" placeholder="Filter ${esc(plural.toLowerCase())}" aria-label="Filter ${esc(plural.toLowerCase())}">
      <table class="region-table"><thead><tr><th>Name</th>${mixed ? '<th>Type</th>' : ''}<th>Capital</th><th class="r">People</th></tr></thead>
      <tbody>${list.map(r => `<tr data-k="${r.k}" data-n="${esc(GA.norm(r.name + ' ' + (r.cap || '')))}"><td><b style="font-weight:600">${esc(r.name)}</b></td>${mixed ? `<td class="muted">${esc(r.type)}</td>` : ''}<td class="muted">${esc(r.cap || '—')}</td><td class="r">${r.pop ? GA.fmtShort(r.pop) : '—'}</td></tr>`).join('')}</tbody></table>
      <p class="source">Boundaries: Natural Earth. Some recent reforms, such as Vietnam's 2025 province mergers, are not reflected. Capitals and populations: Wikidata.</p>`;
    GA.$$('tbody tr', body).forEach(tr => (tr.onclick = () => GA.app.openRegion(c.id, +tr.dataset.k)));
    GA.$('#rFilter').oninput = e => { const q = GA.norm(e.target.value); GA.$$('tbody tr', body).forEach(tr => (tr.hidden = !!q && !tr.dataset.n.includes(q))); };
    GA.$('#rQuiz').onclick = () => regionQuiz(c.id);
  }

  async function renderRegion(id, k) {
    stopQuiz();
    const c = D.byId[id]; if (!c) return;
    current = id; tab = 'regions';
    const p = GA.$('#panelInner'), cn = esc(GA.theName(c.name));
    p.innerHTML = `<p class="muted">Loading</p>`;
    const a = await D.admin(id).catch(() => null);
    const r = a?.byK[k];
    if (!r) { p.innerHTML = `<p class="muted">This region could not load.</p><button class="btn" id="rBack">Back to ${esc(c.name)}</button>`; GA.$('#rBack').onclick = () => GA.app.openCountry(id); return; }
    const sorted = a.regions.filter(x => x.name !== 'Unnamed area').sort((x, y) => x.name.localeCompare(y.name));
    const i = sorted.indexOf(r), prev = sorted[i - 1], next = sorted[i + 1];
    const rank = key => { const l = a.regions.filter(x => x[key]).sort((x, y) => y[key] - x[key]); const n = l.indexOf(r); return n >= 0 ? `<span class="rank">${GA.ordinal(n + 1)} of ${l.length} in ${cn}</span>` : ''; };
    const areaShare = c.area ? r.area / c.area * 100 : null, popShare = c.population && r.pop ? r.pop / c.population * 100 : null;
    const pct = v => (v >= 10 ? Math.round(v) : v >= 1 ? v.toFixed(1) : v.toFixed(2)) + '%';
    p.innerHTML = `
      <button class="panel-close" id="rClose" aria-label="Back to ${esc(c.name)}"><svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2 2 12" stroke="currentColor" stroke-width="1.6"/></svg></button>
      <button class="linkish small" id="rUp">${D.flagImg(id, 'flag flag-sm').replace('class="flag flag-sm"', 'class="flag flag-sm" style="display:inline-block;vertical-align:-3px;margin-right:6px"')}${esc(c.name)}</button>
      <header class="dossier-head" style="margin-top:14px">
        <p class="kicker">${esc(r.type)} of ${cn}</p>
        <h1 class="display">${esc(r.name)}</h1>
        <div class="coords">${GA.dms(r.lab[0], r.lab[1])}</div>
      </header>
      <dl class="facts">
        ${r.cap ? `<dt>Capital</dt><dd>${esc(r.cap)}</dd>` : ''}
        <dt>Population</dt><dd><span class="num">${r.pop ? GA.fmtBig(r.pop) : '—'}</span> ${r.pop ? rank('pop') : ''}</dd>
        <dt>Area</dt><dd><span class="num">about ${GA.fmtInt(Math.round(r.area / 10) * 10)} km²</span> ${rank('area')}</dd>
        ${r.pop && r.area ? `<dt>Density</dt><dd class="num">${GA.fmtInt(r.pop / r.area)} people per km²</dd>` : ''}
        ${areaShare ? `<dt>Share of ${cn}</dt><dd class="num">${pct(areaShare)} of the land${popShare && popShare <= 100 ? `, ${pct(popShare)} of the people` : ''}</dd>` : ''}
      </dl>
      ${r.text ? `<hr class="section-rule"><div class="prose">${r.text.map(x => `<p>${esc(x)}</p>`).join('')}</div>${source(r.title)}` : `<hr class="section-rule"><p class="muted">No summary is bundled for ${esc(r.name)}. <a href="https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(r.name + ' ' + c.name)}" target="_blank" rel="noopener">Search Wikipedia</a>.</p>`}
      <div class="btn-row" style="margin-top:20px">
        ${prev ? `<button class="btn" data-k="${prev.k}">Previous: ${esc(prev.name)}</button>` : ''}
        ${next ? `<button class="btn" data-k="${next.k}">Next: ${esc(next.name)}</button>` : ''}
      </div>
      <div class="btn-row" style="margin-top:8px"><button class="btn btn-quiet" id="rAll">All ${esc(D.plural(D.adminIndex[id].type).toLowerCase())} of ${cn}</button></div>
      <p class="source">Population and capital: Wikidata, most recent figure recorded. Area measured from the map boundary.</p>`;
    GA.$('#rClose').onclick = GA.$('#rUp').onclick = () => GA.app.openCountry(id);
    GA.$('#rAll').onclick = () => GA.app.go('explore', { country: id, tab: 'regions' });
    GA.$$('[data-k]', p).forEach(b => (b.onclick = () => GA.app.openRegion(id, +b.dataset.k)));
    p.scrollTop = 0;
  }

  // "Find the states" quiz: click each named state/province on the globe.
  let quiz = null;
  async function regionQuiz(id) {
    const c = D.byId[id], a = await D.admin(id);
    const pool = a.regions.filter(r => r.name !== 'Unnamed area');
    const plural = D.plural(D.adminIndex[id].type).toLowerCase();
    stopQuiz();
    quiz = { id, qs: GA.shuffle(pool).slice(0, Math.min(10, pool.length)), i: 0, right: 0, misses: [], done: false };
    const g = GA.globe;
    await g.setForceSplit(id);
    g.select(id, { fly: false }); g.flyTo(id);
    g.setInteraction({ tooltips: false, onClick: (cid, coords, props) => answer(cid, coords, props) });
    const p = GA.$('#panelInner');
    function ask() {
      g.clearFlashes();
      if (quiz.i >= quiz.qs.length) return finish();
      const r = quiz.qs[quiz.i]; quiz.done = false;
      p.innerHTML = `
        <div class="q-meta"><span>${esc(c.name)}: ${quiz.i + 1} of ${quiz.qs.length}</span><span>${quiz.right} right</span><button class="linkish small" id="qStop">End quiz</button></div>
        <div class="q-track"><i style="width:${quiz.i / quiz.qs.length * 100}%"></i></div>
        <h1 class="q-prompt">Find ${esc(r.name)}</h1>
        <p class="q-hint">Click it on the globe. Names are hidden until you answer.</p>
        <div class="btn-row"><button class="btn btn-quiet" id="qShow">Show me</button></div>
        <div id="qFeedback"></div>`;
      GA.$('#qStop').onclick = () => { stopQuiz(); GA.app.go('explore', { country: id, tab: 'regions' }); };
      GA.$('#qShow').onclick = () => answer(null, null, null, true);
    }
    function answer(cid, coords, props, gaveUp) {
      if (!quiz || quiz.done) return;
      const r = quiz.qs[quiz.i], ok = !!props?.admin && props.id === id && props.k === r.k;
      quiz.done = true;
      let extra = '';
      if (!ok && props?.admin && props.id === id) {
        const w = a.byK[props.k]; g.flash(id + ':' + props.k, 'signal');
        extra = `You clicked ${w.name}, about ${GA.fmtInt(Math.round(GA.haversine(w.lab, r.lab) / 10) * 10)} km away.`;
      } else if (!ok && !gaveUp && (cid || coords)) extra = `That is outside ${c.name}.`;
      g.flash(id + ':' + r.k, 'verdigris');
      if (ok) quiz.right++; else quiz.misses.push(r);
      GA.$('#qFeedback').innerHTML = `<div class="feedback ${ok ? 'good' : 'bad'}"><p class="feedback-title">${ok ? 'Correct' : `${esc(r.name)} is shown in green`}</p>
        <p>${esc(extra)} ${r.cap ? `Capital: ${esc(r.cap)}.` : ''}${r.pop ? ` About ${GA.fmtBig(r.pop)} people.` : ''}</p>
        <div class="btn-row"><button class="btn btn-primary" id="qNext">${quiz.i + 1 >= quiz.qs.length ? 'See results' : 'Next'}</button></div></div>`;
      GA.$('#qNext').onclick = () => { quiz.i++; ask(); };
      GA.$('#qNext').focus({ preventScroll: true });
    }
    function finish() {
      const q = quiz;
      store.session({ mode: `Find the ${plural}`, scope: 'sub:' + c.name, n: q.qs.length, correct: q.right });
      stopQuiz();
      p.innerHTML = `<p class="kicker">Finished: ${esc(plural)} of ${esc(GA.theName(c.name))}</p>
        <div class="result-score">${q.right}<span class="faint" style="font-size:40px"> / ${q.qs.length}</span></div>
        ${q.misses.length ? `<hr class="section-rule"><h2 class="h3">To review</h2><ul class="miss-list">${q.misses.map(r => `<li><button class="linkish" data-k="${r.k}">${esc(r.name)}</button><span class="muted">${esc(r.cap || '')}</span></li>`).join('')}</ul>` : '<p class="muted">A perfect round.</p>'}
        <div class="btn-row" style="margin-top:20px"><button class="btn btn-primary" id="qAgain">Go again</button><button class="btn" id="qBack">Back to ${esc(c.name)}</button></div>`;
      GA.$$('[data-k]', p).forEach(b => (b.onclick = () => GA.app.openRegion(id, +b.dataset.k)));
      GA.$('#qAgain').onclick = () => regionQuiz(id);
      GA.$('#qBack').onclick = () => GA.app.go('explore', { country: id, tab: 'regions' });
    }
    ask();
  }
  function stopQuiz() {
    if (!quiz) return;
    quiz = null;
    GA.globe.setInteraction(); GA.globe.clearFlashes(); GA.globe.setForceSplit(null);
  }

  GA.dossier = { render, renderRegion, compare, stopQuiz, get current() { return current; } };

})(window.GA);
