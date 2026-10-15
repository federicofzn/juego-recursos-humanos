const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Fuente de verdad: juego/datos/libro_<unidad>.json, preguntas_<unidad>.json, definiciones_<unidad>.json
// y errores_<unidad>.json. Este script los une en questions.json, reference.json, definitions.json y
// errors.json, y los incrusta en index.html.
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "datos");
const UNITS = ["introduccion", "estrategia_cultura", "transformacion", "clima_evp", "contrato_trabajo"];

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
}

function buildReference() {
  const reference = { unidades: [], entradas: {} };
  for (const unitKey of UNITS) {
    const book = readJson(`libro_${unitKey}.json`);
    reference.unidades.push(book.unidad);
    for (const [key, entry] of Object.entries(book.entradas)) {
      if (reference.entradas[key]) throw new Error(`Entrada del libro duplicada: ${key}`);
      reference.entradas[key] = { unidad: unitKey, ...entry };
    }
  }
  return reference;
}

function buildQuestions(reference) {
  const ids = new Set();
  return UNITS.flatMap((unitKey) =>
    readJson(`preguntas_${unitKey}.json`).map((item) => {
      if (ids.has(item.id)) throw new Error(`Id de pregunta duplicado: ${item.id}`);
      ids.add(item.id);
      const entry = reference.entradas[item.libro];
      if (!entry) throw new Error(`${item.id}: la entrada del libro "${item.libro}" no existe`);
      return {
        id: item.id,
        unidad: unitKey,
        tipo: item.tipo,
        titulo: item.titulo,
        situacion: item.situacion,
        pregunta: item.pregunta,
        respuestaCorrecta: item.correcta,
        respuestasIncorrectas: item.incorrectas,
        pista: item.pista,
        explicacion: item.explicacion,
        referencia: {
          tipo: entry.categoria,
          titulo: entry.titulo,
          entradaLibro: item.libro
        }
      };
    })
  );
}

// Definiciones: las opciones incorrectas son las definiciones de los otros terminos del mismo grupo,
// asi los distractores son siempre del mismo tema (por ejemplo, las otras clases de dolo).
function buildDefinitions(reference, questionIds) {
  const ids = new Set(questionIds);
  return UNITS.flatMap((unitKey) => {
    const items = readJson(`definiciones_${unitKey}.json`);
    return items.map((item) => {
      if (ids.has(item.id)) throw new Error(`Id duplicado: ${item.id}`);
      ids.add(item.id);
      const entry = reference.entradas[item.libro];
      if (!entry) throw new Error(`${item.id}: la entrada del libro "${item.libro}" no existe`);
      const others = items.filter((other) => other.grupo === item.grupo && other.id !== item.id);
      if (others.length < 2) throw new Error(`${item.id}: el grupo "${item.grupo}" necesita al menos 3 terminos`);
      return {
        id: item.id,
        unidad: unitKey,
        tipo: "definicion",
        grupo: item.grupo,
        ejemplo: item.ejemplo,
        titulo: item.termino,
        situacion: "",
        pregunta: item.pregunta || `¿Qué significa «${item.termino}»?`,
        respuestaCorrecta: item.definicion,
        respuestasIncorrectas: others.map((other) => other.definicion),
        // La pista es un ejemplo concreto del termino: ayuda a reconocer la definicion sin decirla.
        pista: item.pista || `Pensá en este ejemplo: ${item.ejemplo}`,
        explicacion: `${item.termino}: ${item.definicion} Ejemplo: ${item.ejemplo}`,
        referencia: {
          tipo: entry.categoria,
          titulo: entry.titulo,
          entradaLibro: item.libro
        }
      };
    });
  });
}

// Encontrá el error: textos de 5 oraciones donde exactamente una es incorrecta.
// En el juego, la "respuesta correcta" es la oración incorrecta (la que hay que encontrar).
function buildErrors(reference, usedIds) {
  const ids = new Set(usedIds);
  return UNITS.flatMap((unitKey) =>
    readJson(`errores_${unitKey}.json`).map((item) => {
      if (ids.has(item.id)) throw new Error(`Id duplicado: ${item.id}`);
      ids.add(item.id);
      const entry = reference.entradas[item.libro];
      if (!entry) throw new Error(`${item.id}: la entrada del libro "${item.libro}" no existe`);
      if (!item.oraciones[item.incorrecta]) throw new Error(`${item.id}: la oración incorrecta no existe`);
      return {
        id: item.id,
        unidad: unitKey,
        tipo: "error",
        titulo: item.titulo,
        situacion: `Un colega te pasa este resumen sobre «${item.titulo}» para que lo revises. Una de las oraciones tiene un error.`,
        pregunta: "¿Cuál es la oración incorrecta?",
        oraciones: item.oraciones,
        incorrecta: item.incorrecta,
        correccion: item.correccion,
        respuestaCorrecta: item.oraciones[item.incorrecta],
        respuestasIncorrectas: item.oraciones.filter((_, index) => index !== item.incorrecta),
        pista: item.pista,
        explicacion: `Lo correcto es: «${item.correccion}» ${item.explicacion}`,
        referencia: {
          tipo: entry.categoria,
          titulo: entry.titulo,
          entradaLibro: item.libro
        }
      };
    })
  );
}

