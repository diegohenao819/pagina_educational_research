import { inflateRawSync } from "node:zlib";

import { isHiddenItem } from "./hidden-items.mjs";

/**
 * Lector del Excel de seguimiento, sin dependencias.
 *
 * Lo usan `scripts/import-excel.mjs` (línea de comandos) y el panel del tutor,
 * que recibe el archivo subido desde el navegador. Trabaja sobre un Buffer,
 * así que no sabe nada de rutas ni del disco.
 */

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

/* ────────── lectura de la hoja ────────── */

function readSheet(buffer) {
  const zip = unzip(buffer);
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
export const normalizeId = (value) => String(value ?? "").replace(/\D/g, "");

/** Sin tildes, en minúscula: para comparar encabezados */
const slug = (s) =>
  String(s ?? "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\s+/g, " ").trim();

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
 * Cualquier otro texto se guarda tal cual y se le muestra al estudiante.
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

/** Columna de cada campo conocido dentro de una fila de encabezados */
function mapColumns(headerRow) {
  const found = {};
  for (const [field, aliases] of Object.entries(ALIASES)) {
    for (const [col, cell] of Object.entries(headerRow)) {
      if (aliases.includes(slug(cell.value))) { found[field] = col; break; }
    }
  }
  return found;
}

/* ────────── lectura completa ────────── */

/**
 * Convierte el Excel en el dataset del curso.
 *
 * @param {Buffer} mainBuffer Excel de seguimiento.
 * @param {{ idsBuffer?: Buffer, idsSourceName?: string }} [options]
 *   Excel aparte del que sacar las cédulas, cuando el principal no las trae.
 */
export function parseWorkbook(mainBuffer, { idsBuffer, idsSourceName = "el otro archivo" } = {}) {
  const rows = readSheet(mainBuffer);
  const headerRowNum = findHeaderRow(rows);
  const headerRow = rows.get(headerRowNum);

  // La fila de arriba trae la banda de fases en celdas combinadas
  // ("Carpeta Administrativa", "Fase 2", ...). Se hereda hacia la derecha.
  const bandRow = rows.get(String(Number(headerRowNum) - 1)) ?? {};
  const fieldColumn = mapColumns(headerRow);

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

  for (const item of trackingColumns) {
    let label = "Seguimiento";
    for (const band of bandLabels) {
      if (band.index <= colIndex(item.col)) label = band.label;
      else break;
    }
    item.phase = label;
  }

  // Columnas que ya no hacen parte del avance (ver lib/hidden-items.mjs)
  const tracked = trackingColumns.filter((item) => !isHiddenItem(item.phase, item.label));

  // Cédulas desde el otro Excel, cruzando por correo
  let idsByEmail = null;
  if (!fieldColumn.id) {
    if (!idsBuffer) {
      throw new Error(
        'El archivo no tiene columna "Cédula". Agrégasela, o súbelo junto con el Excel que sí la tiene.'
      );
    }
    const fbRows = readSheet(idsBuffer);
    const fbHeaderNum = findHeaderRow(fbRows);
    const fbCol = mapColumns(fbRows.get(fbHeaderNum));

    idsByEmail = new Map();
    for (const [rowNum, cells] of fbRows) {
      if (Number(rowNum) <= Number(fbHeaderNum)) continue;
      const email = slug(cells[fbCol.email]?.value);
      const id = normalizeId(cells[fbCol.id]?.value);
      if (email && id) idsByEmail.set(email, id);
    }
  }

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
          : `Fila ${rowNum}: ${who} no tiene cédula en ${idsSourceName}`
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
      // Una marca por ítem, en el mismo orden que `phases` (aplanado)
      marks: tracked.map((item) => encodeMark(cells[item.col]?.value)),
    });
  }

  // Esquema de fases e ítems: se guarda una sola vez, no una por estudiante
  const phases = [];
  for (const item of tracked) {
    let phase = phases.find((p) => p.phase === item.phase);
    if (!phase) { phase = { phase: item.phase, items: [] }; phases.push(phase); }
    phase.items.push(item.label);
  }

  return {
    dataset: { phases, students },
    problems,
    headerRowNum,
    itemCount: tracked.length,
    idsFromFallback: !fieldColumn.id,
  };
}
