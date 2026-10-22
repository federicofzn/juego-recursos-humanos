const assert = require("assert");
const fs = require("fs");
const path = require("path");

const questions = JSON.parse(fs.readFileSync(path.join(__dirname, "questions.json"), "utf8"));
const reference = JSON.parse(fs.readFileSync(path.join(__dirname, "reference.json"), "utf8"));

const TIPOS = ["caso", "clasificar", "concepto", "norma"];

assert(questions.length >= 90, "el banco debe tener al menos 90 casos");

for (const item of questions) {
  const where = `[${item.id}]`;
  assert(TIPOS.includes(item.tipo), `${where} tipo invalido: ${item.tipo}`);
  assert(item.titulo && item.titulo.length <= 40, `${where} falta titulo corto del caso`);
  assert(item.situacion && item.situacion.length >= 40, `${where} la situacion debe contar un caso`);
  assert(item.pregunta.trim().endsWith("?"), `${where} la pregunta debe terminar en signo de pregunta`);
  assert.equal(item.respuestasIncorrectas.length, 5, `${where} debe haber 5 distractores`);

  const allAnswers = [item.respuestaCorrecta, ...item.respuestasIncorrectas];
  assert.equal(new Set(allAnswers.map((a) => a.toLowerCase())).size, 6, `${where} hay opciones repetidas`);

  assert(item.pista && item.pista.length >= 20, `${where} falta una pista especifica`);
  assert(!item.pista.includes(item.respuestaCorrecta), `${where} la pista no debe contener la respuesta`);
  assert(item.explicacion && item.explicacion.length >= 40, `${where} falta la explicacion posterior`);

  const entry = reference.entradas[item.referencia.entradaLibro];
  assert(entry, `${where} la entrada del libro no existe`);
  assert.equal(entry.unidad, item.unidad, `${where} la entrada del libro es de otra unidad`);
}

const unitCounts = {};
for (const item of questions) unitCounts[item.unidad] = (unitCounts[item.unidad] || 0) + 1;
for (const unit of reference.unidades) {
  assert(unitCounts[unit.key] >= 18, `la unidad ${unit.titulo} debe tener al menos 18 casos`);
}

const requiredFragments = [
  "atraer", "retener", "motivar", "socio estratégico", "agente de cambio", "experto en administración",
  "líder de efectividad", "propósito, el valor y la cultura", "planificación de RRHH", "orientación", "agilidad organizacional",
  "aspiración ganadora", "dónde jugar", "cómo jugar", "capacidades", "sistemas de gestión", "diferenciación",
  "stakeholders", "cultura no se diseña", "símbolos", "se come a la estrategia",
  "iceberg", "socialización", "filosofía de los fundadores", "gatopardismo", "diagnóstico", "Farmacity",
  "mentoría", "upskilling", "clima laboral", "rotación", "salario emocional", "escala numérica", "anonimato",
  "EVP", "equilibrio vida-trabajo", "auténtico", "tiempo indeterminado", "temporada", "eventual",
  "preaviso", "indemnización", "telegrama laboral", "despido indirecto", "mutuo acuerdo", "14 días", "21 días",
  "35 días", "31 de diciembre"
];

const corpus = questions
  .map((item) => [item.situacion, item.pregunta, item.respuestaCorrecta, item.explicacion].join(" "))
  .join(" ")
  .toLowerCase();

for (const fragment of requiredFragments) {
  assert(corpus.includes(fragment.toLowerCase()), `debe existir un caso sobre: ${fragment}`);
}

for (const [key, entry] of Object.entries(reference.entradas)) {
  const intro = [].concat(entry.intro || []).join(" ");
  assert(intro.length >= 80, `la entrada ${key} necesita una introduccion explicativa`);
  assert(entry.notas.length >= 3, `la entrada ${key} necesita al menos 3 puntos clave`);
  assert(entry.ejemplos && entry.ejemplos.length >= 1, `la entrada ${key} necesita al menos un ejemplo`);
  if (entry.categoria !== "Empezá por acá") {
    assert(questions.some((item) => item.referencia.entradaLibro === key), `la entrada ${key} no la usa ningun caso`);
  }
}

for (const unit of reference.unidades) {
  assert(
    Object.values(reference.entradas).some((entry) => entry.unidad === unit.key && entry.categoria === "Empezá por acá"),
    `la unidad ${unit.titulo} debe empezar con un glosario de palabras basicas`
  );
}

console.log(`${questions.length} casos y ${Object.keys(reference.entradas).length} entradas del libro validados`);

