import {
  createEmptyBoard,
  generatePuzzle,
  getConflictingCells,
  solveSudoku,
  validateBoard,
} from "./sudoku.js";

const STORAGE_KEY = "sudokuklar-state-v1";
const SIZE = 9;
const DEFAULT_BEST_TIMES = Object.freeze({
  easy: null,
  medium: null,
  hard: null,
});
const EXAMPLE_BOARD = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const boardElement = document.querySelector("#sudoku-board");
const statusPanel = document.querySelector("#status-panel");
const statusElement = document.querySelector("#status");
const timerElement = document.querySelector("#timer");
const difficultyElement = document.querySelector("#difficulty");
const cells = [];

let state = loadState();
let selectedCell = -1;

createGrid();
renderBoard();
updateTimer();
window.setInterval(updateTimer, 1000);

document.querySelector("#new-game").addEventListener("click", () => {
  const difficulty = difficultyElement.value;
  setStatus("Preparando un Sudoku con solución única…");
  window.setTimeout(() => {
    try {
      const puzzle = generatePuzzle(difficulty);
      state = {
        board: puzzle.board,
        locked: getFilledPositions(puzzle.board),
        difficulty,
        elapsedSeconds: 0,
        startedAt: Date.now(),
        bestTimes: state.bestTimes,
      };
      renderBoard();
      saveState();
      const label = getDifficultyLabel(difficulty);
      setStatus(`Sudoku ${label.toLowerCase()} listo con ${puzzle.clues} pistas. ¡A jugar!`, "success");
    } catch (error) {
      console.error("No se pudo generar el Sudoku.", error);
      setStatus("No se pudo generar el Sudoku. Inténtalo de nuevo.", "error");
    }
  }, 20);
});

document.querySelector("#solve").addEventListener("click", () => {
  const validation = validateBoard(state.board);
  if (!validation.valid) {
    setStatus(validation.errors.slice(0, 3).join(" "), "error");
    renderBoard();
    return;
  }

  const solution = solveSudoku(state.board);
  if (!solution) {
    setStatus("Este tablero no tiene solución. Revisa los números que ingresaste.", "error");
    return;
  }

  state.board = solution;
  stopTimer();
  const solveTime = state.elapsedSeconds;
  const previousBest = state.bestTimes[state.difficulty];
  const isNewBest = previousBest === null || solveTime < previousBest;
  if (isNewBest) {
    state.bestTimes[state.difficulty] = solveTime;
  }
  renderBoard();
  saveState();
  const bestMessage = isNewBest
    ? " ¡Es tu mejor tiempo para esta dificultad!"
    : ` Tu mejor tiempo es ${formatTime(previousBest)}.`;
  setStatus(`¡Sudoku resuelto en ${formatTime(solveTime)}!${bestMessage}`, "success");
});

document.querySelector("#hint").addEventListener("click", () => {
  const validation = validateBoard(state.board);
  if (!validation.valid) {
    setStatus(validation.errors.slice(0, 3).join(" "), "error");
    renderBoard();
    return;
  }

  const solution = solveSudoku(state.board);
  if (!solution) {
    setStatus("No hay una solución posible para este tablero. Revisa tus números.", "error");
    return;
  }

  const emptyPositions = [];
  state.board.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
      if (value === 0) {
        emptyPositions.push(rowIndex * SIZE + columnIndex);
      }
    });
  });

  if (emptyPositions.length === 0) {
    setStatus("El tablero ya está completo.", "success");
    return;
  }

  const position = emptyPositions[0];
  const row = Math.floor(position / SIZE);
  const column = position % SIZE;
  state.board[row][column] = solution[row][column];
  startTimer();
  selectedCell = position;
  renderBoard();
  saveState();
  cells[position].focus();
  setStatus(`Pista: fila ${row + 1}, columna ${column + 1}.`, "success");
});

document.querySelector("#example").addEventListener("click", () => {
  loadPuzzle(EXAMPLE_BOARD, "medium");
  setStatus("Ejemplo cargado. Completa las casillas vacías o resuélvelo.", "success");
});

document.querySelector("#clear").addEventListener("click", () => {
  state = {
    board: createEmptyBoard(),
    locked: [],
    difficulty: difficultyElement.value,
    elapsedSeconds: 0,
    startedAt: null,
    bestTimes: state.bestTimes,
  };
  selectedCell = -1;
  renderBoard();
  saveState();
  setStatus("Tablero limpio. Escribe un Sudoku para comenzar.");
});

