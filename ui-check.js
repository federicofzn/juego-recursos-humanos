const assert = require("assert");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const js = fs.readFileSync(path.join(__dirname, "game.js"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "styles.css"), "utf8");

assert(html.includes("Responsable de RRHH") && !html.includes("Profesional a cargo"), "el panel superior debe mostrar al responsable de RRHH");
assert(html.includes("Comenzar el dia"), "la pantalla inicial debe decir Comenzar el dia");
assert(html.includes('id="playerName"'), "el inicio debe pedir nombre del jugador");
assert(html.includes('id="titleSelect"'), "el inicio debe permitir elegir Dr o Dra");
assert(!html.includes('class="avatar"'), "no debe quedar avatar del personaje");
assert(!html.includes("<p>Unidad</p>"), "no debe quedar recuadro de unidad");
assert(html.includes('id="caseUnitLabel"'), "la unidad debe mostrarse en el encabezado de situacion");
assert(html.includes('id="shopScreen"') && !html.includes('id="shopModal"'), "la tienda debe mostrarse en el panel central, no en un modal");
assert(html.includes('id="hintCount"'), "el boton de pista debe mostrar cantidad disponible");
assert(html.includes('id="discardCount"'), "el boton de descartar debe mostrar cantidad disponible");
assert(html.includes('id="swapCount"') && !html.includes("2da oportunidad"), "el boton de cambiar debe mostrar cantidad disponible");
assert(js.includes("function useSwap") && js.includes("nextCase(state.activeKind)"), "cambiar debe reemplazar la pregunta por otra del mismo tipo");
assert(!html.includes('id="bookBtn"'), "no debe existir boton de libro si el panel ya esta visible");
assert(!html.includes('id="bookDrawer"'), "el libro no debe abrirse en modal/drawer");
assert(html.includes('id="bookTitle"'), "el libro debe tener titulo dinamico de indice/seccion");
assert(html.includes('id="bookBackBtn"'), "el libro debe permitir volver al indice desde una seccion");
assert(html.includes('id="bookSearch"'), "el libro debe tener buscador de palabras");
assert(html.includes('id="bookPrevMatchBtn"'), "el libro debe navegar a la ocurrencia anterior");
assert(html.includes('id="bookNextMatchBtn"'), "el libro debe navegar a la ocurrencia siguiente");
assert(html.includes('id="bookUnits"'), "el panel derecho debe permitir navegar unidades del libro");
assert(html.includes('id="bookEntries"'), "el panel derecho debe mostrar entradas del libro");
assert(!js.includes("Elegí una unidad del índice para abrir sus notas"), "el indice no debe mostrar texto instructivo innecesario");
assert(html.includes('id="nextBtn"'), "debe existir boton siguiente despues de responder");
assert(!html.includes('id="feedbackBox"'), "no debe quedar texto de feedback correcto/incorrecto");

assert(html.includes('id="caseStory"'), "la situacion del caso debe mostrarse aparte de la pregunta");
assert(html.includes('id="caseTypeLabel"'), "el caso debe indicar su tipo");
assert(html.includes('id="explanationBox"'), "debe existir una explicacion despues de responder");
assert(js.includes("showExplanation"), "la explicacion debe mostrarse al responder");
assert(js.includes("entry.ejemplos") && js.includes("entry.ojo") && js.includes("entry.intro"), "el libro debe mostrar intro, ejemplos y advertencias");
assert(js.includes("searchPattern"), "el buscador debe ignorar tildes");

