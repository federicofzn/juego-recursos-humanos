const COSTS = {
  hint: 3,
  discard: 4,
  swap: 5,
  erase: 10
};

const CASE_TYPES = {
  caso: "Caso practico",
  clasificar: "Clasifica",
  concepto: "Consulta",
  norma: "Norma y articulo",
  definicion: "Definición",
  emparejar: "Emparejar",
  error: "Encontrá el error"
};

// Camino de pasos: entre una tienda y la siguiente hay entre 2 y 4 desafios.
// Cada desafio es un caso, un contrarreloj, una definicion, un emparejar o un encontrar el error, segun estas probabilidades.
const PATH = {
  minCasesBetweenShops: 2,
  maxCasesBetweenShops: 4,
  visibleBefore: 1,
  visibleAfter: 5,
  challengeWeights: { case: 0.3, timed: 0.175, definition: 0.175, match: 0.175, error: 0.175 }
};

// Jefe: cada 10 eventos (sin contar tiendas) repregunta 3 de los ultimos 10, sin herramientas.
const BOSS = {
  every: 10,
  lookBack: 10,
  questions: 3,
  rewards: ["hint", "discard", "swap"],
  // Las preguntas del jefe ya se respondieron antes: todas van con reloj, y mas corto que el contrarreloj.
  timerSeconds: 30
};

// Modo reloj (se elige al crear la partida): no hay eventos contrarreloj, pero despues del primer jefe
// todos los eventos van con reloj. Arranca en 60 s y cada jefe siguiente le resta 3, hasta 30.
const CLOCK_MODE = {
  startSeconds: 60,
  stepSeconds: 3,
  minSeconds: 30,
  challengeWeights: { case: 0.3, definition: 0.25, match: 0.2, error: 0.25 }
};

const TOOL_NAMES = { hint: "Pista", discard: "Descartar", swap: "Cambiar" };
// Los mismos iconos que los botones de las herramientas.
const TOOL_ICONS = { hint: "lightbulb", discard: "filter_alt_off", swap: "swap_horiz" };

const STEP_INFO = {
  case: { icon: "description", label: "Caso" },
  timed: { icon: "timer", label: "Contrarreloj" },
  definition: { icon: "spellcheck", label: "Definición" },
  match: { icon: "link", label: "Emparejar" },
  error: { icon: "find_in_page", label: "Error" },
  review: { icon: "replay", label: "Repaso" },
  boss: { icon: "swords", label: "Jefe" },
  shop: { icon: "storefront", label: "Tienda" }
};

// Contrarreloj: solo casos cortos, para que se puedan leer en el tiempo disponible.
// La barra se pone roja en el ultimo tercio del tiempo (20 s de 60).
const TIMED = {
  seconds: 60,
  points: 2,
  maxReadingChars: 260
};

// Repeticion espaciada: lo que se falla vuelve como "Repaso" entre 3 y 6 pasos mas adelante.
// Si ya hay repasos pendientes, el nuevo se ubica entre 3 y 6 pasos despues del ultimo, para que no se amontonen.
const REVIEW = {
  gap: [3, 6],
  recentWindow: 12
};

const STORAGE = {
  game: "estudioRRHH.partida",
  memory: "estudioRRHH.memoria",
  achievements: "estudioRRHH.logros",
  units: "estudioRRHH.unidades"
};

// Cantidad de errores que terminan la partida.
const MAX_MISTAKES = 10;

// Segundos de espera antes de poder tocar "Siguiente", para leer el "Por qué".
const READ_DELAY = {
  correct: 3,
  wrong: 5
};

// Logros: contadores que se acumulan entre partidas. Cada uno tiene 5 niveles (verde, azul, violeta, rojo y dorado).
const TIER_NAMES = ["Verde", "Azul", "Violeta", "Rojo", "Dorado"];
const ACHIEVEMENTS = [
  { key: "unit:introduccion", name: "Introducción a RRHH", icon: "groups", description: "Respondé bien casos o definiciones de Introducción a RRHH.", tiers: [5, 15, 40, 80, 150] },
  { key: "unit:estrategia_cultura", name: "Estrategia y cultura", icon: "flag", description: "Respondé bien casos o definiciones de Estrategia y cultura.", tiers: [5, 15, 40, 80, 150] },
  { key: "unit:transformacion", name: "Transformación organizacional", icon: "autorenew", description: "Respondé bien casos o definiciones de Transformación organizacional.", tiers: [5, 15, 40, 80, 150] },
  { key: "unit:clima_evp", name: "Clima y EVP", icon: "mood", description: "Respondé bien casos o definiciones de Clima y EVP.", tiers: [5, 15, 40, 80, 150] },
  { key: "unit:contrato_trabajo", name: "Ley de Contrato de Trabajo", icon: "work", description: "Respondé bien casos o definiciones de Ley de Contrato de Trabajo.", tiers: [5, 15, 40, 80, 150] },
  { key: "kind:case", name: "Casos situacionales", icon: "description", description: "Resolvé casos situacionales.", tiers: [5, 20, 50, 100, 200] },
  { key: "kind:timed", name: "Contrarreloj", icon: "timer", description: "Resolvé desafíos con reloj antes de que se termine el tiempo.", tiers: [5, 15, 30, 60, 100] },
  { key: "kind:definition", name: "Definiciones", icon: "spellcheck", description: "Elegí la definición correcta de un término.", tiers: [5, 20, 50, 100, 200] },
  { key: "kind:match", name: "Emparejar", icon: "link", description: "Uní correctamente los 3 términos con sus definiciones.", tiers: [5, 15, 30, 60, 100] },
  { key: "kind:error", name: "Detective", icon: "find_in_page", description: "Encontrá la oración incorrecta en un texto.", tiers: [5, 15, 30, 60, 100] },
  { key: "kind:review", name: "Repasos superados", icon: "replay", description: "Acertá en un repaso una pregunta que habías fallado.", tiers: [5, 15, 30, 60, 100] },
  { key: "boss:won", name: "Jefes vencidos", icon: "swords", description: "Vencé a un jefe acertando sus 3 preguntas.", tiers: [1, 5, 10, 20, 40] }
];

const state = {
  questions: [],
  timedQuestions: [],
  definitions: [],
  errors: [],
  glossary: [],
  glossaryById: new Map(),
  questionsById: new Map(),
  reference: null,
  memory: {},
  achievements: {},
  toastTimer: null,
  timer: null,
  nextLock: null,
  score: 0,
  mistakes: 0,
  solved: 0,
  streak: 0,
  bestStreak: 0,
  playerTitle: "Lic.",
  playerName: "Estudiante",
  clockMode: false,
  enabledUnits: null,
  inventory: {
    hint: 0,
    discard: 0,
    swap: 0
  },
  path: null,
  stepIndex: 0,
  stepResults: [],
  correctIds: [],
  recentIds: [],
  activeKind: "case",
  answerCorrect: false,
  stepLog: [],
  boss: null,
  match: null,
  matchGroups: null,
  activeQuestion: null,
  activeOptions: [],
  answered: false,
  chosenIndex: null,
  answerNote: "",
  timerDeadline: null,
  hintUsed: false,
  discardUsed: false,
  gameOver: false,
  selectedUnit: null,
  bookSearchTerm: "",
  // -1 = todavia no se navego: el primer "abajo" va al primer resultado y el primer "arriba", al ultimo.
  searchHitIndex: -1
};

const els = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindElements();
  state.questions = readEmbeddedJson("questions-data", []);
  state.definitions = readEmbeddedJson("definitions-data", []);
  state.errors = readEmbeddedJson("errors-data", []);
  state.glossary = readEmbeddedJson("glossary-data", []).map((entry) => ({ ...entry, regex: new RegExp(entry.source, "giu") }));
  state.glossary.forEach((entry) => state.glossaryById.set(entry.id, entry));
  state.reference = readEmbeddedJson("reference-data", { unidades: [], entradas: {} });
  state.timedQuestions = state.questions.filter((question) => readingLength(question) <= TIMED.maxReadingChars);
  [...state.questions, ...state.definitions, ...state.errors].forEach((item) => state.questionsById.set(item.id, item));
  state.memory = readStorage(STORAGE.memory) || {};
  state.achievements = readStorage(STORAGE.achievements) || {};

  bindEvents();
  renderAchievements();
  watchTopRowHeight();
  renderBook();
  renderSuggestedEntry();
  updateStats();
  restoreGame();
}

function bindElements() {
  [
    "score", "mistakes", "solved", "streak", "startScreen", "gameScreen",
    "startBtn", "questionText", "answers", "hintBox", "nextBtn", "hintBtn",
    "discardBtn", "swapBtn", "bookTitle", "bookBackBtn", "bookSearch",
    "bookSearchCount", "bookPrevMatchBtn", "bookNextMatchBtn", "bookUnits",
    "bookEntries", "suggestedEntryBtn", "gameOverModal",
    "finalStats", "restartBtn", "caseTitle", "playerName", "titleSelect", "clockModeCheck", "unitChecks", "unitPickerHint",
    "playerDisplay", "caseUnitLabel", "hintCount", "discardCount", "swapCount",
    "shopScreen", "buyHintBtn", "buyDiscardBtn", "buySwapBtn", "buyEraseBtn", "continueFromShopBtn",
    "shopPoints", "shopHintOwned", "shopDiscardOwned", "shopSwapOwned", "shopMistakes",
    "caseStory", "caseTypeLabel", "explanationBox", "explanationText",
    "progressBar", "progressEmpty", "progressTrack", "toolsRow", "timerBox", "timerFill", "timerText", "timerBonus", "caseHeaderLabel",
    "deleteGameBtn", "deleteModal", "deleteMemoryCheck", "cancelDeleteBtn", "confirmDeleteBtn",
    "achievementsRow", "achievementToast", "glossTip", "deleteAchievementsCheck", "bossBar", "bossNodes",
    "bookPanel", "bookLock", "bottomRow", "bookExpandBtn", "bossRewardBox", "bossRewardText"
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
  renderUnitPicker();
  bindGlossaryTooltip();
  els.startBtn.addEventListener("click", startGame);
  els.restartBtn.addEventListener("click", startGame);
  els.nextBtn.addEventListener("click", proceedAfterAnswer);
  els.hintBtn.addEventListener("click", useHint);
  els.discardBtn.addEventListener("click", useDiscard);
  els.swapBtn.addEventListener("click", useSwap);
  els.bookBackBtn.addEventListener("click", showBookIndex);
  els.bookExpandBtn.addEventListener("click", () => setBookExpanded(!els.bottomRow.classList.contains("book-expanded")));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.bottomRow.classList.contains("book-expanded")) setBookExpanded(false);
  });
  els.bookSearch.addEventListener("input", updateBookSearch);
  els.bookPrevMatchBtn.addEventListener("click", () => goToSearchMatch(-1));
  els.bookNextMatchBtn.addEventListener("click", () => goToSearchMatch(1));
  els.buyHintBtn.addEventListener("click", () => buyTool("hint"));
  els.buyDiscardBtn.addEventListener("click", () => buyTool("discard"));
  els.buySwapBtn.addEventListener("click", () => buyTool("swap"));
  els.buyEraseBtn.addEventListener("click", buyEraseMistake);
  els.continueFromShopBtn.addEventListener("click", continueFromShop);
  els.deleteGameBtn.addEventListener("click", openDeleteModal);
  els.cancelDeleteBtn.addEventListener("click", closeDeleteModal);
  els.confirmDeleteBtn.addEventListener("click", deleteGame);
  els.suggestedEntryBtn.addEventListener("click", () => {
    if (state.activeQuestion) {
      openBook(state.activeQuestion.referencia.entradaLibro);
    }
  });
}

