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
    .panel{background:var(--card);padding:10px;border-radius:10px;box-shadow:0 6px 18px rgba(2,6,23,0.6)}
    .board-wrap{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start}
    .board{display:grid;grid-template-columns:repeat(${COLS},1fr);gap:6px;min-width:0}
    .cell{aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.05));border-radius:8px;font-weight:700;font-size:18px;user-select:none;cursor:pointer}
      .cell.empty{background:transparent;cursor:default;opacity:0.25}
      .cell.selected{outline:3px solid var(--accent)}
      .controls{display:flex;flex-direction:column;gap:8px;min-width:240px}
      .row{display:flex;gap:8px}
      button{background:var(--accent);color:#04202a;border:none;padding:8px 10px;border-radius:8px;font-weight:600;cursor:pointer}
      button.ghost{background:transparent;border:1px solid rgba(255,255,255,0.06);color:var(--text)}
      .small{padding:6px 8px;font-size:14px}
      .score{font-size:20px;font-weight:800}
      @media (max-width:720px){
        .controls{min-width:unset;width:100%}
        .board{order:2;width:100%}
        .board-wrap{flex-direction:column}
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

    // main content
    const wrap = document.createElement('div');
    wrap.className = 'board-wrap';

    const boardPanel = document.createElement('div');
    boardPanel.className = 'panel';
    boardPanel.style.flex = '1';
    boardPanel.style.minHeight = '200px';

    wrap.appendChild(boardPanel);
    app.appendChild(wrap);

    const infoRow = document.createElement('div');
    infoRow.style.display = 'flex';
    infoRow.style.justifyContent = 'space-between';
    infoRow.style.alignItems = 'center';
    infoRow.style.marginBottom = '8px';

    const modeInfo = document.createElement('div');
    modeInfo.id = 'mode-info';
    modeInfo.textContent = 'mode: -';

    const scoreBox = document.createElement('div');
    scoreBox.innerHTML = `<div class="score" id="score">Score: 0</div><div id="timer">00:00</div>`;
    infoRow.appendChild(modeInfo);
    infoRow.appendChild(scoreBox);
    boardPanel.appendChild(infoRow);

    const board = document.createElement('div');
    board.className = 'board';
    board.id = 'board';
    boardPanel.appendChild(board);

    //controls
    const controls = document.createElement('div');
    controls.className = 'controls panel';
    controls.innerHTML = `
     <div style="display:flex;justify-content:space-between;align-items:center">
        <div><strong>Tools</strong></div>
        <div><button id="resetBtn" class="small ghost">Reset</button></div>
      </div>
      <div class="row" style="flex-direction:column;gap:6px">
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button id="btnClassic" class="small ghost">Classic</button>
          <button id="btnRandom" class="small ghost">Random</button>
          <button id="btnChaotic" class="small ghost">Chaotic</button>
        </div>
        <div style="display:flex;gap:6px">
          <button id="continueBtn" class="small ghost">Continue</button>
          <button id="saveBtn" class="small ghost">Save</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
        <div>Available moves: <span id="availableMoves">0</span></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button id="hintBtn" class="small">Hint</button>
          <button id="undoBtn" class="small">Undo</button>
          <button id="addBtn" class="small">Add numbers</button>
          <button id="shuffleBtn" class="small">Shuffle</button>
          <button id="eraserBtn" class="small">Eraser</button>
        </div>
      </div>
      <div style="margin-top:8px"><strong>History (last 5):</strong><div id="historyList" style="margin-top:6px"></div></div>
     `;
    wrap.appendChild(controls);
  }
  createUI();
})()