assert(js.includes(`state.activeKind === "timed" || state.boss ? TIMED.points : 1`) && js.includes("state.solved += 1"), "cada acierto suma 1 punto (2 en contrarreloj y en el jefe) y cuenta como 1 caso resuelto");
assert(js.includes("inventory"), "los consumibles deben manejarse como inventario");
assert(html.includes('id="progressBar"') && html.includes('id="progressTrack"'), "debe existir la barra de progreso del camino");
assert(js.includes("nextRandom") && js.includes("createPath"), "el camino debe generarse con una semilla aleatoria");
assert(js.includes("visibleBefore: 1") && js.includes("visibleAfter: 5"), "la barra debe mostrar 1 paso anterior, el actual y 5 siguientes");
assert(js.includes("renderPath") && js.includes("advanceStep"), "la barra debe avanzar con cada paso");
assert(css.includes("calc(100% / 7)"), "la barra debe mostrar 7 casilleros");
assert(js.includes("buyTool"), "la tienda debe permitir comprar consumibles");
assert(!js.includes("bookDrawer"), "la logica no debe depender de un modal/drawer del libro");
assert(!js.includes("bookBtn"), "la logica no debe depender de un boton del libro");
assert(js.includes("showBookIndex"), "el libro debe iniciar y volver al indice");
assert(js.includes("openBookSection"), "las unidades del indice deben abrir secciones");
assert(js.includes("state.selectedUnit"), "la sugerencia del libro debe depender de estar en el indice");
assert(js.includes("updateBookSearch"), "el buscador debe actualizar resultados");
assert(js.includes("highlightSearchText"), "las ocurrencias deben resaltarse dentro de una seccion");
assert(js.includes("goToSearchMatch"), "los botones deben navegar ocurrencias");
assert(!js.includes("state.selectedUnit = state.reference.unidades[0].key"), "el libro no debe abrir la primera unidad por defecto");
assert(js.includes("proceedAfterAnswer"), "siguiente debe controlar el avance manual");
assert(!js.includes("showFeedback"), "no debe mostrarse texto de correcto/incorrecto");
assert(!js.includes("setTimeout(() =>"), "no debe avanzar automaticamente a otro caso");

assert(css.includes(".book-sidebar"), "el panel del libro debe tener layout propio");
assert(css.includes("flex: 1"), "bookEntries debe ocupar el alto disponible del panel");
assert(!css.includes("max-height: 420px"), "bookEntries no debe tener alto fijo limitado");

console.log("ui economy checks ok");

// Contrarreloj y definiciones como pasos del camino.
assert(html.includes('id="timerBox"') && html.includes('id="timerFill"'), "el contrarreloj debe mostrar una barra de tiempo");
assert(html.includes('id="definitions-data"'), "las definiciones deben estar incrustadas en el HTML");
assert(js.includes("seconds: 60") && js.includes("points: 2"), "el contrarreloj debe durar 60 segundos y valer 2 puntos");
assert(js.includes("timeUp") && js.includes("resolveAnswer(false"), "al terminarse el tiempo debe contar como error");
assert(js.includes("timed:") && js.includes("definition:"), "el camino debe incluir contrarreloj y definicion");
console.log("timed and definition checks ok");

// Repaso espaciado, guardado y borrado de partida.
assert(js.includes("scheduleReview") && js.includes('review: { icon: "replay"'), "lo fallado debe volver como paso de repaso");
assert(js.includes("STORAGE.game") && js.includes("restoreGame") && js.includes("saveGame"), "la partida debe guardarse y restaurarse con localStorage");
assert(js.includes("STORAGE.memory") && js.includes("updateMemory"), "el historial de errores debe persistir entre partidas");
assert(html.includes('id="deleteGameBtn"') && html.includes('id="deleteModal"'), "debe existir el boton de borrar partida con confirmacion");
console.log("review and storage checks ok");
assert(js.includes("(seconds / 3) * 1000"), "el reloj debe avisar (barra roja) en el ultimo tercio: 20 s en el contrarreloj");
assert(js.includes("maxReadingChars: 260"), "el contrarreloj debe seguir usando solo los casos cortos");

