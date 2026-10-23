#!/usr/bin/env node
/**
 * Convierte el Excel de seguimiento -> data/students.json (+ .env.local)
 *
 * Uso:  npm run import  [ruta/al/archivo.xlsx]
 *
 * La lectura del Excel vive en lib/parse-workbook.mjs, que comparte con el
 * panel del tutor. Este archivo solo maneja rutas, archivos y el informe.
 *
 * Cédulas: si el archivo principal tiene columna "Cédula", se usa y listo.
 *   Si no, se leen de "carpetas.xlsx" cruzando por correo.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { parseWorkbook } from "../lib/parse-workbook.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MAIN_FILE = process.argv[2] ?? "Carpetas - 2026-2 (Educational Research).xlsx";
const ID_FALLBACK_FILE = "carpetas.xlsx";

const mainPath = resolve(ROOT, MAIN_FILE);
if (!existsSync(mainPath)) {
  console.error(`\n  No encontré "${MAIN_FILE}".`);
  console.error(`  Uso: npm run import "ruta/al/archivo.xlsx"\n`);
  process.exit(1);
}

const fallbackPath = resolve(ROOT, ID_FALLBACK_FILE);
const idsBuffer = existsSync(fallbackPath) ? readFileSync(fallbackPath) : undefined;

let result;
try {
  result = parseWorkbook(readFileSync(mainPath), { idsBuffer, idsSourceName: ID_FALLBACK_FILE });
} catch (error) {
  console.error(`\n  ${error.message}\n`);
  process.exit(1);
}

const { dataset, problems, headerRowNum, itemCount, idsFromFallback } = result;
const { students, phases } = dataset;

/* ────────── salida ────────── */

mkdirSync(resolve(ROOT, "data"), { recursive: true });
writeFileSync(resolve(ROOT, "data/students.json"), JSON.stringify(dataset, null, 2) + "\n", "utf8");

const compact = JSON.stringify(dataset);

// Se respeta lo demás que tengas en .env.local (TUTOR_PASSWORD, DATABASE_URL...):
// solo se reemplaza la línea de STUDENTS_JSON.
const envPath = resolve(ROOT, ".env.local");
const previous = existsSync(envPath) ? readFileSync(envPath, "utf8").split(/\r?\n/) : [];
const kept = previous.filter((line) => line.trim() && !line.startsWith("STUDENTS_JSON="));
writeFileSync(envPath, [...kept, `STUDENTS_JSON=${compact}`, ""].join("\n"), "utf8");

writeFileSync(resolve(ROOT, ".env.value"), compact, "utf8");

/* ────────── informe ────────── */

const allMarks = students.flatMap((s) => s.marks);
const done = allMarks.filter((m) => m === "x").length;
const na = allMarks.filter((m) => m === "/").length;
const notes = allMarks.filter((m) => m !== "" && m !== "x" && m !== "/").length;
const totalItems = allMarks.length;

console.log(`\n  Fuente: ${basename(mainPath)}  (encabezados en la fila ${headerRowNum})`);
console.log(`  ${students.length} estudiantes, ${itemCount} ítems de seguimiento c/u`);
console.log(`  Cédulas: ${idsFromFallback ? `cruzadas por correo con ${ID_FALLBACK_FILE}` : "columna propia del archivo"}`);

console.log(`\n  Fases detectadas:`);
for (const phase of phases) {
  console.log(`    - ${phase.phase} (${phase.items.length} ítem${phase.items.length === 1 ? "" : "s"})`);
}

console.log(`\n  Marcas: ${done} cumplidas, ${notes} con nota, ${na} no aplica, ${totalItems - done - notes - na} pendientes (de ${totalItems})`);
console.log(`\n  -> data/students.json`);

// Vercel admite 64 KB en total entre todas las variables de entorno
const bytes = Buffer.byteLength(compact);
const budget = Math.round((bytes / 65536) * 100);
console.log(`  -> .env.local y .env.value  (${bytes} bytes, ${budget}% del límite de Vercel)`);
if (bytes > 45000) {
  console.log(`\n  ATENCIÓN: el dataset se está acercando al límite de 64 KB de Vercel.`);
  console.log(`  Si ya usas la base de datos, sube el Excel desde el panel y olvídate de este límite.`);
}

if (problems.length) {
  console.log(`\n  ${problems.length} fila(s) omitida(s):`);
  for (const p of problems) console.log(`    - ${p}`);
}

if (idsFromFallback) {
  console.log(`\n  Sugerencia: agrégale una columna "Cédula" a ${basename(mainPath)}`);
  console.log(`  y ${ID_FALLBACK_FILE} deja de hacer falta.`);
}
console.log("");