const definitions = JSON.parse(fs.readFileSync(path.join(__dirname, "definitions.json"), "utf8"));
assert(definitions.length >= 70, "debe haber al menos 70 definiciones");
for (const unit of reference.unidades) {
  assert(definitions.filter((item) => item.unidad === unit.key).length >= 14, `la unidad ${unit.titulo} necesita al menos 14 definiciones`);
}
for (const item of definitions) {
  assert(item.respuestasIncorrectas.length >= 2, `[${item.id}] necesita al menos 2 distractores del mismo grupo`);
  assert(!item.respuestasIncorrectas.includes(item.respuestaCorrecta), `[${item.id}] un distractor repite la definicion correcta`);
  assert(item.pregunta.endsWith("?"), `[${item.id}] la pregunta debe terminar en signo de pregunta`);
  assert(reference.entradas[item.referencia.entradaLibro].unidad === item.unidad, `[${item.id}] la entrada del libro es de otra unidad`);
}
console.log(`${definitions.length} definiciones validadas`);

// Encontrá el error: textos de 5 oraciones con exactamente una incorrecta, que no se delate por la forma.
const errors = JSON.parse(fs.readFileSync(path.join(__dirname, "errors.json"), "utf8"));
const ABSOLUTE = /\b(siempre|nunca|jamás|todos|todas|ninguno|ninguna|cualquier)\b/i;
for (const unit of reference.unidades) {
  assert(errors.filter((item) => item.unidad === unit.key).length >= 5, `la unidad ${unit.titulo} necesita al menos 5 textos de encontrar el error`);
}
for (const item of errors) {
  const where = `[${item.id}]`;
  assert(item.titulo && item.titulo.length <= 40, `${where} falta titulo corto`);
  assert.equal(item.oraciones.length, 5, `${where} debe tener 5 oraciones`);
  assert(Number.isInteger(item.incorrecta) && item.oraciones[item.incorrecta], `${where} la oracion incorrecta no existe`);
  assert.equal(new Set(item.oraciones).size, 5, `${where} hay oraciones repetidas`);
  const wrong = item.oraciones[item.incorrecta];
  assert(item.correccion && item.correccion !== wrong, `${where} la correccion debe cambiar la oracion incorrecta`);
  assert(!ABSOLUTE.test(wrong) || item.oraciones.some((s, i) => i !== item.incorrecta && ABSOLUTE.test(s)), `${where} la oracion incorrecta no debe delatarse con palabras absolutas`);
  const longestValid = Math.max(...item.oraciones.filter((_, i) => i !== item.incorrecta).map((s) => s.length));
  assert(wrong.length <= longestValid + 15, `${where} la oracion incorrecta es notoriamente la mas larga`);
  assert(item.pista && item.pista.length >= 20 && !item.pista.includes(item.correccion), `${where} falta una pista que no revele la correccion`);
  assert(item.explicacion.includes(item.correccion), `${where} la explicacion debe mostrar la oracion corregida`);
  const entry = reference.entradas[item.referencia.entradaLibro];
  assert(entry && entry.unidad === item.unidad, `${where} la entrada del libro no existe o es de otra unidad`);
}
console.log(`${errors.length} textos de encontrar el error validados`);

// Una pista tiene que ayudar a elegir: nunca puede limitarse a mandar al libro de consulta.
for (const item of [...questions, ...definitions, ...errors]) {
  assert(!/revis[aá] la entrada|libro de consulta/i.test(item.pista), `[${item.id}] la pista solo manda al libro: ${item.pista}`);
  assert(!item.pista.includes(item.respuestaCorrecta), `[${item.id}] la pista no debe contener la respuesta`);
}
// En las definiciones, la pista no puede compartir palabras clave con la definicion correcta que no esten
// tambien en las otras definiciones del grupo: el jugador elegiria por coincidencia de palabras, sin entender.
const HINT_STOP = new Set(("para como cuando donde porque pero sobre entre desde hasta este esta esto estos estas ese esa eso esos esas " +
  "aquel cada otro otra otros otras todo toda todos todas puede pueden tiene tienen tener hace hacer hacia hacian hizo algo alguien " +
  "solo sola tambien estan fueron sido sera seria haber habia hubo muy mismo misma mismos mismas segun aunque " +
  "mientras durante antes despues luego entonces tanto siempre nunca nada nadie ninguno ninguna cual cuales quien quienes " +
  "pensa ejemplo ejemplos caso casos dice decir dijo forma formas parte partes tipo tipos").split(" "));
const HINT_STOP_STEMS = new Set([...HINT_STOP].map((word) => word.slice(0, 5)));
const keyStems = (text) => new Set(text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .split(/[^a-z0-9]+/).filter((word) => word.length >= 4 && !HINT_STOP.has(word))
  .map((word) => word.slice(0, 5)).filter((stem) => !HINT_STOP_STEMS.has(stem)));
