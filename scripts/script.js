(() => {
  const COLS = 9;
  const START_COUNT = 27;
  const TARGET_SCORE = 100;
  const MAX_LINES = 50;
  const MAX_ADD_NUMBERS = 10;
  const MAX_SHUFFLES = 5;
  const MAX_ERASER = 5;
  const STORAGE_KEY = 'pair_em_up_save_v1';

  let state = {
    mode: 'classic',
    grid: [],
    score: 0,
    startTime: null,
    elapsedSeconds: 0,
    timerInterval: null,
    tools: {
      addUsed: 0,
      shaffleUsed: 0,
      eraserUsed: 0,
    },
    history: [],
    movesCount: 0,
    savedAt: null,
  };
  const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const usid = (() => { let i = 0; return () => ++i })();
  /* ------Dom----------*/
  let els = {};
  function createUI() {
    document.body.style.margin = '0';
    document.body.style.fontFamily = 'Inter, system-ui, sans-serif';
    const style = document.createElement('style');
    style.textContent = `
    :root{--bg:#0f172a;--card:#0b1220;--accent:#06b6d4;--text:#e6eef8}
    body.light{--bg:#f3f7fb;--card:#ffffff;--accent:#0b78a6;--text:#071129}
    body{background:var(--bg);color:var(--text);min-height:100vh;display:flex;flex-direction:column;align-items:center}
    .app{width:100%;max-width:1200px;padding:16px;box-sizing:border-box}
    header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
    .title{font-size:24px;font-weight:700}
     .meta{display:flex;gap:8px;align-items:center}
    `
    document.head.appendChild(style);
    const app = document.createElement('div');
    document.body.appendChild(app);
    app.className = 'app';

    //header
    const header = document.createElement('header');
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = "Pair'em Up - Собери их по парам";
    header.appendChild(title);
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `<div class = "panel small">Author:
    <a id="gh-link" href="#" target="_blank" style="color: var(--text);
    text-decoration:underline">SiarheiKazakevich</a></div>`;

    header.appendChild(meta);
    app.appendChild(header);


  }
  createUI();
})()