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
})