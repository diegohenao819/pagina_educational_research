// `server-only` hace que el build FALLE si este módulo se importa, aunque sea
// por accidente, desde un componente de cliente. Es la garantía de que los
// links y el seguimiento nunca terminan en el bundle del navegador.
import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

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

function decodeMark(mark: RawMark): { state: ItemState; note: string } {
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
    const phases: ProgressPhase[] = parsed.phases.map((phase) => ({
      phase: phase.phase,
      items: phase.items.map((label) => {
        const decoded = decodeMark(marks[cursor++] ?? "");
        if (decoded.state === "done") done++;
        return { label, ...decoded };
      }),
    }));

    byId.set(id, {
      name: row.name ?? "",
      url: row.url,
      group: row.group ?? "",
      comments: row.comments ?? "",
      phases,
      done,
      // Los ítems marcados "no aplica" no cuentan para el total
      total: flatLabels.length - phases.flatMap((p) => p.items).filter((i) => i.state === "na").length,
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

export function findStudent(rawId: string): StudentView | null {
  return directory().byId.get(normalizeId(rawId)) ?? null;
}

export function directorySize(): number {
  return directory().size;
}
