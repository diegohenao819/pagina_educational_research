import "server-only";

import { ensureSchema, hasDatabase, sql, type DbItem } from "./db";
import { isHiddenItem } from "./hidden-items.mjs";
import { decodeMark, normalizeId, type ProgressPhase, type StudentView } from "./students";

/**
 * Consultas del curso contra Postgres.
 *
 * La página pública solo usa `fetchStudentView`, que devuelve exactamente lo
 * mismo que la versión basada en el Excel. El resto lo usa el panel del tutor.
 */

export type RosterRow = {
  id: string;
  name: string;
  group: string;
  done: number;
  total: number;
  hasComments: boolean;
};

export type PanelItem = {
  itemId: number;
  label: string;
  mark: string;
};

export type PanelPhase = { phase: string; items: PanelItem[] };

export type PanelStudent = {
  id: string;
  name: string;
  email: string;
  url: string;
  group: string;
  comments: string;
  phases: PanelPhase[];
};

type ItemRow = { id: number; phase: string; label: string; position: number; mark: string };

/** Agrupa las filas planas de la consulta en fases, respetando el orden. */
function groupByPhase<T extends { phase: string }>(rows: T[]): { phase: string; items: T[] }[] {
  const phases: { phase: string; items: T[] }[] = [];
  for (const row of rows) {
    let phase = phases.find((p) => p.phase === row.phase);
    if (!phase) {
      phase = { phase: row.phase, items: [] };
      phases.push(phase);
    }
    phase.items.push(row);
  }
  return phases;
}

async function studentItems(id: string): Promise<ItemRow[]> {
  const db = sql();
  const rows = (await db.query(
    `select i.id, i.phase, i.label, i.position, coalesce(m.mark, '') as mark
       from items i
       left join marks m on m.item_id = i.id and m.student_id = $1
      order by i.position`,
    [id]
  )) as ItemRow[];
  return rows.filter((row) => !isHiddenItem(row.phase, row.label));
}

/** Ids de los ítems que sí cuentan para el avance. */
async function visibleItemIds(): Promise<number[]> {
  const db = sql();
  const rows = (await db.query(`select id, phase, label from items`)) as Omit<DbItem, "position">[];
  return rows.filter((row) => !isHiddenItem(row.phase, row.label)).map((row) => row.id);
}

/** Lo que ve el estudiante: su carpeta y su avance. Nunca incluye cédula ni correo. */
export async function fetchStudentView(rawId: string): Promise<StudentView | null> {
  await ensureSchema();
  const id = normalizeId(rawId);
  if (!id) return null;

  const db = sql();
  const rows = (await db.query(
    `select name, url, student_group as "group", comments from students where id = $1`,
    [id]
  )) as { name: string; url: string; group: string; comments: string }[];

  const student = rows[0];
  if (!student) return null;

  const items = await studentItems(id);
  let done = 0;
  let total = 0;

  const phases: ProgressPhase[] = groupByPhase(items).map((phase) => ({
    phase: phase.phase,
    items: phase.items.map((row) => {
      const decoded = decodeMark(row.mark);
      if (decoded.state === "done") done++;
      if (decoded.state !== "na") total++;
      return { label: row.label, ...decoded };
    }),
  }));

  return { name: student.name, url: student.url, group: student.group, comments: student.comments, phases, done, total };
}

export async function countStudents(): Promise<number> {
  await ensureSchema();
  const db = sql();
  const rows = (await db.query(`select count(*)::int as n from students`)) as { n: number }[];
  return rows[0]?.n ?? 0;
}

/* ────────── panel del tutor ────────── */

export async function fetchRoster(): Promise<RosterRow[]> {
  await ensureSchema();
  const db = sql();
  const visible = await visibleItemIds();
  return (await db.query(
    `select s.id,
            s.name,
            s.student_group as "group",
            count(*) filter (where m.mark = 'x' and m.item_id = any($1::int[]))::int as done,
            $2::int
              - count(*) filter (where m.mark = '/' and m.item_id = any($1::int[]))::int as total,
            (s.comments <> '') as "hasComments"
       from students s
       left join marks m on m.student_id = s.id
      group by s.id
      order by s.name`,
    [visible, visible.length]
  )) as RosterRow[];
}

export async function fetchPanelStudent(rawId: string): Promise<PanelStudent | null> {
  await ensureSchema();
  const id = normalizeId(rawId);
  if (!id) return null;

  const db = sql();
  const rows = (await db.query(
    `select id, name, email, url, student_group as "group", comments from students where id = $1`,
    [id]
  )) as Omit<PanelStudent, "phases">[];

  const student = rows[0];
  if (!student) return null;

  const items = await studentItems(id);
  return {
    ...student,
    phases: groupByPhase(items).map((phase) => ({
      phase: phase.phase,
      items: phase.items.map((row) => ({ itemId: row.id, label: row.label, mark: row.mark })),
    })),
  };
}