function startGame() {
  state.playerTitle = els.titleSelect.value;
  state.playerName = els.playerName.value.trim() || "Estudiante";
  state.clockMode = els.clockModeCheck.checked;
  state.enabledUnits = selectedUnits();
  if (!state.enabledUnits.length) return;
  writeStorage(STORAGE.units, state.enabledUnits);
  state.matchGroups = null;
  state.score = 0;
  state.mistakes = 0;
  state.solved = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.inventory = { hint: 0, discard: 0, swap: 0 };
  state.gameOver = false;
  state.path = createPath(randomInt(1, 2 ** 31 - 1));
  state.stepIndex = 0;
  state.stepResults = [];
  state.correctIds = [];
  state.recentIds = [];
  state.stepLog = [];
  state.boss = null;
  els.progressTrack.innerHTML = "";
  showGameLayout();
  renderPath({ animate: false });
  enterCurrentStep();
}

function showGameLayout() {
  els.playerDisplay.textContent = `${state.playerTitle} ${state.playerName}`;
  // Si el nombre no entra y se corta con "…", al pasar el mouse se ve completo.
  els.playerDisplay.title = els.playerDisplay.textContent;
  els.startScreen.classList.add("hidden");
  els.gameScreen.classList.remove("hidden");
  els.gameOverModal.classList.add("hidden");
  els.shopScreen.classList.add("hidden");
  els.progressEmpty.classList.add("hidden");
  els.deleteGameBtn.disabled = false;
}

// Prepara un desafio en el panel central: caso comun, contrarreloj, definicion o repaso.
function nextCase(kind = "case") {
  loadChallenge(kind, null);
  // Se anota que se jugo en este paso, para que el jefe pueda volver a preguntarlo.
  state.stepLog[state.stepIndex] = {
    kind,
    questionId: state.match ? null : state.activeQuestion.id,
    matchIds: state.match ? state.match.ids : null
  };
  saveGame();
}

// Carga un desafio. Si content trae una pregunta (o los terminos de un emparejar) se usa esa;
// si no, se elige una nueva.
function loadChallenge(kind, content) {
  state.activeKind = kind;
  if (kind === "match") {
    state.match = content && content.matchIds
      ? { ids: content.matchIds, defOrder: shuffle([...content.matchIds]), pairs: [], failed: null }
      : createMatch();
    state.activeQuestion = buildMatchQuestion(state.match);
    state.activeOptions = [];
  } else {
    state.match = null;
    const given = content && content.questionId && state.questionsById.get(content.questionId);
    state.activeQuestion = given || (kind === "review"
      ? state.questionsById.get(currentStep().reviewId) || pickQuestion("case")
      : pickQuestion(kind));
    state.activeOptions = buildOptions(state.activeQuestion);
  }
  state.answerCorrect = false;
  state.answered = false;
  state.chosenIndex = null;
  state.answerNote = "";
  state.hintUsed = false;
  state.discardUsed = false;
  const seconds = challengeSeconds(kind);
  state.timerDeadline = seconds ? Date.now() + seconds * 1000 : null;
  (state.match ? state.match.ids : [state.activeQuestion.id]).forEach(rememberRecent);
  showCase();
}

// Dibuja el desafio actual a partir del estado (sirve tanto para uno nuevo como para uno restaurado).
function showCase() {
  hideTimer();
  els.hintBox.classList.toggle("hidden", !state.hintUsed);
  if (state.hintUsed) els.hintBox.innerHTML = glossify(state.activeQuestion.pista);
  els.explanationBox.classList.add("hidden");
  renderBossReward();
  els.toolsRow.classList.toggle("hidden", Boolean(state.boss));
  renderBossBar();
  unlockNextButton();
  els.nextBtn.classList.add("hidden");
  els.nextBtn.innerHTML = '<span class="material-symbols-rounded">arrow_forward</span>Siguiente';
  renderCase();
  updateStats();
  if (state.answered) {
    showAnswerResult();
  } else if (state.timerDeadline) {
    startTimer(state.timerDeadline);
  }
}

// Elige una pregunta evitando lo ya acertado en esta partida, lo visto hace poco y lo que ya tiene repaso pendiente.
// Entre las candidatas, pesan mas las que el jugador fallo en partidas anteriores.
function pickQuestion(kind) {
  const pools = { definition: state.definitions, timed: state.timedQuestions, error: state.errors };
  const pool = (pools[kind] || state.questions).filter(inPlay);
  const fallback = state.questions.filter(inPlay);
  const source = pool.length ? pool : fallback.length ? fallback : state.questions;
  const pending = new Set(state.path.steps.filter((step) => step.reviewId).map((step) => step.reviewId));
  const recent = new Set(state.recentIds);
  const correct = new Set(state.correctIds);
  const candidates =
    source.filter((item) => !pending.has(item.id) && !recent.has(item.id) && !correct.has(item.id)).length
      ? source.filter((item) => !pending.has(item.id) && !recent.has(item.id) && !correct.has(item.id))
      : source.filter((item) => !pending.has(item.id) && !recent.has(item.id));
  return weightedPick(candidates.length ? candidates : source, (item) => {
    const record = state.memory[item.id];
    return record ? 1 + Math.min(9, 3 * Math.max(0, record.wrong - record.right)) : 1;
  });
}

function weightedPick(items, weightOf) {
  const total = items.reduce((sum, item) => sum + weightOf(item), 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= weightOf(item);
    if (roll < 0) return item;
  }
  return items[items.length - 1];
}

function rememberRecent(id) {
  state.recentIds = [...state.recentIds.filter((item) => item !== id), id].slice(-REVIEW.recentWindow);
}

function readingLength(question) {
  const distractors = question.respuestasIncorrectas.reduce((total, text) => total + text.length, 0);
  return question.situacion.length + question.pregunta.length + question.respuestaCorrecta.length +
    (2 * distractors) / question.respuestasIncorrectas.length;
}

// Segundos de reloj de un desafio (0 = sin reloj).
function challengeSeconds(kind) {
  if (state.clockMode) {
    const events = clockModeSeconds(bossesPassed());
    if (state.boss) return events ? Math.min(BOSS.timerSeconds, events) : BOSS.timerSeconds;
    return events;
  }
  if (state.boss) return BOSS.timerSeconds;
  return kind === "timed" ? TIMED.seconds : 0;
}

// Modo reloj: sin reloj hasta pasar el primer jefe; despues 60 s y 3 menos por cada jefe siguiente, hasta 30.
function clockModeSeconds(passed) {
  if (passed === 0) return 0;
  return Math.max(CLOCK_MODE.minSeconds, CLOCK_MODE.startSeconds - CLOCK_MODE.stepSeconds * (passed - 1));
}

// Jefes ya jugados (ganados o perdidos): los que quedaron antes del paso actual.
function bossesPassed() {
  return state.path.steps.filter((step, index) => step.type === "boss" && index < state.stepIndex).length;
}

function startTimer(deadline) {
  stopTimer();
  els.timerBox.classList.remove("hidden", "urgent", "expired");
  // Solo el contrarreloj y el jefe dan puntos extra; en el modo reloj los eventos comunes no.
  els.timerBonus.classList.toggle("hidden", !(state.activeKind === "timed" || state.boss));
  const seconds = challengeSeconds(state.activeKind) || TIMED.seconds;
  const tick = () => {
    const remaining = Math.max(0, deadline - Date.now());
    els.timerFill.style.width = `${Math.min(100, (remaining / (seconds * 1000)) * 100)}%`;
    els.timerText.textContent = Math.ceil(remaining / 1000);
    els.timerBox.classList.toggle("urgent", remaining <= (seconds / 3) * 1000);
    if (remaining === 0) timeUp();
  };
  tick();
  if (!state.answered) state.timer = setInterval(tick, 100);
}

function stopTimer() {
  if (state.timer) clearInterval(state.timer);
  state.timer = null;
}

function hideTimer() {
  stopTimer();
  els.timerBox.classList.add("hidden");
}

// Se acabo el tiempo: cuenta como respuesta incorrecta.
function timeUp() {
  stopTimer();
  if (state.answered) return;
  // En emparejar, el termino que se estaba por unir es el que vuelve como repaso.
  if (state.match) state.match.failed = { termId: activeMatchTerm(), defId: null };
  resolveAnswer(false, null, "Se acabó el tiempo.");
}

function buildOptions(question) {
  // Encontrá el error: las oraciones van en su orden; la "correcta" es la oración incorrecta del texto.
  if (question.tipo === "error") {
    return question.oraciones.map((text, index) => ({ text, correct: index === question.incorrecta, disabled: false }));
  }
  const incorrect = shuffle([...question.respuestasIncorrectas]).slice(0, 2);
  return shuffle([
    { text: question.respuestaCorrecta, correct: true, disabled: false },
    ...incorrect.map((text) => ({ text, correct: false, disabled: false }))
  ]);
}

