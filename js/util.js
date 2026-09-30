// Small shared helpers. Everything hangs off window.GA (Geo Atlas).
window.GA = window.GA || {};
(function (GA) {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }

  const nf = new Intl.NumberFormat('en-US');
  function fmtInt(n) { return n == null ? '—' : nf.format(Math.round(n)); }
  function fmtBig(n) {
    if (n == null) return '—';
    const a = Math.abs(n);
    if (a >= 1e12) return (n / 1e12).toFixed(a >= 1e13 ? 1 : 2).replace(/\.0+$/, '') + ' trillion';
    if (a >= 1e9) return (n / 1e9).toFixed(a >= 1e10 ? 1 : 2).replace(/\.0+$/, '') + ' billion';
    if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 1 : 2).replace(/\.0+$/, '') + ' million';
    return fmtInt(n);
  }
  function fmtShort(n) {
    if (n == null) return '—';
    const a = Math.abs(n);
    if (a >= 1e12) return (n / 1e12).toFixed(1).replace(/\.0$/, '') + 'T';
    if (a >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    if (a >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (a >= 1e4) return Math.round(n / 1e3) + 'k';
    return fmtInt(n);
  }
  function fmtUsd(n) { return n == null ? '—' : '$' + fmtBig(n); }
  function dms(lat, lng) {
    const f = (v, pos, neg) => {
      const a = Math.abs(v), d = Math.floor(a), m = Math.round((a - d) * 60);
      return `${d}°${String(m).padStart(2, '0')}′${v >= 0 ? pos : neg}`;
    };
    return `${f(lat, 'N', 'S')}  ${f(lng, 'E', 'W')}`;
  }
  function ordinal(n) { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  function haversine(a, b) {
    const R = 6371, toR = x => x * Math.PI / 180;
    const dLat = toR(b[0] - a[0]), dLng = toR(b[1] - a[1]);
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function sample(a, n) { return shuffle(a).slice(0, n); }
  function pick(a) { return a[Math.random() * a.length | 0]; }
  function listJoin(a) { return a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 2600);
  }

  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isNarrow = () => matchMedia('(max-width: 820px)').matches;
  const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  // "the United States", "the Netherlands"; plain "France"
  const THE = /^(United |Netherlands|Philippines|Bahamas|Gambia|Central African|Dominican Republic|Democratic Republic|Republic of|Maldives|Marshall Islands|Solomon Islands|Comoros|Seychelles|Czech Republic|Cayman|Falkland|Faroe|British|Cook Islands|Turks|Virgin)/;
  const theName = n => (THE.test(n) ? 'the ' + n : n);

  Object.assign(GA, { $, $$, esc, theName, h, fmtInt, fmtBig, fmtShort, fmtUsd, dms, ordinal, haversine, shuffle, sample, pick, listJoin, today, norm, toast, reducedMotion, isNarrow, cssVar });
})(window.GA);