function createGrid() {
  for (let row = 0; row < SIZE; row += 1) {
    const rowElement = document.createElement("div");
    rowElement.className = "board-row";
    rowElement.setAttribute("role", "row");
    for (let column = 0; column < SIZE; column += 1) {
      const position = row * SIZE + column;
      const cell = document.createElement("input");
      cell.className = "cell";
      cell.type = "text";
      cell.inputMode = "numeric";
      cell.autocomplete = "off";
      cell.maxLength = 1;
      cell.spellcheck = false;
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `Fila ${row + 1}, columna ${column + 1}`);
      cell.addEventListener("input", () => handleCellInput(position, cell));
      cell.addEventListener("focus", () => {
        selectedCell = position;
        renderCellHighlights();
      });
      cell.addEventListener("keydown", (event) => handleCellKeydown(event, position));
      cells.push(cell);
      rowElement.append(cell);
    }
    boardElement.append(rowElement);
  }
}

function handleCellInput(position, cell) {
  if (state.locked.includes(position)) {
    renderBoard();
    return;
  }

  const value = cell.value.trim();
  if (!/^[0-9]?$/.test(value)) {
    cell.value = state.board[Math.floor(position / SIZE)][position % SIZE] || "";
    setStatus("Usa solo dígitos del 1 al 9; el 0 o una casilla vacía representan un espacio.", "error");
    return;
  }

  const row = Math.floor(position / SIZE);
  const column = position % SIZE;
  state.board[row][column] = value === "" || value === "0" ? 0 : Number(value);
  if (state.board[row][column] !== 0) {
    startTimer();
  }
  renderBoard();
  saveState();

  const validation = validateBoard(state.board);
  if (!validation.valid) {
    setStatus(`Hay conflictos: ${validation.errors[0]}`, "error");
  } else {
    setStatus("Sin conflictos por ahora. Puedes seguir completando el tablero.", "success");
  }
}

function handleCellKeydown(event, position) {
  const offsets = {
    ArrowUp: -SIZE,
    ArrowDown: SIZE,
  };
  if (Object.hasOwn(offsets, event.key)) {
    event.preventDefault();
    const nextPosition = Math.max(0, Math.min(SIZE * SIZE - 1, position + offsets[event.key]));
    cells[nextPosition].focus();
    return;
  }

  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    const rowStart = Math.floor(position / SIZE) * SIZE;
    const rowEnd = rowStart + SIZE - 1;
    const nextPosition =
      event.key === "ArrowLeft"
        ? Math.max(rowStart, position - 1)
        : Math.min(rowEnd, position + 1);
    cells[nextPosition].focus();
    return;
  }

  if (event.key === "Backspace" || event.key === "Delete") {
    if (!state.locked.includes(position)) {
      const row = Math.floor(position / SIZE);
      const column = position % SIZE;
      state.board[row][column] = 0;
      renderBoard();
      saveState();
      setStatus("Casilla vacía.");
    }
    return;
  }

  if (event.key === "0" && !state.locked.includes(position)) {
    event.preventDefault();
    const row = Math.floor(position / SIZE);
    const column = position % SIZE;
    state.board[row][column] = 0;
    renderBoard();
    saveState();
    setStatus("Casilla vacía.");
  }
}

function renderBoard() {
  const conflicts = getConflictingCells(state.board);
  const selectedRow = Math.floor(selectedCell / SIZE);
  const selectedColumn = selectedCell % SIZE;
  const selectedValue =
    selectedCell < 0 ? 0 : state.board[selectedRow]?.[selectedColumn] ?? 0;

  cells.forEach((cell, position) => {
    const row = Math.floor(position / SIZE);
    const column = position % SIZE;
    const value = state.board[row][column];
    const isGiven = state.locked.includes(position);
    const isPeer =
      selectedCell >= 0 &&
      position !== selectedCell &&
      (row === selectedRow ||
        column === selectedColumn ||
        (Math.floor(row / 3) === Math.floor(selectedRow / 3) &&
          Math.floor(column / 3) === Math.floor(selectedColumn / 3)));

    cell.value = value === 0 ? "" : String(value);
    cell.readOnly = isGiven;
    cell.setAttribute("aria-readonly", String(isGiven));
    cell.classList.toggle("is-given", isGiven);
    cell.classList.toggle("is-peer", isPeer);
    cell.classList.toggle("is-same", value !== 0 && value === selectedValue);
    cell.classList.toggle("is-conflict", conflicts.has(position));
  });

  difficultyElement.value = state.difficulty;
  updateTimer();
}