function renderCase() {
  const unit = findUnit(state.activeQuestion.unidad);
  const question = state.activeQuestion;
  const isDefinition = question.tipo === "definicion";
  // El titulo solo indica el tipo de desafio: el nombre del caso daria una pista de la respuesta.
  const titles = { review: "Repaso", definition: "Definición", timed: "Contrarreloj", match: "Emparejar", error: "Encontrá el error", case: "Caso situacional" };
  const title = titles[state.activeKind] || titles.case;
  els.caseTitle.textContent = state.boss ? `Jefe: ${title}` : title;
  els.caseHeaderLabel.textContent = state.activeKind === "match"
    ? "Términos a emparejar"
    : isDefinition ? "Término a definir" : question.tipo === "error" ? "Texto a revisar" : "Situación recibida";
  els.caseStory.innerHTML = glossify(question.situacion || "");
  els.questionText.innerHTML = glossify(question.pregunta);
  els.caseUnitLabel.textContent = unit ? unit.titulo : question.unidad;
  els.caseUnitLabel.dataset.unit = question.unidad;
  els.caseTypeLabel.textContent = CASE_TYPES[question.tipo] || "Consulta";
  els.answers.innerHTML = "";
  if (state.activeKind === "match") {
    renderMatchBoard();
    renderSuggestedEntry();
    updateTools();
    return;
  }

  if (question.tipo === "error") {
    renderErrorText();
    renderSuggestedEntry();
    updateTools();
    return;
  }

  const optionsHtml = glossifyOptions(state.activeOptions.map((option) => option.text));
  state.activeOptions.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.disabled = option.disabled;
    button.innerHTML = `<span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 font-black">${index + 1}</span><span>${optionsHtml[index]}</span>`;
    button.addEventListener("click", () => answer(index));
    els.answers.appendChild(button);
  });

  renderSuggestedEntry();
  updateTools();
}

function answer(index) {
  const option = state.activeOptions[index];
  if (state.answered || option.disabled) return;
  stopTimer();
  resolveAnswer(option.correct, index);
}

function resolveAnswer(correct, chosenIndex, note = "") {
  state.answered = true;
  state.answerCorrect = correct;
  state.chosenIndex = chosenIndex;
  state.answerNote = note;
  const id = state.activeQuestion.id;
  // En emparejar se registran los 3 terminos; si falla, se repasa la definicion que confundio.
  const answeredIds = state.match ? state.match.ids : [id];
  const reviewId = state.match && state.match.failed ? state.match.failed.termId : id;

  if (correct) {
    // El contrarreloj (y el jefe, que va todo con reloj) vale mas puntos, pero cuenta como un solo caso resuelto.
    const points = state.activeKind === "timed" || state.boss ? TIMED.points : 1;
    state.score += points;
    state.solved += 1;
    // Racha: aciertos seguidos; se corta con cualquier error (tambien si se acaba el tiempo).
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.correctIds.push(...answeredIds);
    // Las preguntas del jefe son repeticiones: no suman a los logros de unidad ni de tipo de desafio.
    if (!state.boss) {
      addAchievementProgress({
        [`unit:${state.activeQuestion.unidad}`]: 1,
        [`kind:${state.activeKind}`]: 1,
        // En el modo reloj, todo acierto con reloj cuenta para el logro de contrarreloj.
        ...(state.clockMode && state.timerDeadline ? { "kind:timed": 1 } : {})
      });
    }
  } else {
    state.mistakes += 1;
    state.streak = 0;
    scheduleReview(reviewId);
  }

  (correct ? answeredIds : [reviewId]).forEach((itemId) => updateMemory(itemId, correct));
  if (state.boss) {
    recordBossAnswer(correct);
  } else {
    state.stepResults[state.stepIndex] = correct ? "correct" : "wrong";
  }
  renderPath({ animate: false });
  showAnswerResult();
  updateStats();
  saveGame();
}

function showAnswerResult() {
  const correct = state.answerCorrect;
  renderBossBar();
  hideTimer();
  if (state.answerNote && state.timerDeadline) {
    els.timerBox.classList.remove("hidden");
    els.timerBox.classList.add("expired");
    els.timerText.textContent = "0";
  }
  if (state.match) renderMatchBoard();
  else revealAnswers(correct);
  showExplanation(correct, state.answerNote);
  renderBossReward();
  // Ya respondido: las herramientas no se pueden usar, se ocultan para dejar lugar a la explicacion.
  els.toolsRow.classList.add("hidden");
  updateTools();
  els.nextBtn.classList.remove("hidden");
  if (state.boss && state.boss.index < state.boss.items.length - 1) {
    els.nextBtn.innerHTML = '<span class="material-symbols-rounded">arrow_forward</span>Siguiente pregunta del jefe';
  }
  if (state.mistakes >= MAX_MISTAKES) {
    els.nextBtn.innerHTML = '<span class="material-symbols-rounded">flag</span>Ver resultado';
  }
  lockNextButton(correct ? READ_DELAY.correct : READ_DELAY.wrong);
}

// Bloquea "Siguiente" unos segundos, con una barra que se llena, para que se lea el "Por qué".
function lockNextButton(seconds) {
  clearTimeout(state.nextLock);
  els.nextBtn.disabled = true;
  els.nextBtn.classList.remove("waiting");
  void els.nextBtn.offsetWidth; // reinicia la animacion de la barra
  els.nextBtn.style.setProperty("--wait", `${seconds}s`);
  els.nextBtn.classList.add("waiting");
  state.nextLock = setTimeout(unlockNextButton, seconds * 1000);
}

function unlockNextButton() {
  clearTimeout(state.nextLock);
  state.nextLock = null;
  els.nextBtn.disabled = false;
  els.nextBtn.classList.remove("waiting");
}

// Inserta un paso de repaso unos lugares mas adelante en el camino (se ve aparecer en la barra).
function scheduleReview(id) {
  const [minGap, maxGap] = REVIEW.gap;
  const gap = minGap + Math.floor(nextRandom(state.path) * (maxGap - minGap + 1));
  const target = lastPendingReviewIndex() + gap;
  stepAt(target);
  state.path.steps.splice(target, 0, { type: "review", reviewId: id });
  replaceFutureBosses();
}

// Punto de partida para ubicar un repaso nuevo: el ultimo repaso que todavia no se jugo,
// o el paso actual si no hay ninguno pendiente.
function lastPendingReviewIndex() {
  let anchor = state.stepIndex;
  state.path.steps.forEach((step, index) => {
    if (step.type === "review" && index > state.stepIndex) anchor = Math.max(anchor, index);
  });
  return anchor;
}

function updateMemory(id, correct) {
  const record = state.memory[id] || { right: 0, wrong: 0 };
  if (correct) record.right += 1;
  else record.wrong += 1;
  state.memory[id] = record;
  writeStorage(STORAGE.memory, state.memory);
}

function proceedAfterAnswer() {
  if (els.nextBtn.disabled) return;
  // Cada desafio nuevo arranca con el libro en el indice, para ver la entrada sugerida.
  showBookIndex();
  if (state.mistakes >= MAX_MISTAKES) {
    gameOver();
    return;
  }
  if (state.boss && state.boss.index < state.boss.items.length - 1) {
    state.boss.index += 1;
    playBossQuestion();
    return;
  }
  advanceStep();
}

// Encontrá el error: el texto se lee como un parrafo y cada oracion se puede tocar.
function renderErrorText() {
  const sentencesHtml = glossifyOptions(state.activeOptions.map((option) => option.text));
  const text = document.createElement("p");
  text.className = "error-text";
  state.activeOptions.forEach((option, index) => {
    // Un span y no un button: un boton no se puede partir en varias lineas como el texto comun.
    const sentence = document.createElement("span");
    sentence.className = `error-sentence${option.disabled ? " discarded" : ""}`;
    sentence.innerHTML = sentencesHtml[index];
    if (option.disabled) {
      sentence.title = "Esta oración es correcta";
    } else {
      sentence.setAttribute("role", "button");
      sentence.tabIndex = 0;
      sentence.addEventListener("click", () => answer(index));
      sentence.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        answer(index);
      });
    }
    text.append(sentence, " ");
  });
  els.answers.appendChild(text);
}

// Al responder se marca la oracion incorrecta (la que habia que encontrar) y, si se eligio otra, esa en ambar.
function revealErrorText() {
  els.answers.querySelectorAll(".error-sentence").forEach((sentence, index) => {
    sentence.classList.add("locked");
    sentence.removeAttribute("tabindex");
    if (state.activeOptions[index].correct) sentence.classList.add("found");
    else if (index === state.chosenIndex) sentence.classList.add("wrong");
  });
}

function revealAnswers(wasCorrect) {
  if (state.activeQuestion.tipo === "error") {
    revealErrorText();
    return;
  }
  [...els.answers.children].forEach((button, index) => {
    button.disabled = true;
    const option = state.activeOptions[index];
    if (option.correct) {
      button.classList.add("correct");
    } else if (!wasCorrect) {
      button.classList.add("wrong");
    }
  });
}

function showExplanation(wasCorrect, note = "") {
  const text = state.activeQuestion.explicacion;
  if (!text) return;
  els.explanationText.innerHTML = glossify(note ? `${note} ${text}` : text);
  els.explanationBox.classList.toggle("missed", !wasCorrect);
  els.explanationBox.classList.remove("hidden");
}

function useHint() {
  if (!hasTool("hint") || state.hintUsed || state.answered) return;
  state.inventory.hint -= 1;
  state.hintUsed = true;
  els.hintBox.innerHTML = glossify(state.activeQuestion.pista);
  els.hintBox.classList.remove("hidden");
  updateStats();
  updateTools();
  saveGame();
}

function useDiscard() {
  if (!hasTool("discard") || state.discardUsed || state.answered) return;
  if (state.match) {
    discardMatchPair();
    return;
  }
  const wrongVisible = state.activeOptions
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => !option.correct && !option.disabled);
  const target = pickRandom(wrongVisible);
  if (!target) return;
  state.inventory.discard -= 1;
  state.discardUsed = true;
  state.activeOptions[target.index].disabled = true;
  renderCase();
  updateStats();
  updateTools();
  saveGame();
}

// Cambiar: reemplaza la pregunta actual por otra del mismo tipo. En contrarreloj el tiempo vuelve a empezar.
// No se puede usar en un repaso, porque el sentido del repaso es volver a esa pregunta.
function useSwap() {
  if (!canSwap()) return;
  state.inventory.swap -= 1;
  nextCase(state.activeKind);
}

function canSwap() {
  return hasTool("swap") && !state.answered && state.activeKind !== "review";
}