// Limite de errores y logros.
assert(js.includes("const MAX_MISTAKES = 10") && !js.includes("mistakes >= 5"), "la partida debe terminar con 10 errores");
assert(html.includes("/10</strong>"), "el indicador de errores debe mostrar el maximo de 10");
assert(html.includes('id="achievementsRow"') && js.includes("ACHIEVEMENTS") && js.includes("STORAGE.achievements"), "debe existir la fila de logros persistentes");
assert(["unit:introduccion", "unit:estrategia_cultura", "unit:transformacion", "unit:clima_evp", "unit:contrato_trabajo", "kind:case", "kind:timed", "kind:definition"].every((key) => js.includes(key)), "debe haber logros por unidad y por tipo de desafio");
assert(css.includes(".badge.tier-5") && css.includes("@keyframes badge-shine"), "el nivel dorado debe tener destello");
assert(css.includes("var(--top-row-h"), "el alto del juego debe adaptarse a la fila superior");
console.log("achievements checks ok");
assert(!js.includes("shop:purchases") && !js.includes("score:points"), "no debe haber logros de tienda ni de puntos");
assert(js.includes("badge-tooltip-head") && !js.includes("Sin desbloquear") && !js.includes("badge-progress"), "el tooltip del logro solo muestra titulo, progreso y descripcion");
assert(html.includes('id="buyEraseBtn"') && js.includes("erase: 10") && js.includes("state.mistakes -= 1"), "la tienda debe permitir borrar un error por 10 puntos");
assert(js.includes("gap: [3, 6]") && js.includes("lastPendingReviewIndex() + gap"), "cada repaso nuevo se ubica 3 a 6 pasos despues del ultimo repaso pendiente");

// Emparejar
assert(js.includes('match: { icon: "link", label: "Emparejar" }') && js.includes("match: 0.175"), "emparejar debe ser un tipo de paso del camino");
assert(js.includes("match-terms") && css.includes(".match-terms") && js.includes("MATCH_SIZE = 3") && js.includes("renderMatchBoard") && js.includes("chooseMatchDefinition"), "emparejar debe mostrar 3 terminos y 3 definiciones");
assert(css.includes(".match-item.pair-0") && css.includes(".match-item.wrong"), "los pares deben resaltarse con el mismo color y el error en rojo");
assert(js.includes('"kind:match"'), "debe existir el logro de emparejar");
assert(js.includes("const MATCH_BONUS_SECONDS = 5") && js.includes("if (state.timerDeadline) addMatchBonusTime();"), "cada par correcto de emparejar con reloj suma 5 segundos");
console.log("match checks ok");
assert(js.includes("function activeMatchTerm") && !js.includes("selectMatchTerm") && css.includes(".match-item.upcoming"), "en emparejar solo esta activo el primer termino sin asignar");
assert(js.includes("entry.figura ? renderFigure(entry.figura)") && css.includes(".book-figure") && css.includes(".q-arriba.q-izquierda") && css.includes(".fig-legend"), "el libro debe dibujar los esquemas con su leyenda de colores");

// Jefe
assert(js.includes('boss: { icon: "swords", label: "Jefe" }') && js.includes("every: 10") && js.includes("questions: 3"), "debe existir el jefe cada 10 eventos con 3 preguntas");
assert(js.includes("function placeBosses") && js.includes("replaceFutureBosses()"), "los jefes se reubican cuando se agregan repasos");
assert(js.includes('rewards: ["hint", "discard", "swap"]') && js.includes("recordBossAnswer"), "vencer al jefe da una herramienta al azar");
assert(html.includes('id="bossBar"') && !html.includes("Sin herramientas"), "el jefe muestra su barra de preguntas (las herramientas simplemente se ocultan)");
assert(js.includes("timerSeconds: 30") && js.includes("if (state.boss) return BOSS.timerSeconds;"), "todas las preguntas del jefe van con reloj de 30 segundos");
assert(html.includes('id="clockModeCheck"') && !/id="clockModeCheck"[^>]*checked/.test(html), "el modo reloj se elige al crear la partida y no viene activado");
const clockModeConfig = js.slice(js.indexOf("const CLOCK_MODE"), js.indexOf("const TOOL_NAMES"));
assert(clockModeConfig.includes("startSeconds: 60") && clockModeConfig.includes("stepSeconds: 3") && clockModeConfig.includes("minSeconds: 30") && !clockModeConfig.includes("timed"), "el modo reloj no tiene contrarreloj y su reloj va de 60 a 30 s, 3 s menos por jefe");
console.log("boss checks ok");

