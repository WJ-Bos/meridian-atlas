// Your progress, kept in this browser. Every access is guarded: storage can be unavailable.
(function (GA) {
  const KEY = 'meridian-atlas-v1';
  const blank = () => ({
    visited: {},     // countryId -> first-visit timestamp
    notes: {},       // countryId -> text
    cards: {},       // "ID:skill" -> { b: box 0-5, due: ts, n: seen, c: correct, last: ts }
    lessons: {},     // lessonId -> { done: ts, score, of }
    tours: {},       // subregion -> ts completed
    sessions: [],    // { ts, mode, scope, n, correct }
    days: {},        // YYYY-MM-DD -> answers that day
    home: null,      // countryId used for size comparisons
  });
  let state = blank();
  try { const raw = localStorage.getItem(KEY); if (raw) state = Object.assign(blank(), JSON.parse(raw)); } catch { }

  let saveTimer;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { } }, 150);
  }

  // Leitner boxes: how long until a card is due again after a correct answer.
  const INTERVAL = [0, 10 * 60e3, 24 * 3600e3, 3 * 24 * 3600e3, 7 * 24 * 3600e3, 21 * 24 * 3600e3];
  const SKILLS = ['locate', 'capital', 'flag', 'name'];

  const store = {
    get state() { return state; },
    visit(id) { if (!state.visited[id]) { state.visited[id] = Date.now(); save(); } },
    note(id, text) { if (text.trim()) state.notes[id] = text; else delete state.notes[id]; save(); },
    card(id, skill) { return state.cards[id + ':' + skill]; },
    answer(id, skill, ok) {
      const k = id + ':' + skill, c = state.cards[k] || { b: 0, due: 0, n: 0, c: 0 };
      c.n++; if (ok) c.c++;
      c.b = ok ? Math.min(5, c.b + 1) : Math.max(0, c.b - 2);
      c.due = Date.now() + (ok ? INTERVAL[c.b] : 60e3);
      c.last = Date.now();
      state.cards[k] = c;
      const d = GA.today(); state.days[d] = (state.days[d] || 0) + 1;
      save();
    },
    // 0..1 for one country across the skills practised
    mastery(id) {
      let sum = 0;
      for (const s of SKILLS) { const c = state.cards[id + ':' + s]; if (c) sum += c.b / 5; }
      return sum / SKILLS.length;
    },
    practised(id) { return SKILLS.some(s => state.cards[id + ':' + s]); },
    weak(id) { return SKILLS.some(s => { const c = state.cards[id + ':' + s]; return c && c.n >= 1 && c.b <= 1 && c.c < c.n; }); },
    due(id, skill) { const c = state.cards[id + ':' + skill]; return !c || c.due <= Date.now(); },
    lessonDone(id, score, of) { state.lessons[id] = { done: Date.now(), score, of }; save(); },
    tourDone(key) { state.tours[key] = Date.now(); save(); },
    session(s) { state.sessions.push({ ts: Date.now(), ...s }); if (state.sessions.length > 300) state.sessions.shift(); save(); },
    setHome(id) { state.home = id || null; save(); },
    reset() { state = blank(); save(); },
    streak() {
      let n = 0; const d = new Date();
      const key = x => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
      if (!state.days[key(d)]) d.setDate(d.getDate() - 1);
      while (state.days[key(d)]) { n++; d.setDate(d.getDate() - 1); }
      return n;
    },
    SKILLS,
  };
  GA.store = store;
})(window.GA);