function updateTools() {
  if (state.boss) {
    els.hintBtn.disabled = true;
    els.discardBtn.disabled = true;
    els.swapBtn.disabled = true;
    updateInventoryLabels();
    return;
  }
  els.hintBtn.disabled = !hasTool("hint") || state.hintUsed || state.answered;
  els.discardBtn.disabled = !hasTool("discard") || state.discardUsed || state.answered ||
    (state.match && unmatchedIds().length < 2);
  els.discardBtn.title = state.match ? "Resuelve uno de los pares" : "Elimina una opción incorrecta";
  els.swapBtn.disabled = !canSwap();
  els.swapBtn.title = state.activeKind === "review" ? "No se puede cambiar un repaso" : "Cambiar la pregunta por otra";
  updateInventoryLabels();
}

function hasTool(tool) {
  return state.inventory[tool] > 0;
}

function updateStats() {
  els.score.textContent = state.score;
  els.mistakes.textContent = state.mistakes;
  els.solved.textContent = state.solved;
  els.streak.textContent = state.streak;
  updateInventoryLabels();
  updateShopButtons();
}

function updateInventoryLabels() {
  els.hintCount.textContent = state.inventory.hint;
  els.discardCount.textContent = state.inventory.discard;
  els.swapCount.textContent = state.inventory.swap;
}

// La tienda ocupa el panel central en lugar del caso.
function openShop() {
  hideTimer();
  state.activeQuestion = null;
  renderSuggestedEntry();
  updateShopButtons();
  els.gameScreen.classList.add("hidden");
  els.shopScreen.classList.remove("hidden");
  saveGame();
}

function continueFromShop() {
  els.shopScreen.classList.add("hidden");
  els.gameScreen.classList.remove("hidden");
  state.stepResults[state.stepIndex] = "visited";
  advanceStep();
}

function advanceStep() {
  state.boss = null;
  updateBookLock();
  renderBossReward();
  state.stepIndex += 1;
  renderPath({ animate: true });
  enterCurrentStep();
}

function enterCurrentStep() {
  const type = stepAt(state.stepIndex);
  if (type === "shop") {
    openShop();
  } else if (type === "boss") {
    startBoss();
  } else {
    nextCase(type);
  }
}