// Encontrá el error
assert(html.includes('id="errors-data"') && js.includes('readEmbeddedJson("errors-data"'), "los textos de encontrar el error deben estar incrustados en el HTML");
assert(js.includes('error: { icon: "find_in_page", label: "Error" }') && js.includes("error: 0.175") && js.includes("error: 0.25"), "encontrar el error debe ser un paso del camino en los dos modos");
assert(js.includes("function renderErrorText") && js.includes("function revealErrorText") && css.includes(".error-sentence.found"), "el texto se muestra por oraciones y al responder se marca la incorrecta");
assert(js.includes('"kind:error"'), "debe existir el logro de encontrar el error");
console.log("error checks ok");

// Glosario
assert(html.includes('id="glossary-data"') && html.includes('id="glossTip"'), "el glosario y su tooltip deben estar en el HTML");
assert(js.includes("function glossify") && js.includes("els.caseStory.innerHTML = glossify(") && js.includes("els.explanationText.innerHTML = glossify("), "la situacion y la explicacion deben marcar las palabras del glosario");
assert(js.includes("function glossifyOptions") && js.includes(".length >= 2)") && js.includes("optionsHtml[index]") && js.includes("sentencesHtml[index]"), "en las opciones solo se marcan palabras que aparecen en al menos dos de ellas");
assert(js.includes("gloss.closest(\"button, [role=") && js.includes("event.stopPropagation();"), "tocar una palabra marcada dentro de una opcion abre el tooltip y no elige la opcion");
assert(!css.includes(".gloss::after") && /.gloss {[^}]*font-style: italic/.test(css) && css.includes(".gloss-tip"), "las palabras del glosario van en cursiva con subrayado, sin icono, y tienen tooltip");
assert(html.includes('id="bookExpandBtn"') && js.includes("function setBookExpanded") && css.includes(".bottom-row.book-expanded .game-panel"), "el libro tiene un boton para expandirse a todo el ancho y ocultar el panel de juego");
assert(js.includes("const bookGloss = (key)") && js.includes("render: highlightSearchText") && js.includes("renderNote(note, gloss)"), "el libro marca las palabras del glosario, salvo en la entrada que las define");
assert(html.includes('id="unitChecks"') && js.includes("function inPlay") && js.includes(".filter(inPlay)") && js.includes("enabledUnits: state.enabledUnits"), "antes de empezar se eligen las unidades, y los desafios salen solo de ellas");
console.log("glossary checks ok");
assert(!/\.path-step\.future\.(shop|timed|definition|boss|match|review)/.test(css) && css.includes(".path-step.future .path-icon"), "los pasos futuros del mapa deben verse apagados, sin el color de su tipo");
assert(html.includes('id="bookLock"') && js.includes("els.bookPanel.inert = locked"), "el libro de consulta se bloquea durante el jefe");
assert(html.includes('id="bossRewardBox"') && js.includes("function renderBossReward"), "la recompensa del jefe se muestra en un recuadro propio debajo del Por que");
assert(js.includes('"boss:won"') && js.includes("if (!state.boss) {\n      addAchievementProgress") || js.includes("if (!state.boss) {\r\n      addAchievementProgress"), "el jefe tiene su logro y sus preguntas no suman a los otros logros");
assert(js.includes("TOOL_ICONS[reward]"), "la recompensa del jefe muestra el icono de la herramienta");
assert(html.includes('id="streak"') && js.includes("state.streak += 1") && js.includes("state.streak = 0;"), "debe existir un contador de racha que se corta al errar");
assert((html.match(/class="badge-tooltip"/g) || []).length >= 5 && html.includes("has-tooltip") && !html.includes('title="Puntos"'), "los indicadores y borrar partida usan tooltips como los de los logros");
assert(js.includes("searchHitIndex: -1") && js.includes("step > 0 ? 0 : hits.length - 1"), "el primer clic de busqueda hacia abajo debe ir al primer resultado");