for (const item of definitions) {
  const visible = keyStems(item.titulo);
  const others = new Set(item.respuestasIncorrectas.flatMap((text) => [...keyStems(text)]));
  const correct = keyStems(item.respuestaCorrecta);
  const leaked = [...keyStems(item.pista)].filter((stem) => correct.has(stem) && !others.has(stem) && !visible.has(stem));
  assert(!leaked.length, `[${item.id}] la pista repite palabras de la definicion correcta (${leaked.join(", ")}): ${item.pista}`);
}
console.log("pistas validadas");

// Glosario: cada palabra se usa en algun texto donde se muestra, y solo marca el sentido correcto.
const glossary = JSON.parse(fs.readFileSync(path.join(__dirname, "glossary.json"), "utf8"));
const glossedTexts = [
  ...questions.flatMap((item) => [item.situacion, item.pregunta, item.pista, item.explicacion]),
  ...definitions.flatMap((item) => [item.titulo, item.pregunta, item.pista, item.explicacion]),
  ...errors.flatMap((item) => [item.situacion, item.pista, item.explicacion]),
  ...[...questions, ...definitions, ...errors].flatMap((item) => [item.respuestaCorrecta, ...item.respuestasIncorrectas])
];
for (const entry of glossary) {
  assert(entry.definicion.length >= 20 && entry.definicion.length <= 160, `[glosario ${entry.id}] la definicion debe ser corta (20 a 160 caracteres)`);
  const regex = new RegExp(entry.source, "iu");
  assert(glossedTexts.some((text) => regex.test(text)), `[glosario ${entry.id}] no aparece en ningun texto del juego`);
}
// Un tooltip no puede delatar la respuesta del desafio donde aparece: su definicion no puede compartir
// palabras clave con la respuesta correcta que no esten tambien en las otras opciones o en el texto visible.
for (const item of [...questions, ...definitions, ...errors]) {
  const visibleText = [item.titulo, item.situacion, item.pregunta, item.pista].filter(Boolean).join(" ");
  const visible = keyStems(visibleText);
  const others = new Set(item.respuestasIncorrectas.flatMap((text) => [...keyStems(text)]));
  const correct = keyStems(item.respuestaCorrecta);
  const options = [item.respuestaCorrecta, ...item.respuestasIncorrectas];
  for (const entry of glossary) {
    const regex = new RegExp(entry.source, "iu");
    // En las opciones, el juego solo marca palabras que aparecen en al menos dos de ellas.
    const shownInOptions = options.filter((text) => regex.test(text)).length >= 2;
    if (!regex.test(visibleText) && !shownInOptions) continue;
    const leaked = [...keyStems(entry.definicion)].filter((stem) => correct.has(stem) && !others.has(stem) && !visible.has(stem));
    assert(!leaked.length, `[${item.id}] el tooltip de «${entry.termino}» delata la respuesta (${leaked.join(", ")})`);
  }
}
console.log(`${glossary.length} palabras del glosario validadas`);

// Toda nota del libro con formato "Rotulo: explicacion" debe mostrar el rotulo en negrita.
const gameSource = fs.readFileSync(path.join(__dirname, "game.js"), "utf8");
const labelEndSource = gameSource.slice(gameSource.indexOf("function labelEnd"), gameSource.indexOf("\n}", gameSource.indexOf("function labelEnd")) + 2);
const labelEnd = new Function(`${labelEndSource}; return labelEnd;`)();
for (const [key, entry] of Object.entries(reference.entradas)) {
  for (const note of entry.notas) {
    if (note.includes(": ")) {
      assert(labelEnd(note) !== -1, `[${key}] la nota no muestra su rotulo en negrita: ${note.slice(0, 60)}`);
    }
  }
}
console.log("rotulos del libro validados");

// Esquemas del libro: tipo conocido, titulo y los datos que cada tipo necesita.
const FIGURE_FIELDS = {
  cuadrantes: ["ejes", "cuadrantes"], flujo: ["tramos"], escala: ["tramos"], capas: ["visible", "oculto"],
  antesdespues: ["antes", "despues"], cascada: ["pasos"], grupos: ["centro", "grupos"], comparacion: ["columnas", "filas"]
};
assert(gameSource.includes("function renderFigure"), "el juego debe dibujar los esquemas del libro");
for (const [key, entry] of Object.entries(reference.entradas)) {
  if (!entry.figura) continue;
  const fields = FIGURE_FIELDS[entry.figura.tipo];
  assert(fields, `[${key}] tipo de esquema desconocido: ${entry.figura.tipo}`);
  assert(entry.figura.titulo, `[${key}] el esquema necesita un titulo`);
  for (const field of fields) assert(entry.figura[field], `[${key}] al esquema ${entry.figura.tipo} le falta «${field}»`);
  if (entry.figura.tipo === "cuadrantes") {
    assert.equal(entry.figura.cuadrantes.length, 4, `[${key}] los cuadrantes deben ser 4`);
  }
}
console.log("esquemas del libro validados");
