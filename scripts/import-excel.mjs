#!/usr/bin/env node
/**
 * Convierte el Excel de seguimiento -> data/students.json (+ .env.local)
 *
 * Uso:  npm run import  [ruta/al/archivo.xlsx]
 *
 * Fuente principal: "Carpetas - 2026-2 (Educational Research).xlsx"
 *   Trae nombre, correo, link de carpeta, CIPAS y las columnas de seguimiento.
 *
 * Cédulas: si ese archivo tiene una columna "Cédula", se usa y listo.
 *   Si no la tiene, se leen de "carpetas.xlsx" cruzando por correo.
 *   -> Apenas le agregues la columna "Cédula" al archivo principal,
 *      carpetas.xlsx deja de hacer falta.
 *
 * No usa dependencias: lee el ZIP del .xlsx con zlib y parsea el XML.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const MAIN_FILE = process.argv[2] ?? "Carpetas - 2026-2 (Educational Research).xlsx";
const ID_FALLBACK_FILE = "carpetas.xlsx";

/* ────────── lector de ZIP mínimo ────────── */

function unzip(buffer) {
  const files = new Map();
  let eocd = -1;
  for (let i = buffer.length - 22; i >= 0; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("No parece un archivo .xlsx válido (falta el EOCD del ZIP).");

  const count = buffer.readUInt16LE(eocd + 10);
  let p = buffer.readUInt32LE(eocd + 16);

  for (let n = 0; n < count; n++) {
    if (buffer.readUInt32LE(p) !== 0x02014b50) break;
    const method = buffer.readUInt16LE(p + 10);
    const compressedSize = buffer.readUInt32LE(p + 20);
    const nameLen = buffer.readUInt16LE(p + 28);
    const extraLen = buffer.readUInt16LE(p + 30);
    const commentLen = buffer.readUInt16LE(p + 32);
    const localOffset = buffer.readUInt32LE(p + 42);
    const name = buffer.toString("utf8", p + 46, p + 46 + nameLen);

    const start =
      localOffset + 30 + buffer.readUInt16LE(localOffset + 26) + buffer.readUInt16LE(localOffset + 28);
    const raw = buffer.subarray(start, start + compressedSize);

    files.set(name, method === 0 ? raw : inflateRawSync(raw));
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

/* ────────── utilidades XML ────────── */

const decode = (s) =>
  s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
   .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
   .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
   .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
   .replace(/&amp;/g, "&");

const textOf = (xml) =>
  [...xml.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => decode(m[1])).join("");

/** Número de columna a partir de su letra: A=1, B=2, ... AA=27 */
const colIndex = (letters) =>
  [...letters].reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0);

/* ────────── lectura de una hoja ────────── */

function readSheet(filePath) {
  const zip = unzip(readFileSync(filePath));
  const read = (p) => zip.get(p)?.toString("utf8") ?? "";

  const shared = [...read("xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)]
    .map((m) => textOf(m[1]));

  const rels = new Map(
    [...read("xl/worksheets/_rels/sheet1.xml.rels").matchAll(/Id="([^"]+)"[^>]*?Target="([^"]+)"/g)]
      .map((m) => [m[1], decode(m[2])])
  );

  const sheet = read("xl/worksheets/sheet1.xml");

  const hyperlinks = new Map(
    [...sheet.matchAll(/<hyperlink[^>]*ref="([^"]+)"[^>]*r:id="([^"]+)"[^>]*\/?>/g)]
      .map((m) => [m[1], rels.get(m[2]) ?? ""])
  );

  const rows = new Map();
  // Ojo: una celda vacía se escribe auto-cerrada (`<c r="A1" s="1"/>`). El grupo
  // de atributos debe ser perezoso y la alternativa `/>` ir primero, o el match
  // se pasa de largo y termina tomando el valor de la celda siguiente.
  for (const m of sheet.matchAll(/<c\s([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
    const [, attrs, body = ""] = m;
    const ref = /r="([A-Z]+)(\d+)"/.exec(attrs);
    if (!ref) continue;
    const [, col, rowNum] = ref;
    const type = /t="([^"]+)"/.exec(attrs)?.[1];

    let value = "";
    if (type === "s") {
      const idx = /<v>(\d+)<\/v>/.exec(body)?.[1];
      value = idx !== undefined ? shared[Number(idx)] ?? "" : "";
    } else if (type === "inlineStr") {
      value = textOf(body);
    } else {
      value = decode(/<v>([\s\S]*?)<\/v>/.exec(body)?.[1] ?? "");
    }

    if (!rows.has(rowNum)) rows.set(rowNum, {});
    rows.get(rowNum)[col] = { value: value.trim(), href: hyperlinks.get(`${col}${rowNum}`) };
  }

  return rows;
}

/* ────────── normalizadores ────────── */

const PARTICLES = new Set(["de", "del", "la", "las", "los", "y", "da", "do", "van", "von"]);

/** "ESTUDIANTE  DE PRUEBA" -> "Estudiante de Prueba" */
const titleCase = (name) =>
  name.replace(/\s+/g, " ").trim().toLowerCase().split(" ")
    .map((w, i) => (i > 0 && PARTICLES.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");

/** Deja sólo dígitos: "1.234.567.890" y "1234567890" quedan iguales */
const normalizeId = (value) => String(value ?? "").replace(/\D/g, "");

/** Sin tildes, en minúscula: para comparar encabezados */
const slug = (s) =>
  String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();

/* ────────── convención de marcas ────────── */

// Relleno visual o casilla sin diligenciar -> pendiente
const BLANK = new Set(["", ".", "-", "–", "—", "*", "·", "_"]);
// Cumplido
const DONE = new Set([
  "x", "xx", "✓", "✔", "√", "ok", "si", "sí", "yes", "y", "1",
  "listo", "done", "entregado", "entregada", "cumple", "cumplido", "completo",
]);
// No aplica
const NOT_APPLICABLE = new Set(["n/a", "na", "n.a.", "no aplica", "noaplica", "exento"]);

/**
 * Traduce lo que escribas en la celda a una marca compacta:
 *   ""  pendiente      "x"  cumplido      "/"  no aplica
 * Cualquier otro texto se guarda tal cual y se le muestra al estudiante
 * como nota (ej. "Reenviar en PDF").
 */
function encodeMark(raw) {
  const value = String(raw ?? "").trim();
  const key = slug(value);
  if (BLANK.has(key)) return "";
  if (DONE.has(key)) return "x";
  if (NOT_APPLICABLE.has(key)) return "/";
  return value;
}

/* ────────── correcciones de encabezados ────────── */

// Se aplican al texto que ve el estudiante, aunque el Excel diga otra cosa.
// Las horas de práctica son 12 por fase (24 en total), no 15.
const LABEL_FIXES = [[/\b15\s*(hours|horas)\b/gi, "12 $1"]];

const fixLabel = (text) =>
  LABEL_FIXES.reduce((s, [pattern, replacement]) => s.replace(pattern, replacement),
    text.replace(/\s+/g, " ").trim());

/* ────────── localizar encabezados ────────── */

const ALIASES = {
  id: ["cedula", "documento", "identificacion", "no. documento", "numero de documento", "cc"],
  name: ["estudiante", "nombre", "nombres", "nombre completo"],
  email: ["correo", "email", "e-mail", "correo institucional"],
  url: ["folder", "carpeta", "link", "enlace", "url"],
  group: ["group", "grupo", "cipas", "cipa"],
  comments: ["comments", "comentarios", "observaciones", "notas"],
};

/** Encuentra la fila de encabezados: la que contenga "Estudiante" y "Correo". */
function findHeaderRow(rows) {
  const sorted = [...rows.keys()].map(Number).sort((a, b) => a - b);
  for (const rowNum of sorted) {
    const cells = rows.get(String(rowNum));
    const values = Object.values(cells).map((c) => slug(c.value));
    if (values.some((v) => ALIASES.name.includes(v)) && values.some((v) => ALIASES.email.includes(v))) {
      return String(rowNum);
    }
  }
  throw new Error('No encontré la fila de encabezados (debe tener "Estudiante" y "Correo").');
}

/* ────────── lectura del archivo principal ────────── */

const mainPath = resolve(ROOT, MAIN_FILE);
if (!existsSync(mainPath)) {
  console.error(`\n  No encontré "${MAIN_FILE}".`);
  console.error(`  Uso: npm run import "ruta/al/archivo.xlsx"\n`);
  process.exit(1);
}

const rows = readSheet(mainPath);
const headerRowNum = findHeaderRow(rows);
const headerRow = rows.get(headerRowNum);

// La fila de arriba trae la banda de fases en celdas combinadas
// ("Carpeta Administrativa", "Fase 2", ...). Se hereda hacia la derecha.
const bandRow = rows.get(String(Number(headerRowNum) - 1)) ?? {};

/** Mapea cada campo conocido a su letra de columna */
const fieldColumn = {};
for (const [field, aliases] of Object.entries(ALIASES)) {
  for (const [col, cell] of Object.entries(headerRow)) {
    if (aliases.includes(slug(cell.value))) { fieldColumn[field] = col; break; }
  }
}

if (!fieldColumn.name || !fieldColumn.url) {
  throw new Error('Faltan columnas obligatorias: "Estudiante" y "Folder".');
}

// Todo lo que no sea un campo conocido y tenga encabezado = ítem de seguimiento
const reserved = new Set(Object.values(fieldColumn));
const trackingColumns = Object.entries(headerRow)
  .filter(([col, cell]) => cell.value && !reserved.has(col))
  .sort((a, b) => colIndex(a[0]) - colIndex(b[0]))
  .map(([col, cell]) => ({ col, label: fixLabel(cell.value) }));

// Fase de cada ítem: la última etiqueta de la banda que quede a su izquierda
const bandLabels = Object.entries(bandRow)
  .filter(([, cell]) => cell.value)
  .map(([col, cell]) => ({ index: colIndex(col), label: cell.value.trim() }))
  .sort((a, b) => a.index - b.index);

const phaseFor = (col) => {
  const index = colIndex(col);
  let label = "Seguimiento";
  for (const band of bandLabels) {
    if (band.index <= index) label = band.label;
    else break;
  }
  return label;
};

for (const item of trackingColumns) item.phase = phaseFor(item.col);

/* ────────── cédulas ────────── */

let idsByEmail = null;

if (!fieldColumn.id) {
  const fallbackPath = resolve(ROOT, ID_FALLBACK_FILE);
  if (!existsSync(fallbackPath)) {
    console.error(`\n  "${MAIN_FILE}" no tiene columna "Cédula" y tampoco existe "${ID_FALLBACK_FILE}".`);
    console.error(`  Agrégale una columna "Cédula" al archivo principal y vuelve a correr esto.\n`);
    process.exit(1);
  }

  const fbRows = readSheet(fallbackPath);
  const fbHeaderNum = findHeaderRow(fbRows);
  const fbHeader = fbRows.get(fbHeaderNum);
  const fbCol = {};
  for (const [field, aliases] of Object.entries(ALIASES)) {
    for (const [col, cell] of Object.entries(fbHeader)) {
      if (aliases.includes(slug(cell.value))) { fbCol[field] = col; break; }
    }
  }

  idsByEmail = new Map();
  for (const [rowNum, cells] of fbRows) {
    if (Number(rowNum) <= Number(fbHeaderNum)) continue;
    const email = slug(cells[fbCol.email]?.value);
    const id = normalizeId(cells[fbCol.id]?.value);
    if (email && id) idsByEmail.set(email, id);
  }
}

/* ────────── construcción del dataset ────────── */

const students = [];
const problems = [];
const seen = new Map();

const dataRows = [...rows.entries()]
  .filter(([rowNum]) => Number(rowNum) > Number(headerRowNum))
  .sort((a, b) => Number(a[0]) - Number(b[0]));

for (const [rowNum, cells] of dataRows) {
  const name = cells[fieldColumn.name]?.value ?? "";
  const email = slug(cells[fieldColumn.email]?.value);
  const folderCell = cells[fieldColumn.url];
  // El hipervínculo manda sobre el texto visible de la celda
  const url = (folderCell?.href || folderCell?.value || "").trim();

  const id = fieldColumn.id
    ? normalizeId(cells[fieldColumn.id]?.value)
    : idsByEmail?.get(email) ?? "";

  if (!name && !email && !url) continue; // fila vacía

  const who = name || email || `fila ${rowNum}`;
  if (!id) {
    problems.push(
      fieldColumn.id
        ? `Fila ${rowNum}: sin cédula (${who})`
        : `Fila ${rowNum}: ${who} no tiene cédula en ${ID_FALLBACK_FILE}`
    );
    continue;
  }
  if (!/^https?:\/\//i.test(url)) { problems.push(`Fila ${rowNum}: sin link válido (${who})`); continue; }
  if (seen.has(id)) { problems.push(`Fila ${rowNum}: cédula repetida ${id} (ya estaba en la fila ${seen.get(id)})`); continue; }
  seen.set(id, rowNum);

  students.push({
    id,
    name: titleCase(name),
    email,
    url,
    group: fieldColumn.group ? cells[fieldColumn.group]?.value ?? "" : "",
    comments: fieldColumn.comments ? cells[fieldColumn.comments]?.value ?? "" : "",
    // Una marca por ítem, en el mismo orden que `phases` (aplanado).
    // Los nombres de los ítems viven una sola vez en el esquema, no 45 veces.
    marks: trackingColumns.map((item) => encodeMark(cells[item.col]?.value)),
  });
}

// Esquema de fases e ítems: se guarda una sola vez
const phaseSchema = [];
for (const item of trackingColumns) {
  let phase = phaseSchema.find((p) => p.phase === item.phase);
  if (!phase) { phase = { phase: item.phase, items: [] }; phaseSchema.push(phase); }
  phase.items.push(item.label);
}

const dataset = { phases: phaseSchema, students };

/* ────────── salida ────────── */

mkdirSync(resolve(ROOT, "data"), { recursive: true });
writeFileSync(resolve(ROOT, "data/students.json"), JSON.stringify(dataset, null, 2) + "\n", "utf8");

const compact = JSON.stringify(dataset);
writeFileSync(resolve(ROOT, ".env.local"), `STUDENTS_JSON=${compact}\n`, "utf8");
writeFileSync(resolve(ROOT, ".env.value"), compact, "utf8");

/* ────────── informe ────────── */

const allMarks = students.flatMap((s) => s.marks);
const done = allMarks.filter((m) => m === "x").length;
const na = allMarks.filter((m) => m === "/").length;
const notes = allMarks.filter((m) => m !== "" && m !== "x" && m !== "/").length;
const totalItems = allMarks.length;

console.log(`\n  Fuente: ${basename(mainPath)}  (encabezados en la fila ${headerRowNum})`);
console.log(`  ${students.length} estudiantes, ${trackingColumns.length} ítems de seguimiento c/u`);
console.log(`  Cédulas: ${fieldColumn.id ? "columna propia del archivo" : `cruzadas por correo con ${ID_FALLBACK_FILE}`}`);

const byPhase = new Map();
for (const item of trackingColumns) byPhase.set(item.phase, (byPhase.get(item.phase) ?? 0) + 1);
console.log(`\n  Fases detectadas:`);
for (const [phase, n] of byPhase) console.log(`    - ${phase} (${n} ítem${n === 1 ? "" : "s"})`);

console.log(`\n  Marcas: ${done} cumplidas, ${notes} con nota, ${na} no aplica, ${totalItems - done - notes - na} pendientes (de ${totalItems})`);
console.log(`\n  -> data/students.json`);

// Vercel admite 64 KB en total entre todas las variables de entorno
const bytes = Buffer.byteLength(compact);
const budget = Math.round((bytes / 65536) * 100);
console.log(`  -> .env.local y .env.value  (${bytes} bytes, ${budget}% del límite de Vercel)`);
if (bytes > 45000) {
  console.log(`\n  ATENCIÓN: el dataset se está acercando al límite de 64 KB de Vercel.`);
  console.log(`  Acorta los textos de la columna "Comments" o pásate a una base de datos.`);
}

if (problems.length) {
  console.log(`\n  ${problems.length} fila(s) omitida(s):`);
  for (const p of problems) console.log(`    - ${p}`);
}

if (!fieldColumn.id) {
  console.log(`\n  Sugerencia: agrégale una columna "Cédula" a ${basename(mainPath)}`);
  console.log(`  y ${ID_FALLBACK_FILE} deja de hacer falta.`);
}
console.log("");