// Generador pseudoaleatorio con semilla (mulberry32). Su estado se guarda en el camino,
// asi el camino se puede seguir generando igual despues de recargar la pagina.
function nextRandom(path) {
  path.rngState = (path.rngState + 0x6d2b79f5) >>> 0;
  let t = path.rngState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function createPath(seed) {
  const path = { seed, rngState: seed >>> 0, steps: [], casesUntilShop: 0 };
  path.casesUntilShop = shopGap(path);
  return path;
}

function shopGap(path) {
  return PATH.minCasesBetweenShops +
    Math.floor(nextRandom(path) * (PATH.maxCasesBetweenShops - PATH.minCasesBetweenShops + 1));
}

// El camino es infinito: se genera a medida que se necesita.
function stepAt(index) {
  const path = state.path;
  while (path.steps.length <= index) {
    if (path.casesUntilShop === 0) {
      path.steps.push({ type: "shop" });
      path.casesUntilShop = shopGap(path);
    } else {
      path.steps.push({ type: path.steps.length === 0 ? "case" : pickChallenge(path) });
      path.casesUntilShop -= 1;
    }
    placeBosses();
  }
  return path.steps[index].type;
}

// Ubica un jefe despues de cada 10 eventos (sin contar tiendas ni otros jefes).
// Solo agrega jefes en pasos futuros; los ya jugados no se tocan.
function placeBosses() {
  const steps = state.path.steps;
  let count = 0;
  for (let index = 0; index < steps.length; index += 1) {
    const type = steps[index].type;
    if (type === "boss") {
      count = 0;
      continue;
    }
    if (type === "shop") continue;
    count += 1;
    if (count === BOSS.every) {
      count = 0;
      const next = steps[index + 1];
      if ((!next || next.type !== "boss") && index + 1 > state.stepIndex) {
        steps.splice(index + 1, 0, { type: "boss" });
      }
    }
  }
}

// Cuando se agrega un repaso cambia el conteo de eventos: los jefes futuros se vuelven a ubicar.
function replaceFutureBosses() {
  state.path.steps = state.path.steps.filter((step, index) => step.type !== "boss" || index <= state.stepIndex);
  placeBosses();
}

function currentStep() {
  stepAt(state.stepIndex);
  return state.path.steps[state.stepIndex];
}

function pickChallenge(path) {
  let roll = nextRandom(path);
  const weights = state.clockMode ? CLOCK_MODE.challengeWeights : PATH.challengeWeights;
  for (const [kind, weight] of Object.entries(weights)) {
    if (roll < weight) return kind;
    roll -= weight;
  }
  return "case";
}

function caseNumberAt(index) {
  let count = 0;
  for (let i = 0; i <= index; i += 1) {
    if (stepAt(i) === "case") count += 1;
  }
  return count;
}

// Muestra 7 pasos con el actual en el centro. Cada paso se posiciona con translateX(posicion * 100%),
// asi al avanzar los nodos existentes se deslizan a la izquierda y los nuevos entran por la derecha.
function renderPath({ animate }) {
  const track = els.progressTrack;
  if (!state.path) return;
  if (!animate) track.classList.add("no-anim");

  track.style.setProperty("--first-slot", Math.max(0, PATH.visibleBefore - state.stepIndex));
  track.style.setProperty("--current-slot", PATH.visibleBefore);
  const first = Math.max(0, state.stepIndex - PATH.visibleBefore - 1);
  const last = state.stepIndex + PATH.visibleAfter + 1;
  [...track.children].forEach((node) => {
    const index = Number(node.dataset.step);
    if (index < first || index > last) node.remove();
  });

  for (let index = first; index <= last; index += 1) {
    let node = track.querySelector(`[data-step="${index}"]`);
    if (!node) {
      node = document.createElement("li");
      node.dataset.step = index;
      node.className = "path-step";
      node.style.transform = `translateX(${(index - state.stepIndex + PATH.visibleBefore + 1) * 100}%)`;
      track.appendChild(node);
    }
    updatePathNode(node, index);
  }

  if (!animate) {
    void track.offsetWidth;
    track.classList.remove("no-anim");
  }
}

function updatePathNode(node, index) {
  const type = stepAt(index);
  const result = state.stepResults[index];
  const timing = index < state.stepIndex ? "past" : index === state.stepIndex ? "current" : "future";
  const info = STEP_INFO[type];
  const label = type === "case" ? `${info.label} ${caseNumberAt(index)}` : info.label;
  const badge = result === "correct" ? "check" : result === "wrong" ? "close" : "";

  node.className = `path-step ${timing} ${type} ${result || ""}`;
  node.style.transform = `translateX(${(index - state.stepIndex + PATH.visibleBefore) * 100}%)`;
  node.setAttribute("aria-label", `${label}${timing === "current" ? " (actual)" : ""}${result === "correct" ? ": resuelto" : result === "wrong" ? ": error" : ""}`);
  node.innerHTML = `
    <span class="path-icon">
      <span class="material-symbols-rounded">${info.icon}</span>
      ${badge ? `<span class="path-badge material-symbols-rounded">${badge}</span>` : ""}
    </span>
    <span class="path-label">${label}</span>
  `;
}

function buyTool(tool) {
  if (state.score < COSTS[tool]) return;
  state.score -= COSTS[tool];
  state.inventory[tool] += 1;
  updateStats();
  saveGame();
}

// Borrar un error no se guarda en el inventario: se aplica en el momento.
function buyEraseMistake() {
  if (state.score < COSTS.erase || state.mistakes === 0) return;
  state.score -= COSTS.erase;
  state.mistakes -= 1;
  updateStats();
  saveGame();
}

function updateShopButtons() {
  if (!els.buyHintBtn) return;
  els.buyHintBtn.disabled = state.score < COSTS.hint;
  els.buyDiscardBtn.disabled = state.score < COSTS.discard;
  els.buySwapBtn.disabled = state.score < COSTS.swap;
  els.buyEraseBtn.disabled = state.score < COSTS.erase || state.mistakes === 0;
  els.buyEraseBtn.title = state.mistakes === 0 ? "No tenés errores para borrar" : "";
  els.shopMistakes.textContent = state.mistakes;
  els.shopPoints.textContent = state.score;
  els.shopHintOwned.textContent = state.inventory.hint;
  els.shopDiscardOwned.textContent = state.inventory.discard;
  els.shopSwapOwned.textContent = state.inventory.swap;
}

function gameOver() {
  hideTimer();
  state.gameOver = true;
  saveGame();
  els.finalStats.textContent = `Resolviste ${state.solved} casos y terminaste con ${state.score} puntos. Tu mejor racha fue de ${state.bestStreak} aciertos seguidos.`;
  els.gameOverModal.classList.remove("hidden");
}

// ---------- Guardado en localStorage ----------

function saveGame() {
  if (!state.path) return;
  writeStorage(STORAGE.game, {
    version: 1,
    playerTitle: state.playerTitle,
    playerName: state.playerName,
    clockMode: state.clockMode,
    enabledUnits: state.enabledUnits,
    score: state.score,
    mistakes: state.mistakes,
    solved: state.solved,
    streak: state.streak,
    bestStreak: state.bestStreak,
    inventory: state.inventory,
    gameOver: state.gameOver,
    path: state.path,
    stepIndex: state.stepIndex,
    stepResults: state.stepResults,
    correctIds: state.correctIds,
    recentIds: state.recentIds,
    stepLog: state.stepLog,
    boss: state.boss,
    current: state.activeQuestion
      ? {
          kind: state.activeKind,
          questionId: state.activeQuestion.id,
          options: state.activeOptions,
          answered: state.answered,
          chosenIndex: state.chosenIndex,
          answerCorrect: state.answerCorrect,
          answerNote: state.answerNote,
          timerDeadline: state.timerDeadline,
          hintUsed: state.hintUsed,
          discardUsed: state.discardUsed,
          match: state.match
        }
      : null
  });
}

// Al cargar la pagina, retoma la partida guardada en el mismo punto en que quedo.
function restoreGame() {
  const saved = readStorage(STORAGE.game);
  if (!saved || saved.version !== 1 || !saved.path) return;

  Object.assign(state, {
    playerTitle: saved.playerTitle,
    playerName: saved.playerName,
    clockMode: Boolean(saved.clockMode),
    enabledUnits: saved.enabledUnits || null,
    matchGroups: null,
    score: saved.score,
    mistakes: saved.mistakes,
    solved: saved.solved,
    streak: saved.streak || 0,
    bestStreak: saved.bestStreak || 0,
    // Las partidas guardadas con la vieja "2da oportunidad" la convierten en "Cambiar".
    inventory: {
      hint: saved.inventory.hint || 0,
      discard: saved.inventory.discard || 0,
      swap: saved.inventory.swap ?? saved.inventory.shield ?? 0
    },
    gameOver: saved.gameOver,
    path: saved.path,
    stepIndex: saved.stepIndex,
    stepResults: saved.stepResults,
    correctIds: saved.correctIds || [],
    recentIds: saved.recentIds || [],
    stepLog: saved.stepLog || [],
    boss: saved.boss || null
  });
  placeBosses();
  els.titleSelect.value = state.playerTitle;
  els.playerName.value = state.playerName;
  els.clockModeCheck.checked = state.clockMode;
  syncUnitPicker(state.enabledUnits);
  showGameLayout();
  renderPath({ animate: false });

  const current = saved.current;
  const question = current && (current.kind === "match" && current.match
    ? buildMatchQuestion(current.match)
    : state.questionsById.get(current.questionId));
  if (stepAt(state.stepIndex) === "shop") {
    openShop();
  } else if (question) {
    Object.assign(state, {
      activeKind: current.kind,
      activeQuestion: question,
      activeOptions: current.options,
      answered: current.answered,
      chosenIndex: current.chosenIndex,
      answerCorrect: current.answerCorrect ?? saved.stepResults[saved.stepIndex] === "correct",
      answerNote: current.answerNote,
      timerDeadline: current.timerDeadline,
      hintUsed: current.hintUsed,
      discardUsed: current.discardUsed,
      match: current.match || null
    });
    showCase();
  } else {
    enterCurrentStep();
  }

  updateStats();
  if (state.gameOver) gameOver();
}

function openDeleteModal() {
  els.deleteMemoryCheck.checked = false;
  els.deleteAchievementsCheck.checked = false;
  els.deleteModal.classList.remove("hidden");
  els.cancelDeleteBtn.focus();
}

function closeDeleteModal() {
  els.deleteModal.classList.add("hidden");
}

function deleteGame() {
  removeStorage(STORAGE.game);
  if (els.deleteMemoryCheck.checked) {
    state.memory = {};
    removeStorage(STORAGE.memory);
  }
  if (els.deleteAchievementsCheck.checked) {
    state.achievements = {};
    removeStorage(STORAGE.achievements);
    renderAchievements();
  }
  hideTimer();
  Object.assign(state, {
    score: 0,
    mistakes: 0,
    solved: 0,
    streak: 0,
    bestStreak: 0,
    inventory: { hint: 0, discard: 0, swap: 0 },
    gameOver: false,
    path: null,
    stepIndex: 0,
    stepResults: [],
    correctIds: [],
    recentIds: [],
    stepLog: [],
    boss: null,
    activeQuestion: null,
    activeOptions: [],
    answered: false
  });
  closeDeleteModal();
  updateBookLock();
  els.gameOverModal.classList.add("hidden");
  els.gameScreen.classList.add("hidden");
  els.shopScreen.classList.add("hidden");
  els.progressEmpty.classList.remove("hidden");
  els.progressTrack.innerHTML = "";
  els.startScreen.classList.remove("hidden");
  els.playerDisplay.textContent = "Sin registrar";
  els.playerDisplay.title = "";
  els.deleteGameBtn.disabled = true;
  renderSuggestedEntry();
  updateStats();
}

// ---------- Jefe ----------

// Elige 3 eventos distintos entre los ultimos 10 jugados (sin tiendas ni jefes).
function pickBossItems() {
  const seen = new Set();
  const recent = [];
  for (let index = state.stepIndex - 1; index >= 0 && recent.length < BOSS.lookBack; index -= 1) {
    const type = state.path.steps[index] && state.path.steps[index].type;
    const log = state.stepLog[index];
    if (!log || type === "shop" || type === "boss") continue;
    const key = log.matchIds ? log.matchIds.join("+") : log.questionId;
    if (seen.has(key)) continue;
    seen.add(key);
    // Un repaso vuelve como caso o como definicion, segun su pregunta.
    let kind = log.kind;
    if (kind === "review") {
      const question = state.questionsById.get(log.questionId);
      const kinds = { definicion: "definition", error: "error" };
      kind = (question && kinds[question.tipo]) || "case";
    }
    recent.push({ kind, questionId: log.questionId, matchIds: log.matchIds });
  }
  const items = shuffle(recent).slice(0, BOSS.questions);
  // Partidas guardadas antes de que existiera el registro: se completan con casos nuevos.
  while (items.length < BOSS.questions) items.push({ kind: "case", questionId: pickQuestion("case").id, matchIds: null });
  return items;
}

function startBoss() {
  state.boss = { step: state.stepIndex, items: pickBossItems(), index: 0, results: [], reward: null };
  playBossQuestion();
}

function playBossQuestion() {
  const item = state.boss.items[state.boss.index];
  loadChallenge(item.kind, item);
  saveGame();
}

// Registra la respuesta de una pregunta del jefe. Al terminar la ultima se define el resultado del paso
// y, si se acertaron todas, se entrega una herramienta al azar.
function recordBossAnswer(correct) {
  const boss = state.boss;
  boss.results[boss.index] = correct;
  if (boss.index < boss.items.length - 1) return;
  const won = boss.results.every(Boolean);
  state.stepResults[state.stepIndex] = won ? "correct" : "wrong";
  if (won) {
    boss.reward = pickRandom(BOSS.rewards);
    state.inventory[boss.reward] += 1;
    addAchievementProgress({ "boss:won": 1 });
  }
}

// Muestra la recompensa del jefe en su propio recuadro, debajo del «Por qué».
// En el modo reloj tambien avisa como queda el reloj de los eventos.
function renderBossReward() {
  const boss = state.boss;
  const finished = Boolean(boss && state.answered && boss.results.length === boss.items.length);
  const reward = finished && boss.reward;
  const parts = [];
  if (reward) {
    // El icono de la herramienta va entre la cantidad y el nombre, del mismo color que el texto.
    parts.push(`¡Venciste al jefe! Ganaste 1 <span class="material-symbols-rounded reward-tool-icon" aria-hidden="true">${TOOL_ICONS[reward]}</span> ${TOOL_NAMES[reward]}.`);
  }
  if (finished && state.clockMode) parts.push(clockModeNotice());
  els.bossRewardBox.classList.toggle("hidden", !parts.length);
  if (parts.length) els.bossRewardText.innerHTML = parts.join(" ");
}

// El jefe actual ya cuenta como jugado para el reloj de los eventos que siguen.
function clockModeNotice() {
  const passed = bossesPassed() + 1;
  const now = clockModeSeconds(passed);
  const before = clockModeSeconds(passed - 1);
  if (!before) return `Desde ahora todos los eventos tienen reloj: ${now} segundos.`;
  if (now < before) return `El reloj de los eventos baja a ${now} segundos.`;
  return `El reloj de los eventos sigue en ${now} segundos, el mínimo.`;
}

// ---------- Unidades de la partida ----------
// Antes de empezar se eligen las unidades: los desafios salen solo de ellas. El libro sigue mostrando todas.
function inPlay(item) {
  return !state.enabledUnits || state.enabledUnits.includes(item.unidad);
}

function renderUnitPicker() {
  const saved = readStorage(STORAGE.units);
  els.unitChecks.innerHTML = state.reference.unidades.map((unit) => `
    <label class="unit-check">
      <input type="checkbox" value="${escapeHtml(unit.key)}" checked>
      <span>${escapeHtml(unit.titulo)}</span>
    </label>
  `).join("");
  els.unitChecks.addEventListener("change", updateUnitPicker);
  syncUnitPicker(Array.isArray(saved) ? saved : null);
}

// Marca las unidades indicadas (null = todas) y actualiza el boton de empezar.
function syncUnitPicker(keys) {
  els.unitChecks.querySelectorAll("input").forEach((input) => {
    input.checked = !keys || keys.includes(input.value);
  });
  updateUnitPicker();
}

function selectedUnits() {
  return [...els.unitChecks.querySelectorAll("input:checked")].map((input) => input.value);
}

function updateUnitPicker() {
  const none = selectedUnits().length === 0;
  els.startBtn.disabled = none;
  els.unitPickerHint.classList.toggle("hidden", !none);
}

// Expandir: el libro ocupa toda la pantalla y se ocultan el panel de juego y la fila de arriba (responsable y recorrido).
// Contraer vuelve a la vista normal.
function setBookExpanded(expanded) {
  els.bottomRow.classList.toggle("book-expanded", expanded);
  document.querySelector(".app-shell").classList.toggle("book-fullscreen", expanded);
  if (expanded) window.scrollTo(0, 0);
  els.bookExpandBtn.setAttribute("aria-pressed", String(expanded));
  const label = expanded ? "Contraer el libro" : "Expandir el libro";
  els.bookExpandBtn.setAttribute("aria-label", label);
  els.bookExpandBtn.title = label;
  els.bookExpandBtn.querySelector(".material-symbols-rounded").textContent = expanded ? "close_fullscreen" : "open_in_full";
}

// El libro de consulta no se puede usar mientras dura el jefe.
function updateBookLock() {
  const locked = Boolean(state.boss);
  if (locked) setBookExpanded(false);
  els.bookLock.classList.toggle("hidden", !locked);
  els.bookPanel.inert = locked;
}

function renderBossBar() {
  const boss = state.boss;
  updateBookLock();
  els.bossBar.classList.toggle("hidden", !boss);
  if (!boss) return;
  els.bossNodes.innerHTML = boss.items.map((item, index) => {
    const result = boss.results[index];
    const status = result === true ? "correct" : result === false ? "wrong" : index === boss.index ? "current" : "pending";
    const badge = result === true ? "check" : result === false ? "close" : "";
    const info = STEP_INFO[item.kind];
    return `
      <li class="boss-node ${status}" aria-label="Pregunta ${index + 1}: ${info.label}">
        <span class="boss-disc">
          <span class="material-symbols-rounded">${info.icon}</span>
          ${badge ? `<span class="path-badge material-symbols-rounded">${badge}</span>` : ""}
        </span>
        <span class="boss-label">${info.label}</span>
      </li>
    `;
  }).join("");
}

// ---------- Emparejar ----------
// Se muestran 3 terminos de un mismo grupo (por ejemplo, tres clases de dolo) y sus 3 definiciones.
// El jugador toca un termino y despues su definicion; cada par correcto queda del mismo color.
// Un par equivocado termina el paso como error.
const MATCH_SIZE = 3;
// Si emparejar va con reloj (jefe o modo reloj), cada par correcto suma tiempo.
const MATCH_BONUS_SECONDS = 5;

function definitionGroups() {
  if (!state.matchGroups) {
    const groups = new Map();
    state.definitions.filter(inPlay).forEach((item) => {
      const key = `${item.unidad}:${item.grupo}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    state.matchGroups = [...groups.values()].filter((group) => group.length >= MATCH_SIZE);
  }
  return state.matchGroups;
}

// Elige un grupo y 3 terminos, evitando los vistos hace poco cuando se puede.
function createMatch() {
  const recent = new Set(state.recentIds);
  const groups = definitionGroups();
  const fresh = groups.filter((group) => group.filter((item) => !recent.has(item.id)).length >= MATCH_SIZE);
  const group = pickRandom(fresh.length ? fresh : groups);
  const available = group.filter((item) => !recent.has(item.id));
  const ids = shuffle(available.length >= MATCH_SIZE ? available : group).slice(0, MATCH_SIZE).map((item) => item.id);
  return { ids, defOrder: shuffle([...ids]), pairs: [], failed: null };
}

function buildMatchQuestion(match) {
  const items = match.ids.map((id) => state.questionsById.get(id));
  const first = items[0];
  return {
    id: `match:${match.ids.join("+")}`,
    unidad: first.unidad,
    tipo: "emparejar",
    titulo: "Emparejar",
    situacion: "Elegí la definición del término resaltado. Cuando aciertes, se resalta el siguiente.",
    pregunta: "¿Qué significa cada término?",
    // La pista junta la pista de cada termino (un ejemplo o una pregunta que no repite palabras de la definicion).
    pista: items.map((item) => `${item.titulo}: ${item.pista.replace(/^Pensá en este ejemplo: /, "")}`).join(" · "),
    explicacion: `Ejemplos. ${items.map((item) => `${item.titulo}: ${item.ejemplo}`).join(" · ")}`,
    referencia: first.referencia
  };
}

function unmatchedIds() {
  const matched = new Set(state.match.pairs.map((pair) => pair.termId));
  return state.match.ids.filter((id) => !matched.has(id));
}

// Color de cada termino: el de su par si ya se unio; al terminar con error se revelan los pares que faltaban.
function matchColors() {
  const colors = new Map();
  state.match.pairs.forEach((pair, index) => colors.set(pair.termId, index));
  if (state.answered) {
    let next = state.match.pairs.length;
    state.match.ids.forEach((id) => {
      if (!colors.has(id)) colors.set(id, next++);
    });
  }
  return colors;
}

// Termino activo: siempre el primero que falta asignar. El jugador solo elige definiciones.
function activeMatchTerm() {
  return unmatchedIds()[0] || null;
}

function renderMatchBoard() {
  const match = state.match;
  const colors = matchColors();
  const paired = new Set(match.pairs.map((pair) => pair.termId));
  const failed = match.failed || {};
  const active = state.answered ? null : activeMatchTerm();
  const itemClass = (id, side) => {
    const classes = ["match-item", side];
    if (colors.has(id)) classes.push(`pair-${colors.get(id) % 3}`);
    if (state.answered && !paired.has(id)) classes.push("revealed");
    if (side === "term" && id === active) classes.push("selected", `pending-${match.pairs.length % 3}`);
    if (side === "term" && !state.answered && !paired.has(id) && id !== active) classes.push("upcoming");
    // Solo la definicion elegida por error lleva la marca; todos conservan el color de su par correcto.
    if (side === "def" && failed.defId === id) classes.push("wrong");
    return classes.join(" ");
  };

  const definitionsHtml = new Map(match.defOrder.map((id, index, ids) => [id,
    glossifyOptions(ids.map((defId) => state.questionsById.get(defId).respuestaCorrecta))[index]]));
  els.answers.innerHTML = `
    <div class="match-board">
      <div class="match-col match-terms" role="list" aria-label="Términos">
        ${match.ids.map((id) => `
          <div class="${itemClass(id, "term")}" role="listitem" ${id === active ? 'aria-current="true"' : ""}>
            ${glossify(state.questionsById.get(id).titulo)}</div>
        `).join("")}
      </div>
      <div class="match-col match-defs" role="group" aria-label="Definiciones">
        ${match.defOrder.map((id) => `
          <button type="button" class="${itemClass(id, "def")}" data-def="${id}" ${state.answered || paired.has(id) ? "disabled" : ""}>
            ${definitionsHtml.get(id)}</button>
        `).join("")}
      </div>
    </div>
  `;
  els.answers.querySelectorAll("[data-def]").forEach((button) => {
    button.addEventListener("click", () => chooseMatchDefinition(button.dataset.def));
  });
}

// Suma tiempo al reloj y muestra un "+5 s" que se desvanece sobre la barra.
function addMatchBonusTime() {
  state.timerDeadline += MATCH_BONUS_SECONDS * 1000;
  startTimer(state.timerDeadline);
  const bonus = document.createElement("span");
  bonus.className = "timer-plus";
  bonus.textContent = `+${MATCH_BONUS_SECONDS} s`;
  bonus.addEventListener("animationend", () => bonus.remove());
  els.timerBox.appendChild(bonus);
}

function chooseMatchDefinition(defId) {
  const match = state.match;
  const termId = activeMatchTerm();
  if (state.answered || !termId) return;
  if (termId === defId) {
    match.pairs.push({ termId, defId });
    renderMatchBoard();
    if (unmatchedIds().length === 0) {
      resolveAnswer(true, null);
      return;
    }
    if (state.timerDeadline) addMatchBonusTime();
    saveGame();
    return;
  }
  match.failed = { termId, defId };
  const term = state.questionsById.get(termId).titulo;
  resolveAnswer(false, null, `«${term}» no va con la definición que elegiste. Así quedan los pares correctos.`);
}

// Descartar en emparejar: resuelve uno de los pares que faltan.
function discardMatchPair() {
  const remaining = unmatchedIds();
  if (remaining.length < 2) return;
  const id = pickRandom(remaining);
  state.inventory.discard -= 1;
  state.discardUsed = true;
  state.match.pairs.push({ termId: id, defId: id });
  renderMatchBoard();
  updateStats();
  updateTools();
  saveGame();
}

// ---------- Logros ----------

function tierOf(achievement, count) {
  return achievement.tiers.filter((goal) => count >= goal).length;
}

// Suma progreso a los logros y avisa si alguno sube de nivel.
function addAchievementProgress(increments) {
  const leveled = [];
  for (const [key, amount] of Object.entries(increments)) {
    const achievement = ACHIEVEMENTS.find((item) => item.key === key);
    if (!achievement || !amount) continue;
    const before = state.achievements[key] || 0;
    const after = before + amount;
    state.achievements[key] = after;
    if (tierOf(achievement, after) > tierOf(achievement, before)) leveled.push(achievement);
  }
  writeStorage(STORAGE.achievements, state.achievements);
  renderAchievements(leveled.map((item) => item.key));
  if (leveled.length) showAchievementToast(leveled[leveled.length - 1]);
}

function renderAchievements(leveledKeys = []) {
  els.achievementsRow.innerHTML = ACHIEVEMENTS.map((achievement) => {
    const count = state.achievements[achievement.key] || 0;
    const tier = tierOf(achievement, count);
    // Progreso hacia el proximo nivel; en el nivel maximo se muestra contra la ultima meta.
    const goal = achievement.tiers[tier] || achievement.tiers[achievement.tiers.length - 1];
    const progress = `${count}/${goal}`;
    const label = `${achievement.name}, ${progress}. ${achievement.description}`;
    return `
      <div class="badge tier-${tier} ${leveledKeys.includes(achievement.key) ? "leveled" : ""}" role="listitem" tabindex="0" aria-label="${escapeHtml(label)}">
        <span class="badge-disc"><span class="material-symbols-rounded">${achievement.icon}</span></span>
        <div class="badge-tooltip" role="tooltip">
          <div class="badge-tooltip-head">
            <strong>${escapeHtml(achievement.name)}</strong>
            <span>${progress}</span>
          </div>
          <div class="mt-1">${escapeHtml(achievement.description)}</div>
        </div>
      </div>
    `;
  }).join("");
}

function showAchievementToast(achievement) {
  const tier = tierOf(achievement, state.achievements[achievement.key] || 0);
  els.achievementToast.innerHTML = `
    <span class="badge tier-${tier}"><span class="badge-disc"><span class="material-symbols-rounded">${achievement.icon}</span></span></span>
    <span>¡Logro desbloqueado! ${escapeHtml(achievement.name)} · nivel ${TIER_NAMES[tier - 1]}</span>
  `;
  els.achievementToast.classList.remove("hidden");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(hideAchievementToast, 8500);
}

function hideAchievementToast() {
  els.achievementToast.classList.add("hidden");
}

// La fila superior puede cambiar de alto (por ejemplo, si los logros ocupan dos lineas).
// Se publica su alto en --top-row-h para que el juego y el libro usen exactamente el espacio que queda.
function watchTopRowHeight() {
  const topRow = document.querySelector(".top-row");
  if (!topRow || !window.ResizeObserver) return;
  const update = () => document.documentElement.style.setProperty("--top-row-h", `${topRow.offsetHeight}px`);
  new ResizeObserver(update).observe(topRow);
  update();
}

// localStorage puede no estar disponible (modo privado, bloqueos): el juego sigue funcionando sin guardar.
function readStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`No se pudo guardar ${key}`, error);
  }
}

function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`No se pudo borrar ${key}`, error);
  }
}

function openBook(entryKey = null) {
  if (entryKey) {
    const entry = state.reference.entradas[entryKey];
    if (entry) {
      openBookSection(entry.unidad, entryKey);
      return;
    }
  }
  showBookIndex();
}

function showBookIndex() {
  state.selectedUnit = null;
  state.searchHitIndex = -1;
  els.bookTitle.textContent = "Indice";
  els.bookBackBtn.classList.add("hidden");
  els.bookUnits.innerHTML = "";
  state.reference.unidades.forEach((unit) => {
    const matchCount = countUnitMatches(unit.key);
    const button = document.createElement("button");
    button.className = `unit-btn ${matchCount ? "has-search-match" : ""}`;
    button.innerHTML = `${escapeHtml(unit.titulo)}${matchCount ? ` <span class="text-xs">(${matchCount})</span>` : ""}`;
    button.addEventListener("click", () => openBookSection(unit.key));
    els.bookUnits.appendChild(button);
  });
  els.bookEntries.innerHTML = "";
  updateSearchControls();
  renderSuggestedEntry();
}

function renderBook(highlightKey = null) {
  showBookIndex();
}

function openBookSection(unitKey, highlightKey = null) {
  const unit = findUnit(unitKey);
  state.selectedUnit = unitKey;
  state.searchHitIndex = -1;
  els.bookTitle.textContent = unit ? unit.titulo : "Seccion";
  els.bookBackBtn.classList.remove("hidden");
  els.bookUnits.innerHTML = "";
  els.suggestedEntryBtn.classList.add("hidden");

  const entries = Object.entries(state.reference.entradas)
    .filter(([, entry]) => entry.unidad === state.selectedUnit);
  // Glosario dentro del libro: cada palabra se marca una vez por entrada, salvo en la que ya la explica.
  // Sin foco de teclado, para no llenar el libro de paradas de Tab; se consulta con el mouse o tocando.
  const bookGloss = (key) => {
    const exclude = new Set(state.glossary.filter((item) => (item.definidoEn || []).includes(key)).map((item) => item.id));
    const seen = new Set();
    return (text) => glossify(text, { exclude, seen, focusable: false, render: highlightSearchText });
  };

  els.bookEntries.innerHTML = "";
  entries.forEach(([key, entry]) => {
    const gloss = bookGloss(key);
    const article = document.createElement("article");
    article.className = "book-entry";
    article.id = `entry-${key}`;
    article.innerHTML = `
      <div class="mb-2 flex flex-wrap items-center gap-2">
        <mark>${highlightSearchText(entry.categoria)}</mark>
        <h3 class="font-display text-xl font-black">${highlightSearchText(entry.titulo)}</h3>
      </div>
      ${asList(entry.intro).map((paragraph) => `<p class="book-intro">${gloss(paragraph)}</p>`).join("")}
      ${entry.figura ? renderFigure(entry.figura) : ""}
      <p class="book-section-label">Explicado de a uno</p>
      <ul class="book-notes ml-5 list-disc space-y-3 text-slate-700">
        ${entry.notas.map((note) => `<li>${renderNote(note, gloss)}</li>`).join("")}
      </ul>
      ${entry.pasos?.length ? `
        <p class="book-section-label">Cómo resolver un caso</p>
        <ol class="book-steps ml-5 list-decimal space-y-2 text-slate-700">
          ${entry.pasos.map((step) => `<li>${gloss(step)}</li>`).join("")}
        </ol>` : ""}
      ${entry.ejemplos?.length ? `
        <p class="book-section-label">Ejemplos</p>
        <ul class="book-examples list-disc space-y-1 text-slate-700">
          ${entry.ejemplos.map((example) => `<li>${gloss(example)}</li>`).join("")}
        </ul>` : ""}
      ${entry.ojo ? `<p class="book-warning"><strong>No confundir:</strong> ${gloss(entry.ojo)}</p>` : ""}
    `;
    if (key === highlightKey) article.classList.add("ring-2", "ring-sky-300");
    els.bookEntries.appendChild(article);
  });

  if (highlightKey) {
    document.getElementById(`entry-${highlightKey}`)?.scrollIntoView({ block: "center" });
  }
  updateSearchControls();
  markCurrentSearchHit();
}

// ---------- Esquemas del libro ----------
// Cada seccion puede tener un esquema de la clase redibujado. El color siempre significa algo (orientacion,
// enfoque, resultado, intensidad) y la leyenda lo dice con palabras; el texto queda escrito, asi se lee y se busca.
const FIGURES = {
  cuadrantes: renderQuadrants,
  flujo: renderFlow,
  capas: renderLayers,
  antesdespues: renderBeforeAfter,
  grupos: renderGroups
};

function renderFigure(figure) {
  const render = FIGURES[figure.tipo];
  if (!render) return "";
  const t = highlightSearchText;
  const legend = (figure.leyenda || []).map((item) => `<span class="fig-key ${item.clase}">${t(item.texto)}</span>`).join("");
  return `
    <figure class="book-figure fig-${figure.tipo}">
      <figcaption class="fig-title">${t(figure.titulo)}</figcaption>
      ${render(figure, t)}
      ${figure.nota ? `<p class="fig-note">${t(figure.nota)}</p>` : ""}
      ${legend ? `<p class="fig-legend">${legend}</p>` : ""}
    </figure>`;
}

const figureList = (items, t) => `<ul>${items.map((item) => `<li>${t(item)}</li>`).join("")}</ul>`;

// Dos ejes y cuatro cuadrantes: el tono marca la columna y la intensidad, la fila.
function renderQuadrants(figure, t) {
  const cell = (fila, columna) => {
    const quadrant = figure.cuadrantes.find((item) => item.fila === fila && item.columna === columna);
    return `<div class="fig-quad q-${fila} q-${columna}"><strong>${t(quadrant.titulo)}</strong>${figureList(quadrant.items, t)}</div>`;
  };
  return `
    <div class="fig-quadrants">
      <span class="fig-axis">${t(figure.ejes.arriba)} ▲</span>
      <div class="fig-quad-grid">
        <span class="fig-col q-izquierda">${t(figure.ejes.izquierda)}</span><span class="fig-col q-derecha">${t(figure.ejes.derecha)}</span>
        ${cell("arriba", "izquierda")}${cell("arriba", "derecha")}${cell("abajo", "izquierda")}${cell("abajo", "derecha")}
      </div>
      <span class="fig-axis">${t(figure.ejes.abajo)} ▼</span>
    </div>`;
}

// Etapas en vertical, como un camino: cada paso va debajo del anterior y el resultado de una etapa cae directo en
// el primer paso de la siguiente (flecha verde). Si una etapa se abre en dos caminos (ramas), ese paso ocupa todo el
// ancho y de el bajan los dos caminos, uno al lado del otro; el de salida termina ahi. El marco punteado es el entorno.
function renderFlow(figure, t) {
  const main = [];
  const side = [];
  const wide = new Set();
  const box = (text, className) => `<span class="${className}">${t(text)}</span>`;
  const arrow = (char, className = "") => `<span class="fig-varrow ${className}" aria-hidden="true">${char}</span>`;
  figure.tramos.forEach((tramo, row) => {
    const mainBranch = tramo.ramas ? tramo.ramas.find((rama) => rama.tipo !== "salida") : tramo;
    const exitBranch = tramo.ramas ? tramo.ramas.find((rama) => rama.tipo === "salida") : null;
    const steps = tramo.ramas ? [tramo.etapas[0], ...mainBranch.etapas] : tramo.etapas;
    if (row) main.push(arrow("↓", "from-result"));
    steps.forEach((step, index) => {
      if (index) main.push(arrow(mainBranch.idaYVuelta === index ? "↕" : "↓"));
      main.push(box(step, "fig-step"));
      if (index === 0 && exitBranch) {
        wide.add(main.length - 1);
        const fork = main.length;
        exitBranch.etapas.forEach((exitStep, exitIndex) => {
          side[fork + exitIndex * 2] = arrow("↓", "to-exit");
          side[fork + exitIndex * 2 + 1] = box(exitStep, "fig-step is-exit-step");
        });
      }
    });
    if (mainBranch.resultado) {
      main.push(arrow("↓"));
      main.push(box(mainBranch.resultado, "fig-result"));
    }
  });
  const hasSide = side.some(Boolean);
  const cells = main.map((cell, index) => wide.has(index)
    ? `<div class="fig-vcell is-wide">${cell}</div>`
    : `<div class="fig-vcell">${cell}</div>${hasSide ? `<div class="fig-vcell is-side">${side[index] || ""}</div>` : ""}`).join("");
  const flow = `<div class="fig-vflow${hasSide ? " has-side" : ""}">${cells}</div>`;
  return figure.entorno
    ? `<div class="fig-entorno"><span class="fig-entorno-label">${t(figure.entorno)}</span>${flow}</div>`
    : flow;
}

// Iceberg: arriba lo que se ve (claro), abajo lo que no se ve (oscuro).
function renderLayers(figure, t) {
  const layer = (data, className) => `<div class="fig-layer ${className}"><strong>${t(data.titulo)}</strong>${figureList(data.items, t)}</div>`;
  return `<div class="fig-iceberg">${layer(figure.visible, "is-visible")}<div class="fig-water" aria-hidden="true"></div>${layer(figure.oculto, "is-hidden")}</div>`;
}

// Antes y despues: la piramide con un jefe que controla y el equipo en ronda con un facilitador.
function renderBeforeAfter(figure, t) {
  const dot = (className = "") => `<span class="fig-dot ${className}"></span>`;
  const pyramid = `<div class="fig-pyramid" aria-hidden="true">${dot("is-boss")}<div>${dot()}${dot()}${dot()}</div><div>${dot()}${dot()}${dot()}${dot()}</div></div>`;
  const members = Array.from({ length: 7 }, (_, index) => `<span class="fig-dot is-member" style="--a:${Math.round(index * (360 / 7))}deg"></span>`).join("");
  const ring = `<div class="fig-ring" aria-hidden="true">${members}${dot("is-facilitator")}</div>`;
  const side = (data, drawing, className) => `
    <div class="fig-side ${className}">
      <strong>${t(data.titulo)}</strong>${drawing}
      <p>${t(data.texto)}</p>
      <span class="fig-role">${t(data.rol)}</span>
    </div>`;
  return `<div class="fig-before-after">${side(figure.antes, pyramid, "is-before")}<span class="fig-arrow" aria-hidden="true">→</span>${side(figure.despues, ring, "is-after")}</div>`;
}

// Como en el grafico de McKinsey: el centro (quienes somos) y un anillo con los elementos de las otras dimensiones,
// intercalados. El color de cada circulo dice a que dimension pertenece, y la lista de al lado explica cada una.
function renderGroups(figure, t) {
  const ring = [];
  const longest = Math.max(...figure.grupos.map((group) => group.items.length));
  for (let index = 0; index < longest; index += 1) {
    figure.grupos.forEach((group, groupIndex) => {
      if (group.items[index]) ring.push({ texto: group.items[index], dim: groupIndex + 1 });
    });
  }
  const step = 360 / ring.length;
  const nodes = ring.map((item, index) => `<span class="fig-node dim-${item.dim}" style="--a:${index * step}deg">${t(item.texto)}</span>`).join("");
  const core = figure.centro.items.map((item, index) => `<span class="fig-core core-${index}">${t(item)}</span>`).join("");
  const dims = [figure.centro, ...figure.grupos].map((dim, index) => `
    <li class="dim-${index}"><strong>${t(dim.titulo)}</strong><p>${t(dim.texto)}</p><small>${t(`Elementos: ${dim.items.join(", ")}`)}</small></li>`).join("");
  return `
    <div class="fig-groups">
      <div class="fig-ring6" aria-hidden="true">${core}${nodes}</div>
      <ul class="fig-dims">${dims}</ul>
    </div>`;
}

function asList(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

// Pone en negrita el rotulo de una nota ("Rotulo: explicacion"). Usa los primeros dos puntos que esten
// fuera de parentesis y comillas, para no cortar rotulos como "Primera generacion (referencia: 1853)".
// El rotulo no se marca con el glosario: es el termino que la nota explica.
function renderNote(note, gloss = highlightSearchText) {
  const split = labelEnd(note);
  if (split === -1) return gloss(note);
  return `<strong>${highlightSearchText(note.slice(0, split))}:</strong> ${gloss(note.slice(split + 2))}`;
}

function labelEnd(note) {
  const maxLabelLength = 120;
  let depth = 0;
  for (let index = 0; index < Math.min(note.length - 1, maxLabelLength + 1); index += 1) {
    const char = note[index];
    if (char === "(" || char === "«") depth += 1;
    else if ((char === ")" || char === "»") && depth > 0) depth -= 1;
    else if (char === ":" && depth === 0 && note[index + 1] === " ") return index >= 2 ? index : -1;
  }
  return -1;
}

function renderSuggestedEntry() {
  if (state.selectedUnit || !state.activeQuestion?.referencia?.entradaLibro) {
    els.suggestedEntryBtn.classList.add("hidden");
    return;
  }
  els.suggestedEntryBtn.textContent = `Entrada sugerida del libro: ${state.activeQuestion.referencia.titulo}`;
  els.suggestedEntryBtn.classList.remove("hidden");
}

function updateBookSearch() {
  state.bookSearchTerm = els.bookSearch.value.trim();
  state.searchHitIndex = -1;
  if (state.selectedUnit) {
    openBookSection(state.selectedUnit);
  } else {
    showBookIndex();
  }
}

function updateSearchControls() {
  const hits = getVisibleSearchHits();
  const total = state.selectedUnit ? hits.length : countAllUnitMatches();
  els.bookSearchCount.textContent = state.bookSearchTerm ? `${total} resultado${total === 1 ? "" : "s"}` : "0 resultados";
  els.bookPrevMatchBtn.disabled = hits.length === 0;
  els.bookNextMatchBtn.disabled = hits.length === 0;
}

function goToSearchMatch(step) {
  const hits = getVisibleSearchHits();
  if (!hits.length) return;
  if (state.searchHitIndex === -1) {
    state.searchHitIndex = step > 0 ? 0 : hits.length - 1;
  } else {
    state.searchHitIndex = (state.searchHitIndex + step + hits.length) % hits.length;
  }
  markCurrentSearchHit();
  hits[state.searchHitIndex].scrollIntoView({ block: "center", behavior: "smooth" });
}

function markCurrentSearchHit() {
  const hits = getVisibleSearchHits();
  hits.forEach((hit) => hit.classList.remove("current"));
  if (!hits.length || state.searchHitIndex === -1) return;
  state.searchHitIndex = Math.min(state.searchHitIndex, hits.length - 1);
  hits[state.searchHitIndex].classList.add("current");
}

function getVisibleSearchHits() {
  return [...els.bookEntries.querySelectorAll(".book-search-hit")];
}

function countAllUnitMatches() {
  return state.reference.unidades.reduce((total, unit) => total + countUnitMatches(unit.key), 0);
}

function countUnitMatches(unitKey) {
  const term = state.bookSearchTerm.toLowerCase();
  if (!term) return 0;
  return Object.values(state.reference.entradas)
    .filter((entry) => entry.unidad === unitKey)
    .reduce((total, entry) => total + countEntryMatches(entry, term), 0);
}

function countEntryMatches(entry, term) {
  return entryTexts(entry)
    .reduce((total, value) => total + countTextMatches(value, term), 0);
}

function entryTexts(entry) {
  return [entry.categoria, entry.titulo, ...asList(entry.intro), ...entry.notas, ...asList(entry.pasos), ...asList(entry.ejemplos), entry.ojo]
    .filter(Boolean);
}

function countTextMatches(value, term) {
  return (escapeHtml(value).match(searchPattern(term)) || []).length;
}

function highlightSearchText(value) {
  const text = escapeHtml(value);
  if (!state.bookSearchTerm) return text;
  return text.replace(searchPattern(state.bookSearchTerm), (match) => `<span class="book-search-hit">${match}</span>`);
}

// Ignora tildes: "articulo" encuentra "artículo" y viceversa.
const ACCENT_CLASSES = { a: "[aáàäâ]", e: "[eéèëê]", i: "[iíìïî]", o: "[oóòöô]", u: "[uúùüû]", n: "[nñ]" };

function searchPattern(term) {
  const source = [...escapeHtml(term).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()]
    .map((char) => ACCENT_CLASSES[char] || escapeRegExp(char))
    .join("");
  return new RegExp(source, "gi");
}

function readEmbeddedJson(id, fallback) {
  const node = document.getElementById(id);
  if (!node) return fallback;
  try {
    return JSON.parse(node.textContent);
  } catch (error) {
    console.error(`No se pudo leer ${id}`, error);
    return fallback;
  }
}

function findUnit(key) {
  return state.reference.unidades.find((unit) => unit.key === key);
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  return items
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------- Glosario ----------
// Marca la primera aparicion de cada palabra del glosario. "only" limita las palabras (para las opciones) y
// "focusable" en false evita meter elementos enfocables dentro de un boton.
// "seen" junta las palabras ya marcadas, para marcar cada una una sola vez en varios textos (una seccion del libro).
function glossify(text, { only = null, exclude = null, seen = null, focusable = true, render = escapeHtml } = {}) {
  const ranges = [];
  for (const entry of state.glossary) {
    if (only && !only.has(entry.id)) continue;
    if (exclude && exclude.has(entry.id)) continue;
    if (seen && seen.has(entry.id)) continue;
    const match = text.matchAll(entry.regex).next().value;
    if (!match) continue;
    const start = match.index;
    const end = start + match[0].length;
    if (ranges.some((range) => start < range.end && end > range.start)) continue;
    ranges.push({ start, end, entry });
  }
  if (seen) ranges.forEach((range) => seen.add(range.entry.id));
  ranges.sort((a, b) => a.start - b.start);
  let html = "";
  let position = 0;
  for (const range of ranges) {
    html += render(text.slice(position, range.start));
    html += `<span class="gloss"${focusable ? ' tabindex="0"' : ""} data-gloss="${range.entry.id}">${render(text.slice(range.start, range.end))}</span>`;
    position = range.end;
  }
  return html + render(text.slice(position));
}

// En las opciones solo se marcan las palabras que aparecen en al menos dos de las que se ven: si una palabra
// estuviera marcada en una sola opcion, el resaltado la delataria.
function glossifyOptions(texts) {
  const only = new Set(state.glossary
    .filter((entry) => texts.filter((text) => new RegExp(entry.source, "iu").test(text)).length >= 2)
    .map((entry) => entry.id));
  return texts.map((text) => glossify(text, { only, focusable: false }));
}

// Un solo tooltip para todo el juego: aparece al pasar el mouse, al enfocar con el teclado o al tocar la palabra.
function bindGlossaryTooltip() {
  const glossOf = (node) => (node instanceof Element ? node.closest(".gloss") : null);
  document.addEventListener("pointerover", (event) => {
    const gloss = glossOf(event.target);
    if (gloss) showGlossTip(gloss);
  });
  document.addEventListener("pointerout", (event) => {
    // En pantallas tactiles el tooltip queda abierto hasta tocar en otro lado.
    if (event.pointerType !== "touch" && glossOf(event.target) && !glossOf(event.relatedTarget)) hideGlossTip();
  });
  document.addEventListener("focusin", (event) => {
    const gloss = glossOf(event.target);
    if (gloss) showGlossTip(gloss);
  });
  document.addEventListener("focusout", (event) => {
    if (glossOf(event.target)) hideGlossTip();
  });
  // En captura, para que tocar una palabra marcada dentro de una opcion abra el tooltip y no elija esa opcion.
  document.addEventListener("click", (event) => {
    const gloss = glossOf(event.target);
    if (!gloss) {
      hideGlossTip();
      return;
    }
    if (gloss.closest("button, [role='button']")) {
      event.preventDefault();
      event.stopPropagation();
    }
    showGlossTip(gloss);
  }, true);
  window.addEventListener("scroll", hideGlossTip, true);
}

function showGlossTip(gloss) {
  const entry = state.glossaryById.get(gloss.dataset.gloss);
  if (!entry) return;
  const tip = els.glossTip;
  tip.innerHTML = `<strong>${escapeHtml(entry.termino)}</strong>${escapeHtml(entry.definicion)}`;
  tip.classList.remove("hidden");
  document.querySelectorAll(".gloss[aria-describedby]").forEach((node) => node.removeAttribute("aria-describedby"));
  gloss.setAttribute("aria-describedby", "glossTip");
  // Arriba de la palabra si entra; si no, abajo. Siempre dentro de la pantalla.
  const rect = gloss.getBoundingClientRect();
  const margin = 8;
  let top = rect.top - tip.offsetHeight - margin;
  if (top < margin) top = rect.bottom + margin;
  const left = Math.min(Math.max(margin, rect.left + rect.width / 2 - tip.offsetWidth / 2), window.innerWidth - tip.offsetWidth - margin);
  tip.style.top = `${top}px`;
  tip.style.left = `${left}px`;
}

function hideGlossTip() {
  els.glossTip.classList.add("hidden");
  document.querySelectorAll(".gloss[aria-describedby]").forEach((node) => node.removeAttribute("aria-describedby"));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