export async function saveMark(rawId: string, itemId: number, mark: string): Promise<void> {
  await ensureSchema();
  const id = normalizeId(rawId);
  const db = sql();
  await db.query(
    `insert into marks (student_id, item_id, mark)
          values ($1, $2, $3)
     on conflict (student_id, item_id)
     do update set mark = excluded.mark, updated_at = now()`,
    [id, itemId, mark.trim().slice(0, 300)]
  );
}

export async function saveComments(rawId: string, comments: string): Promise<void> {
  await ensureSchema();
  const id = normalizeId(rawId);
  const db = sql();
  await db.query(`update students set comments = $2, updated_at = now() where id = $1`, [
    id,
    comments.trim().slice(0, 1000),
  ]);
}

/* ────────── carga desde el Excel ────────── */

export type Dataset = {
  phases: { phase: string; items: string[] }[];
  students: {
    id: string;
    name: string;
    email: string;
    url: string;
    group: string;
    comments: string;
    marks: string[];
  }[];
};

export type ImportSummary = {
  students: number;
  items: number;
  marksCreated: number;
  marksOverwritten: number;
};

/**
 * Sube el contenido del Excel a la base.
 *
 * Por defecto NO toca las marcas que ya existen: lo que marcaste en el panel
 * manda sobre el Excel. Con `overwriteMarks` se reemplazan todas.
 */
export async function importDataset(
  dataset: Dataset,
  { overwriteMarks = false }: { overwriteMarks?: boolean } = {}
): Promise<ImportSummary> {
  await ensureSchema();
  const db = sql();

  // Todo va en tres consultas por bloque: una fila por fila sería medio millar
  // de viajes a la base y la función se quedaría sin tiempo.

  // 1. Ítems, en el orden del Excel
  const flat = dataset.phases.flatMap((phase) =>
    phase.items.map((label) => ({ phase: phase.phase, label }))
  );

  await db.query(
    `insert into items (phase, label, position)
     select * from unnest($1::text[], $2::text[], $3::int[])
     on conflict (phase, label) do update set position = excluded.position`,
    [flat.map((i) => i.phase), flat.map((i) => i.label), flat.map((_, index) => index)]
  );

  const itemRows = (await db.query(`select id, phase, label from items`)) as {
    id: number;
    phase: string;
    label: string;
  }[];
  const itemId = new Map(itemRows.map((row) => [`${row.phase}\u0000${row.label}`, row.id]));

  // 2. Estudiantes. El comentario del Excel solo se usa cuando la fila es nueva:
  // lo que escribas en el panel no se pisa al volver a subir el archivo.
  const rows = dataset.students
    .map((student) => ({ ...student, id: normalizeId(student.id) }))
    .filter((student) => student.id && student.url);

  await db.query(
    `insert into students (id, name, email, url, student_group, comments)
     select * from unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[])
     on conflict (id) do update
        set name = excluded.name,
            email = excluded.email,
            url = excluded.url,
            student_group = excluded.student_group,
            updated_at = now()`,
    [
      rows.map((s) => s.id),
      rows.map((s) => s.name ?? ""),
      rows.map((s) => s.email ?? ""),
      rows.map((s) => s.url),
      rows.map((s) => s.group ?? ""),
      rows.map((s) => s.comments ?? ""),
    ]
  );

  // 3. Marcas
  const markStudent: string[] = [];
  const markItem: number[] = [];
  const markValue: string[] = [];

  for (const student of rows) {
    for (const [index, item] of flat.entries()) {
      const target = itemId.get(`${item.phase}\u0000${item.label}`);
      if (target === undefined) continue;
      markStudent.push(student.id);
      markItem.push(target);
      markValue.push((student.marks?.[index] ?? "").trim().slice(0, 300));
    }
  }

  const conflict = overwriteMarks
    ? `do update set mark = excluded.mark, updated_at = now()`
    : `do nothing`;

  const written = (await db.query(
    `insert into marks (student_id, item_id, mark)
     select * from unnest($1::text[], $2::int[], $3::text[])
     on conflict (student_id, item_id) ${conflict}
     returning (xmax = 0) as inserted`,
    [markStudent, markItem, markValue]
  )) as { inserted: boolean }[];

  return {
    students: rows.length,
    items: flat.length,
    marksCreated: written.filter((row) => row.inserted).length,
    marksOverwritten: written.filter((row) => !row.inserted).length,
  };
}