// Glosario: palabras de apoyo (no los conceptos que el juego evalua) que se resaltan con un tooltip.
// En los patrones, \b se convierte en un limite de palabra que entiende tildes y eñes.
const UNICODE_BOUNDARY = "(?:(?<=[\\p{L}\\p{N}])(?![\\p{L}\\p{N}])|(?<![\\p{L}\\p{N}])(?=[\\p{L}\\p{N}]))";
const plainTerm = (text) => text.toLowerCase().replace(/\s*\(.*?\)/g, "").trim();

function buildGlossary(definitions, reference) {
  const tested = new Set(definitions.map((item) => plainTerm(item.titulo)));
  const ids = new Set();
  return readJson("glosario.json").map((item) => {
    if (ids.has(item.id)) throw new Error(`Glosario: id duplicado ${item.id}`);
    ids.add(item.id);
    if (tested.has(plainTerm(item.termino))) {
      throw new Error(`Glosario: «${item.termino}» es un concepto que el juego evalua; su tooltip daria la respuesta`);
    }
    const source = item.patron.replaceAll("\\b", UNICODE_BOUNDARY);
    const regex = new RegExp(source, "iu");
    // Entradas del libro donde ya se explica la palabra: alguna nota cuyo rotulo es exactamente esa palabra,
    // o un titulo que es esa palabra. Ahi no se marca. "definidoEn" en el glosario agrega casos a mano.
    const isTheWord = (text) => {
      const clean = text.replace(/\s*\(.*?\)/g, "").replace(/^(?:el|la|los|las)\s+/i, "").trim();
      const match = clean.match(regex);
      return Boolean(match) && match.index === 0 && match[0].length === clean.length;
    };
    const definidoEn = Object.entries(reference.entradas)
      .filter(([key, entry]) => (item.definidoEn || []).includes(key) || isTheWord(entry.titulo.split(":")[0]) ||
        entry.notas.some((note) => note.includes(": ") && isTheWord(note.split(": ")[0])))
      .map(([key]) => key);
    return { id: item.id, termino: item.termino, definicion: item.definicion, source, definidoEn };
  });
}

function embedData(questionsJson, referenceJson, definitionsJson, errorsJson, glossaryJson) {
  const htmlPath = path.join(ROOT, "index.html");
  let html = fs.readFileSync(htmlPath, "utf8");
  const safe = (json) => json.replace(/<\//g, "<\\/");

  html = html.replace(
    /<script id="questions-data" type="application\/json">[\s\S]*?<\/script>/,
    () => `<script id="questions-data" type="application/json">${safe(questionsJson)}</script>`
  );
  html = html.replace(
    /<script id="reference-data" type="application\/json">[\s\S]*?<\/script>/,
    () => `<script id="reference-data" type="application/json">${safe(referenceJson)}</script>`
  );
  html = html.replace(
    /<script id="definitions-data" type="application\/json">[\s\S]*?<\/script>/,
    () => `<script id="definitions-data" type="application/json">${safe(definitionsJson)}</script>`
  );
  if (!html.includes('<script id="errors-data"')) {
    html = html.replace('<script id="definitions-data"', '<script id="errors-data" type="application/json"></script>\n  <script id="definitions-data"');
  }
  html = html.replace(
    /<script id="errors-data" type="application\/json">[\s\S]*?<\/script>/,
    () => `<script id="errors-data" type="application/json">${safe(errorsJson)}</script>`
  );
  if (!html.includes('<script id="glossary-data"')) {
    html = html.replace('<script id="definitions-data"', '<script id="glossary-data" type="application/json"></script>\n  <script id="definitions-data"');
  }
  html = html.replace(
    /<script id="glossary-data" type="application\/json">[\s\S]*?<\/script>/,
    () => `<script id="glossary-data" type="application/json">${safe(glossaryJson)}</script>`
  );
  // Versiona game.js y styles.css con un hash de su contenido para que el navegador no use una copia vieja.
  html = html.replace(/src="game\.js(\?v=\w+)?"/, `src="game.js?v=${fileHash("game.js")}"`);
  html = html.replace(/href="styles\.css(\?v=\w+)?"/, `href="styles.css?v=${fileHash("styles.css")}"`);
  fs.writeFileSync(htmlPath, html);
}

function fileHash(file) {
  return crypto.createHash("sha1").update(fs.readFileSync(path.join(ROOT, file))).digest("hex").slice(0, 8);
}

const reference = buildReference();
const questions = buildQuestions(reference);
const definitions = buildDefinitions(reference, questions.map((item) => item.id));
const errors = buildErrors(reference, [...questions, ...definitions].map((item) => item.id));
const questionsJson = `${JSON.stringify(questions, null, 2)}\n`;
const definitionsJson = `${JSON.stringify(definitions, null, 2)}\n`;
const referenceJson = `${JSON.stringify(reference, null, 2)}\n`;
const errorsJson = `${JSON.stringify(errors, null, 2)}\n`;
const glossary = buildGlossary(definitions, reference);
const glossaryJson = `${JSON.stringify(glossary, null, 2)}\n`;

fs.writeFileSync(path.join(ROOT, "questions.json"), questionsJson);
fs.writeFileSync(path.join(ROOT, "reference.json"), referenceJson);
fs.writeFileSync(path.join(ROOT, "definitions.json"), definitionsJson);
fs.writeFileSync(path.join(ROOT, "errors.json"), errorsJson);
fs.writeFileSync(path.join(ROOT, "glossary.json"), glossaryJson);
embedData(questionsJson, referenceJson, definitionsJson, errorsJson, glossaryJson);
console.log(`${questions.length} casos, ${definitions.length} definiciones y ${Object.keys(reference.entradas).length} entradas del libro generados`);
