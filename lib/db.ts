import "server-only";

import { neon } from "@neondatabase/serverless";

/**
 * Conexión a Postgres (Neon) y esquema del curso.
 *
 * La página funciona con base de datos o sin ella: si no hay DATABASE_URL,
 * `lib/students.ts` sigue leyendo el JSON generado desde el Excel. Así nada
 * se rompe mientras se hace el cambio.
 */

const CONNECTION =
  process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim() || "";

export const hasDatabase = CONNECTION.length > 0;

let client: ReturnType<typeof neon> | null = null;

export function sql() {
  if (!hasDatabase) throw new Error("No hay base de datos configurada (falta DATABASE_URL).");
  if (!client) client = neon(CONNECTION);
  return client;
}

/* ────────── esquema ────────── */

const SCHEMA = [
  `create table if not exists students (
     id          text primary key,
     name        text not null default '',
     email       text not null default '',
     url         text not null,
     student_group text not null default '',
     comments    text not null default '',
     updated_at  timestamptz not null default now()
   )`,
  `create table if not exists items (
     id       serial primary key,
     phase    text not null,
     label    text not null,
     position int  not null,
     unique (phase, label)
   )`,
  `create table if not exists marks (
     student_id text not null references students(id) on delete cascade,
     item_id    int  not null references items(id)    on delete cascade,
     mark       text not null default '',
     updated_at timestamptz not null default now(),
     primary key (student_id, item_id)
   )`,
  `create index if not exists marks_student_idx on marks (student_id)`,
];

let schemaReady: Promise<void> | null = null;

/** Crea las tablas la primera vez. Es seguro llamarla en cada petición. */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    const db = sql();
    schemaReady = (async () => {
      for (const statement of SCHEMA) await db.query(statement);
    })().catch((error) => {
      schemaReady = null; // que el siguiente intento vuelva a probar
      throw error;
    });
  }
  return schemaReady;
}

/* ────────── tipos ────────── */

export type DbStudent = {
  id: string;
  name: string;
  email: string;
  url: string;
  group: string;
  comments: string;
};

export type DbItem = { id: number; phase: string; label: string; position: number };

export type DbMark = { student_id: string; item_id: number; mark: string };