function renderCellHighlights() {
  const selectedRow = Math.floor(selectedCell / SIZE);
  const selectedColumn = selectedCell % SIZE;
  const selectedValue = state.board[selectedRow]?.[selectedColumn] ?? 0;

  cells.forEach((cell, position) => {
    const row = Math.floor(position / SIZE);
    const column = position % SIZE;
    const value = state.board[row][column];
    const isPeer =
      position !== selectedCell &&
      (row === selectedRow ||
        column === selectedColumn ||
        (Math.floor(row / 3) === Math.floor(selectedRow / 3) &&
          Math.floor(column / 3) === Math.floor(selectedColumn / 3)));
    cell.classList.toggle("is-peer", isPeer);
    cell.classList.toggle("is-same", value !== 0 && value === selectedValue);
  });
}

function loadPuzzle(board, difficulty) {
  state = {
    board: board.map((row) => row.slice()),
    locked: getFilledPositions(board),
    difficulty,
    elapsedSeconds: 0,
    startedAt: Date.now(),
    bestTimes: state.bestTimes,
  };
  selectedCell = -1;
  renderBoard();
  saveState();
}

function getFilledPositions(board) {
  const positions = [];
  board.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
      if (value !== 0) {
        positions.push(rowIndex * SIZE + columnIndex);
      }
    });
  });
  return positions;
}

function startTimer() {
  if (state.startedAt === null) {
    state.startedAt = Date.now();
  }
  updateTimer();
}

function stopTimer() {
  if (state.startedAt !== null) {
    state.elapsedSeconds += Math.floor((Date.now() - state.startedAt) / 1000);
    state.startedAt = null;
  }
  updateTimer();
}

function updateTimer() {
  const totalSeconds =
    state.elapsedSeconds +
    (state.startedAt === null ? 0 : Math.floor((Date.now() - state.startedAt) / 1000));
  timerElement.textContent = formatTime(totalSeconds);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function setStatus(message, kind = "info") {
  statusElement.textContent = message;
  statusPanel.dataset.kind = kind;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("No se pudo guardar el Sudoku en el navegador.", error);
    setStatus("No se pudo guardar el progreso. Revisa el almacenamiento del navegador.", "error");
  }
}

function loadState() {
  let saved;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return createFreshState();
    }
    saved = JSON.parse(raw);
  } catch (error) {
    console.error("No se pudo leer el Sudoku guardado.", error);
    setStatus("No se pudo leer el progreso guardado. Se abrirá un tablero nuevo.", "error");
    return createFreshState();
  }

  if (!isSavedStateValid(saved)) {
    setStatus("El progreso guardado no es válido. Se abrirá un tablero nuevo.", "error");
    return createFreshState();
  }

  return saved;
}

function isSavedStateValid(saved) {
  return (
    saved !== null &&
    typeof saved === "object" &&
    Array.isArray(saved.board) &&
    saved.board.length === SIZE &&
    saved.board.every(
      (row) =>
        Array.isArray(row) &&
        row.length === SIZE &&
        row.every((value) => Number.isInteger(value) && value >= 0 && value <= 9),
    ) &&
    Array.isArray(saved.locked) &&
    saved.locked.every(
      (position) => Number.isInteger(position) && position >= 0 && position < SIZE * SIZE,
    ) &&
    ["easy", "medium", "hard"].includes(saved.difficulty) &&
    Number.isFinite(saved.elapsedSeconds) &&
    saved.elapsedSeconds >= 0 &&
    (saved.startedAt === null || Number.isFinite(saved.startedAt)) &&
    saved.bestTimes !== null &&
    typeof saved.bestTimes === "object" &&
    ["easy", "medium", "hard"].every(
      (difficulty) =>
        saved.bestTimes[difficulty] === null ||
        (Number.isInteger(saved.bestTimes[difficulty]) && saved.bestTimes[difficulty] >= 0),
    )
  );
}

function createFreshState() {
  return {
    board: createEmptyBoard(),
    locked: [],
    difficulty: "medium",
    elapsedSeconds: 0,
    startedAt: null,
    bestTimes: { ...DEFAULT_BEST_TIMES },
  };
}

function getDifficultyLabel(difficulty) {
  return {
    easy: "Tranquilo",
    medium: "Intermedio",
    hard: "Desafiante",
  }[difficulty];
}
