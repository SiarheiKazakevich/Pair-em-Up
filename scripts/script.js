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
      shuffleUsed: 0,
      eraserUsed: 0,
    },
    history: [],
    movesCount: 0,
    savedAt: null,
  };
  const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const uid = (() => { let i = 0; return () => ++i })();
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
  }
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

    const modal = document.createElement('div');
    modal.id = 'resultModal';
    Object.assign(modal.style, {
      position: 'fixed', left: 0, top: 0, right: 0,
      bottom: 0, display: 'none', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)'
    });
    modal.innerHTML = `<div class="panel" style="min-width:280px;text-align:center">
    <h3 id="resultTitle">Game over</h3>
    <div id="resultText"></div>
    <div style="margin-top:10px">
    <button id="playAgainBtn">Play again</button>
     <button id="toMenuBtn" class="ghost">Menu</button>
     </div>
     </div>`;
    document.body.appendChild(modal);

    //доб. элем.
    els = {
      board, modeInfo: document.getElementById('mode-info'),
      score: document.getElementById('score'),
      timer: document.getElementById('timer'),
      btnClassic: document.getElementById('btnClassic'),
      btnRandom: document.getElementById('btnRandom'),
      btnChaotic: document.getElementById('btnChaotic'),
      resetBtn: document.getElementById('resetBtn'),
      continueBtn: document.getElementById('continueBtn'),
      saveBtn: document.getElementById('saveBtn'),
      hintBtn: document.getElementById('hintBtn'),
      undoBtn: document.getElementById('undoBtn'),
      addBtn: document.getElementById('addBtn'),
      shuffleBtn: document.getElementById('shuffleBtn'),
      eraserBtn: document.getElementById('eraserBtn'),
      availableMoves: document.getElementById('availableMoves'),
      historyList: document.getElementById('historyList'),
      resultModal: modal,
      resultTitle: modal.querySelector('#resultTitle'),
      resultText: modal.querySelector('#resultText'),
      playAgainBtn: modal.querySelector('#playAgainBtn'),
      toMenuBtn: modal.querySelector('#toMenuBtn'),
      ghLink: document.getElementById('gh-link'),

    };
    els.ghLink.href = 'https://github.com/SiarheiKazakevich';
    els.ghLink.textContent = 'SiarheiKazakevich';

    els.btnClassic.addEventListener('click', () => startNew('classic'));
    els.btnRandom.addEventListener('click', () => startNew('random'));
    els.btnChaotic.addEventListener('click', () => startNew('chaotic'));
    els.resetBtn.addEventListener('click', () => startNew(state.mode));
    els.saveBtn.addEventListener('click', saveToStorage);
    els.hintBtn.addEventListener('click', showHint);
    els.undoBtn.addEventListener('click', undoMove);
    els.addBtn.addEventListener('click', addNumbersTool);
    els.shuffleBtn.addEventListener('click', shuffleTool);
    els.eraserBtn.addEventListener('click', eraserTool);
    els.playAgainBtn.addEventListener('click', () => { closeResult(); startNew(state.mode) });
    els.toMenuBtn.addEventListener('click', closeResult);

    window.addEventListener('resize', renderGrid);
  }


  function generateInitialArray(mode) {
    const arr = [];
    if (mode === 'classic') {
      const seq = [];
      for (let i = 1; i <= 9; i++) if (i !== 0) seq.push(i);
      let base = [];
      for (let i = 1; i <= 9; i++) base.push(i);
      while (base.length < START_COUNT) {
        for (let i = 1; i <= 9 && base.length < START_COUNT; i++) base.push(i);
      }
      for (const v of base.slice(0, START_COUNT)) arr.push(v)
    } else if (mode === 'random') {
      let base = [];
      for (let i = 1; i <= 9; i++) base.push(i);
      while (base.length < START_COUNT) {
        for (let i = 1; i <= 9 && base.length < START_COUNT; i++) base.push(i);
      }
      //shuffle
      for (let i = base.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [base[i], base[j]] = [base[j], base[i]];
      }
      arr.push(...base.slice(0, START_COUNT));
    } else if (mode === 'chaotic') {
      for (let i = 0; i < START_COUNT; i++) arr.push(randInt(1, 9));
    }
    return arr;
  }

  function initGridFromArray(arr) {
    state.grid = arr.map(v => ({ value: v, id: uid() }));
  }

  /*------рендеринг--------*/
  let selected = [];
  function renderGrid() {
    const board = els.board;
    board.innerHTML = '';
    for (let i = 0; i < state.grid.length; i++) {
      const cell = state.grid[i];
      const el = document.createElement('div');
      el.className = 'cell' + (cell.value === null ? ' empty' : '');
      el.dataset.idx = i;
      if (cell.value !== null) el.textContent = String(cell.value);
      if (selected.includes(i)) el.classList.add('selected');
      el.addEventListener('click', () => onCellClick(i));
      board.appendChild(el);
    }
    const moves = countAvailableMoves(6);
    els.availableMoves.textContent = moves >= 6 ? '5+' : String(moves);
    els.modeInfo.textContent = `Mode: ${state.mode}`;
    els.score.textContent = `Score: ${state.score} / ${TARGET_SCORE}`;

    const hist = state.history.slice(-5).reverse();
    els.historyList.innerHTML = hist.map((h, idx) => `<div style="font-size:12px">#${hist.length - idx}: ${h.summary || 'move'}</div>`).join('');
  }

  /*--------выбор пар---------------- */
  function onCellClick(idx) {
    const cell = state.grid[idx];
    if (!cell || cell.value === null) return;
    if (selected.includes(idx)) {
      selected = selected.filter(x => x !== idx);
      renderGrid();
      return;
    }
    if (selected.length === 0) {
      selected.push(idx);
      renderGrid();
      return;
    }
    if (selected.length === 1) {
      selected.push(idx);
      const [a, b] = selected;
      const valid = isPairValid(a, b);
      if (valid) {
        pushHistory(`remove ${state.grid[a].value} & ${state.grid[b].value}`);
        applyPairRemoval(a, b, valid.points);
        state.movesCount += 1;
        saveToStorageAuto();
        selected = [];
        renderGrid();

      } else {
        flashInvalid(a, b);
        selected = [];
        renderGrid();
      }
      return;
    }
  }
  function flashInvalid(a, b) {
    const nodes = Array.from(els.board.children);
    const nodeA = nodes[a], nodeB = nodes[b];
    if (nodeA) nodeA.style.transform = 'scale(0.98)';
    if (nodeB) nodeB.style.transform = 'scale(0.98)';
    setTimeout(() => { if (nodeA) nodeA.style.transform = ''; if (nodeB) nodeB.style.transform = ''; }, 150);
  }
  function isPairValid(idxA, idxB) {
    if (idxA === idxB) return false;
    const a = state.grid[idxA], b = state.grid[idxB];
    if (!a || !b || a.value === null || b.value === null) return false;
    const vA = a.value, vB = b.value;

    let points = 0;
    if (vA === vB) {
      points = (vA === 5 ? 3 : 1);
    } else if (vA + vB === 10) {
      points = 2;
    } else return false;
    if (areNeighbors(idxA, idxB)) return { valid: true, points };

    const posA = indexToRC(idxA), posB = indexToRC(idxB);
    if (posA.row === posB.row) {

      const c1 = Math.min(posA.col, posB.col), c2 = Math.max(posA.col, posB.col);
      let clear = true;
      for (let c = c1 + 1; c < c2; c++) {
        const idx = rcToIndex(posA.row, c);
        if (idx < state.grid.length && state.grid[idx] && state.grid[idx].value !== null) { clear = false; break; }
      }
      if (clear) return { valid: true, points };
    }

    if (posA.col === posB.col) {
      const r1 = Math.min(posA.row, posB.row), r2 = Math.max(posA.row, posB.row);
      let clear = true;
      for (let r = r1 + 1; r < r2; r++) {
        const idx = rcToIndex(r, posA.col);
        if (idx < state.grid.length && state.grid[idx] && state.grid[idx].value !== null) { clear = false; break; }
      }
      if (clear) return { valid: true, points };
    }
    return false;
  }
  function areNeighbors(i, j) {
    const a = indexToRC(i), b = indexToRC(j);

    if (a.row === b.row && Math.abs(a.col - b.col) === 1) return true;
    if (a.col === b.col && Math.abs(a.row - b.row) === 1) return true;

    if (a.col === COLS - 1 && b.col === 0 && b.row === a.row + 1) return true;
    if (b.col === COLS - 1 && a.col === 0 && a.row === b.row + 1) return true;
    return false;
  }

  function indexToRC(idx) {
    return { row: Math.floor(idx / COLS), col: idx % COLS };
  }
  function rcToIndex(row, col) {
    return row * COLS + col;
  }

  function applyPairRemoval(i, j, points) {
    pushHistory();
    state.grid[i].value = null;
    state.grid[j].value = null;
    state.score += points;

  }
  function countAvailableMoves(cap = Infinity) {
    let count = 0;
    const n = state.grid.length;
    for (let i = 0; i < n; i++) {
      if (state.grid[i].value === null) continue;
      for (let j = i + 1; j < n; j++) {
        if (state.grid[j].value === null) continue;
        const valCheck = (() => {
          const va = state.grid[i].value, vb = state.grid[j].value;
          if (va === vb) return true;
          if (va + vb === 10) return true;
          return false;
        })();
        if (!valCheck) continue;
        const path = isPairValid(i, j);
        if (path) {
          count++;
          if (count >= cap) return count;
        }
      }
    }
    return count;
  }

  function showHint() {
    const n = state.grid.length;
    for (let i = 0; i < n; i++) {
      if (state.grid[i].value === null) continue;
      for (let j = i + 1; j < n; j++) {
        if (state.grid[j].value === null) continue;
        const valCheck = (() => {
          const va = state.grid[i].value, vb = state.grid[j].value;
          if (va === vb) return true;
          if (va + vb === 10) return true;
          return false;
        })();
        if (!valCheck) continue;
        const path = isPairValid(i, j);
        if (path) {
          selected = [i, j];
          renderGrid();
          setTimeout(() => { selected = []; renderGrid(); }, 900);
          return;
        }
      }
    }

    function showToast(msg) {
      const div = document.createElement('div');
      div.textContent = msg;
      div.style.position = 'fixed';
      div.style.bottom = '20px';
      div.style.left = '50%';
      div.style.transform = 'translateX(-50%)';
      div.style.background = 'var(--accent)';
      div.style.color = '#000';
      div.style.padding = '8px 14px';
      div.style.borderRadius = '8px';
      div.style.fontWeight = '600';
      div.style.zIndex = '9999';
      div.style.opacity = '0';
      div.style.transition = 'opacity .3s';

      document.body.appendChild(div);
      requestAnimationFrame(() => (div.style.opacity = '1'));

      setTimeout(() => {
        div.style.opacity = '0';
        setTimeout(() => div.remove(), 300);
      }, 1500);

    }
    showToast('No available moves found.');
  }
  function snapshotState(summary) {
    const snap = {
      grid: state.grid.map(c => ({ value: c.value, id: c.id })),
      score: state.score,
      movesCount: state.movesCount,
      tools: JSON.parse(JSON.stringify(state.tools)),
      elapsedSeconds: state.elapsedSeconds,
      summary
    };
    return snap;
  }

  function pushHistory(summary) {
    state.history.push(snapshotState(summary));
    if (state.history.length > 200) state.history.shift();
  }
  function undoMove() {
    if (state.history.length === 0) { showToast('Nothing to undo'); return; }
    const last = state.history.pop();
    state.grid = last.grid.map(c => ({ value: c.value, id: c.id || uid() }));
    state.score = last.score;
    state.movesCount = last.movesCount;
    state.tools = last.tools;
    state.elapsedSeconds = last.elapsedSeconds;
    selected = [];
    saveToStorageAuto();
    renderGrid();
  }
  function addNumbersTool() {
    if (state.tools.add >= MAX_ADD_NUMBERS) { showToast('Add Numbers: no usages left'); return; }
    pushHistory('add numbers');
    const currentCount = state.grid.filter(c => c.value !== null).length;
    const toAdd = (() => {
      if (state.mode === 'classic') {
        return 1;
      } else if (state.mode === 'random') {
        return 1;
      } else {
        return 1;
      }
    })();
    for (let k = 0; k < toAdd; k++) {
      let v;
      if (state.mode === 'chaotic') v = randInt(1, 9);
      else if (state.mode === 'random') {

        v = randInt(1, 19);
        if (v === 0) v = 1;
      } else {
        v = randInt(1, 19);
      }
      state.grid.push({ value: v, id: uid() });
    }
    state.tools.addUsed += 1;

    const rows = Math.ceil(state.grid.length / COLS);
    if (rows > MAX_LINES) {
      endGame(false, `Grid limit exceeded (${rows} rows).`);
      return;
    }
    saveToStorageAuto();
    renderGrid();
  }
  function shuffleTool() {
    if (state.tools.shuffleUsed >= MAX_SHUFFLES) { showToast('Shuffle: no usages left'); return; }
    pushHistory('shuffle');
    const value = state.grid.map(c => c.value);
    const valuesToShuffle = values.filter(v => v !== null);
    for (let i = valuesToShuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [valuesToShuffle[i], valuesToShuffle[j]] = [valuesToShuffle[j], valuesToShuffle[i]];
    }
    let idx = 0;
    for (let i = 0; i < state.grid.length; i++) {
      if (state.grid[i].value !== null) {
        state.grid[i].value = valuesToShuffle[idx++];
      }
    }
    state.tools.shuffleUsed += 1;
    saveToStorageAuto();
    renderGrid();
  }
  function askIndexWithToast(callback) {
    showToast('Enter cell index to erase');

    const box = document.createElement('div');
    box.style.position = 'fixed';
    box.style.bottom = '20px';
    box.style.left = '50%';
    box.style.transform = 'translateX(-50%)';
    box.style.background = 'var(--card)';
    box.style.padding = '10px 14px';
    box.style.borderRadius = '10px';
    box.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    box.style.zIndex = 9999;

    box.innerHTML = `
    <div style="margin-bottom:6px;color:var(--text)">Index:</div>
    <input id="toastInput" type="number" style="padding:6px;width:140px">
  `;

    document.body.appendChild(box);

    const input = box.querySelector('#toastInput');
    input.focus();

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = Number(input.value);
        box.remove();
        callback(val);
      }
    });
  }
  function eraserTool() {
    if (state.tools.eraserUsed >= MAX_ERASER) { showToast('Eraser: no usages left'); return; }
    const indexStr = askIndexWithToast((index) => {
      eraseCell(index);
    });
    if (indexStr === null) return;
    const idx = parseInt(indexStr, 10);
    if (isNaN(idx) || idx < 0 || idx >= state.grid.length) { showToast('Invalid index'); return; }
    if (state.grid[idx].value === null) { showToast('Cell is already empty'); return; }
    pushHistory('eraser');
    state.grid[idx].value = null;
    state.tools.eraserUsed += 1;
    saveToStorageAuto();
    renderGrid();
    checkGameEnd();
  }
  function checkGameEnd() {
    if (state.score >= TARGET_SCORE) {
      endGame(true, 'Target reached!');
      return;
    }
    const moves = countAvailableMoves();
    const toolsLeft = (MAX_ADD_NUMBERS - state.tools.addUsed) + (MAX_SHUFFLES - state.tools.shuffleUsed) + (MAX_ERASER - state.tools.eraserUsed);
    if (moves === 0 && toolsLeft === 0) {
      endGame(false, 'No moves left and all tools used.');
      return;
    }
    const rows = Math.ceil(state.grid.length / COLS);
    if (rows > MAX_LINES) {
      endGame(false, 'Grid size limit reached.');
      return;
    }
  }
  function endGame(won, message) {
    stopTimer();
    els.resultModal.style.display = 'flex';
    els.resultTitle.textContent = won ? 'You win!' : 'Game over';
    els.resultText.innerHTML = `<div>${message}</div><div>Score: ${state.score}</div><div>Time: ${formatTime(state.elapsedSeconds)}</div>`;
    // save result to results list
    saveResult({ mode: state.mode, score: state.score, won, time: state.elapsedSeconds, moves: state.movesCount });
  }
  function closeResult() {
    els.resultModal.style.display = 'none';
  }
  /* ---------- Таймер ---------- */
  function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.startTime = Date.now() - (state.elapsedSeconds * 1000);
    state.timerInterval = setInterval(() => {
      state.elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
      els.timer.textContent = formatTime(state.elapsedSeconds);
    }, 500);
  }
  function stopTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  function formatTime(s) {
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }
  /* ---------- Сохранение/загрузка ---------- */
  function saveToStorage() {
    const payload = {
      state,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      showToast('Game saved.');
    } catch (e) {
      console.error(e);
      showToast('Save failed.');
    }
  }
  function saveToStorageAuto() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, savedAt: Date.now() }));
    } catch (e) { }
  }
  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { showToast('No saved game'); return; }
      const payload = JSON.parse(raw);
      state = payload.state || state;

      selected = [];
      startTimer();
      renderGrid();
      showToast('Game loaded.');
    } catch (e) {
      console.error(e);
      showToast('Load failed.');
    }
  }

  /* ---------- Результаты игр (история) ---------- */
  function saveResult(result) {
    // store last 5 results
    const key = STORAGE_KEY + '_results';
    let arr = [];
    try {
      arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.unshift(result);
      if (arr.length > 5) arr = arr.slice(0, 5);
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) { console.error(e); }
  }
  /* ---------- Старт / рестарт игры ---------- */
  function startNew(mode = 'classic') {
    stopTimer();
    state = {
      ...state,
      mode,
      grid: [],
      score: 0,
      startTime: null,
      elapsedSeconds: 0,
      timerInterval: null,
      tools: { addUsed: 0, shuffleUsed: 0, eraserUsed: 0 },
      history: [],
      movesCount: 0,
      savedAt: null,
    };
    const arr = generateInitialArray(mode);
    initGridFromArray(arr);
    // push initial snapshot
    pushHistory('start');
    startTimer();
    renderGrid();
  }
  /* ---------- Вспомогательные ---------- */
  function shuffleArrayInPlace(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } }
  /* ---------- Автозапуск интерфейса ---------- */


  // expose some functions for console debug (dev only)
  window.PEU = {
    state, startNew, saveToStorage, loadFromStorage, countAvailableMoves, showHint
  };


  createUI();
  startNew('classic');
})()