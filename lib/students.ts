// `server-only` hace que el build FALLE si este módulo se importa, aunque sea
// por accidente, desde un componente de cliente. Es la garantía de que los
// links y el seguimiento nunca terminan en el bundle del navegador.
import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { hasDatabase } from "./db";
import { isHiddenItem } from "./hidden-items.mjs";

/* ────────── forma de los datos que genera `npm run import` ────────── */

/** Marca cruda de una celda: "" pendiente, "x" cumplido, "/" no aplica, otro = nota */
type RawMark = string;

type RawStudent = {
  id: string;
  name: string;
  email: string;
  url: string;
  group: string;
  comments: string;
  marks: RawMark[];
};

type RawDataset = {
  phases: { phase: string; items: string[] }[];
  students: RawStudent[];
};

/* ────────── forma que consume la app ────────── */

export type ItemState = "pending" | "done" | "na" | "note";

export type ProgressItem = {
  label: string;
  state: ItemState;
  /** Texto libre que escribiste en la celda, sólo cuando state === "note" */
  note: string;
};

export type ProgressPhase = {
  phase: string;
  items: ProgressItem[];
};

/** Exactamente lo que la API le devuelve al estudiante. */
export type StudentView = {
  name: string;
  url: string;
  group: string;
  comments: string;
  phases: ProgressPhase[];
  done: number;
  total: number;
};

/** Deja sólo dígitos: acepta "1.234.567.890", "1234567890 " o "1234567890". */
export function normalizeId(input: unknown): string {
  return String(input ?? "").replace(/\D/g, "");
}

export function decodeMark(mark: RawMark): { state: ItemState; note: string } {
  if (mark === "") return { state: "pending", note: "" };
  if (mark === "x") return { state: "done", note: "" };
  if (mark === "/") return { state: "na", note: "" };
  return { state: "note", note: mark };
}

/* ────────── carga ────────── */

type Directory = {
  byId: Map<string, StudentView>;
  size: number;
};

const EMPTY: Directory = { byId: new Map(), size: 0 };

function load(): Directory {
  let raw = process.env.STUDENTS_JSON?.trim();

  // Respaldo para desarrollo local: data/students.json (ignorado por git)
  if (!raw) {
    try {
      raw = readFileSync(join(process.cwd(), "data", "students.json"), "utf8");
    } catch {
      raw = undefined;
    }
  }

  if (!raw) {
    console.error("[students] No hay datos. Define STUDENTS_JSON o corre `npm run import`.");
    return EMPTY;
  }

  let parsed: RawDataset;
  try {
    parsed = JSON.parse(raw) as RawDataset;
  } catch {
    console.error("[students] STUDENTS_JSON no es JSON válido.");
    return EMPTY;
  }

  if (!parsed || !Array.isArray(parsed.students) || !Array.isArray(parsed.phases)) {
    console.error("[students] Formato inesperado. Vuelve a correr `npm run import`.");
    return EMPTY;
  }

  // El esquema de fases/ítems es el mismo para todos: se recorre una vez y se
  // reparten las marcas de cada estudiante en el mismo orden.
  const flatLabels = parsed.phases.flatMap((p) => p.items);

  const byId = new Map<string, StudentView>();

  for (const row of parsed.students) {
    const id = normalizeId(row?.id);
    if (!id || !row?.url) continue;

    const marks = Array.isArray(row.marks) ? row.marks : [];
    if (marks.length !== flatLabels.length) {
      console.warn(
        `[students] ${row.name || id}: ${marks.length} marcas para ${flatLabels.length} ítems.`
      );
    }

    let cursor = 0;
    let done = 0;
    let total = 0;
    const phases: ProgressPhase[] = [];

    for (const phase of parsed.phases) {
      const items: ProgressItem[] = [];
      for (const label of phase.items) {
        // El cursor avanza siempre, aunque el ítem esté oculto: las marcas van
        // en el mismo orden que todas las columnas del JSON.
        const decoded = decodeMark(marks[cursor++] ?? "");
        if (isHiddenItem(phase.phase, label)) continue;
        if (decoded.state === "done") done++;
        // Los ítems marcados "no aplica" no cuentan para el total
        if (decoded.state !== "na") total++;
        items.push({ label, ...decoded });
      }
      if (items.length > 0) phases.push({ phase: phase.phase, items });
    }

    byId.set(id, {
      name: row.name ?? "",
      url: row.url,
      group: row.group ?? "",
      comments: row.comments ?? "",
      phases,
      done,
      total,
    });
  }

  console.log(`[students] ${byId.size} registros, ${flatLabels.length} ítems de seguimiento.`);
  return { byId, size: byId.size };
}

// Se construye una sola vez por instancia serverless y se reutiliza.
let cache: Directory | null = null;

function directory(): Directory {
  if (cache === null) cache = load();
  return cache;
}

/**
 * La base de datos manda, pero solo cuando ya tiene estudiantes: así, mientras
 * no se haya subido el Excel al panel (o si la base falla), la página sigue
 * respondiendo con el JSON y ningún estudiante se queda sin su carpeta.
 */
export async function findStudent(rawId: string): Promise<StudentView | null> {
  if (hasDatabase) {
    try {
      const { fetchStudentView, countStudents } = await import("./course");
      const found = await fetchStudentView(rawId);
      if (found) return found;
      // Con la base poblada, no encontrarlo es la respuesta correcta
      if ((await countStudents()) > 0) return null;
    } catch (error) {
      console.error("[students] la base de datos falló, se usa el respaldo:", error);
    }
  }
  return directory().byId.get(normalizeId(rawId)) ?? null;
}

export async function datasetSize(): Promise<number> {
  if (hasDatabase) {
    try {
      const { countStudents } = await import("./course");
      const count = await countStudents();
      if (count > 0) return count;
    } catch (error) {
      console.error("[students] no se pudo contar en la base:", error);
    }
  }
  return directory().size;
}
