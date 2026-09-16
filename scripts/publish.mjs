#!/usr/bin/env node
/**
 * Publica una actualización completa:
 *   1. Relee el Excel  ->  data/students.json + .env.value
 *   2. Reemplaza la variable STUDENTS_JSON en Vercel (producción)
 *   3. Despliega
 *
 * Uso:  npm run publish
 *
 * Requiere haber corrido antes `npx vercel login` y `npx vercel link`.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_VALUE = resolve(ROOT, ".env.value");

const run = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", shell: true, ...opts });

function step(n, text) {
  console.log(`\n\x1b[1m[${n}/3] ${text}\x1b[0m`);
}

/* 1. Importar */
step(1, "Leyendo el Excel...");
if (run("node", ["scripts/import-excel.mjs"]).status !== 0) {
  console.error("\n  La importación falló. No se publicó nada.\n");
  process.exit(1);
}

if (!existsSync(ENV_VALUE)) {
  console.error("\n  No se generó .env.value. No se publicó nada.\n");
  process.exit(1);
}

/* 2. Actualizar la variable de entorno */
step(2, "Actualizando STUDENTS_JSON en Vercel...");

// Si la variable no existe todavía, `rm` falla: es esperable y no importa.
run("npx", ["vercel", "env", "rm", "STUDENTS_JSON", "production", "--yes"], {
  stdio: ["ignore", "ignore", "ignore"],
});

const added = run("npx", ["vercel", "env", "add", "STUDENTS_JSON", "production"], {
  input: readFileSync(ENV_VALUE),
  stdio: ["pipe", "inherit", "inherit"],
});

if (added.status !== 0) {
  console.error("\n  No se pudo guardar la variable en Vercel.");
  console.error("  ¿Ya corriste `npx vercel login` y `npx vercel link`?\n");
  process.exit(1);
}

/* 3. Desplegar */
step(3, "Desplegando...");
if (run("npx", ["vercel", "--prod"]).status !== 0) {
  console.error("\n  El despliegue falló.\n");
  process.exit(1);
}

console.log("\n  Listo. La página ya tiene los datos actualizados.\n");
