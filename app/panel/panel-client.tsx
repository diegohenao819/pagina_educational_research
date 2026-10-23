"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { IconAlert, IconCheck, IconRestart, IconSearch, IconUpload } from "../icons";

type RosterRow = {
  id: string;
  name: string;
  group: string;
  done: number;
  total: number;
  hasComments: boolean;
};

type PanelItem = { itemId: number; label: string; mark: string };
type PanelPhase = { phase: string; items: PanelItem[] };

type PanelStudent = {
  id: string;
  name: string;
  email: string;
  url: string;
  group: string;
  comments: string;
  phases: PanelPhase[];
};

type Note = { tone: "ok" | "error"; text: string };

/** Los encabezados del Excel se muestran con los nombres de la guía. */
const PHASE_NAMES: Record<string, string> = {
  "carpeta administrativa": "Documentos administrativos",
  "fase 4": "Práctica simulada",
};
const phaseName = (name: string) => PHASE_NAMES[name.trim().toLowerCase()] ?? name;

const STATES = [
  { value: "", label: "Pendiente" },
  { value: "x", label: "Cumplido" },
  { value: "/", label: "No aplica" },
];

/** Avance de un estudiante, contado igual que en la página pública. */
function progressOf(student: PanelStudent) {
  const items = student.phases.flatMap((phase) => phase.items);
  return {
    done: items.filter((item) => item.mark === "x").length,
    total: items.filter((item) => item.mark !== "/").length,
  };
}

export default function PanelClient({ hasDatabase }: { hasDatabase: boolean }) {
  const router = useRouter();
  const [roster, setRoster] = useState<RosterRow[] | null>(null);
  const [student, setStudent] = useState<PanelStudent | null>(null);
  const [query, setQuery] = useState("");
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const commentsTimer = useRef<number | undefined>(undefined);

  const loadRoster = useCallback(async () => {
    try {
      const response = await fetch("/api/panel/roster", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setNote({ tone: "error", text: data?.message ?? "No pudimos cargar el listado." });
        return;
      }
      setRoster(data.students);
    } catch {
      setNote({ tone: "error", text: "No hay conexión con el servidor." });
    }
  }, []);

  useEffect(() => {
    if (hasDatabase) loadRoster();
  }, [hasDatabase, loadRoster]);

  async function openStudent(id: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/panel/student?id=${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        setNote({ tone: "error", text: data?.message ?? "No pudimos abrir la ficha." });
        return;
      }
      setStudent(data);
    } finally {
      setLoading(false);
    }
  }

  /** Guarda y refleja el cambio de inmediato; si falla, recarga la ficha. */
  async function save(body: Record<string, unknown>, optimistic?: () => void) {
    optimistic?.();
    try {
      const response = await fetch("/api/panel/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        setNote({ tone: "error", text: data?.message ?? "No pudimos guardar." });
        if (student) openStudent(student.id);
        return;
      }
      if (data.student) {
        setStudent(data.student);
        const progress = progressOf(data.student);
        setRoster((rows) =>
          rows?.map((row) =>
            row.id === data.student.id
              ? { ...row, ...progress, hasComments: data.student.comments !== "" }
              : row
          ) ?? rows
        );
      }
      setNote({ tone: "ok", text: "Cambio guardado." });
    } catch {
      setNote({ tone: "error", text: "No hay conexión con el servidor." });
    }
  }

  function setMark(itemId: number, mark: string) {
    if (!student) return;
    save({ id: student.id, itemId, mark }, () =>
      setStudent({
        ...student,
        phases: student.phases.map((phase) => ({
          ...phase,
          items: phase.items.map((item) => (item.itemId === itemId ? { ...item, mark } : item)),
        })),
      })
    );
  }

  function setComments(comments: string) {
    if (!student) return;
    setStudent({ ...student, comments });
    window.clearTimeout(commentsTimer.current);
    commentsTimer.current = window.setTimeout(() => {
      save({ id: student.id, comments });
    }, 800);
  }

  async function handleImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setImporting(true);
    setNote(null);

    try {
      const response = await fetch("/api/panel/import", {
        method: "POST",
        body: new FormData(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setNote({ tone: "error", text: data?.message ?? "No pudimos subir el archivo." });
        return;
      }
      const { students, items, marksCreated, marksOverwritten } = data.summary;
      const omitted = data.problems?.length
        ? ` ${data.problems.length} fila(s) quedaron por fuera.`
        : "";
      setNote({
        tone: "ok",
        text: `${students} estudiantes y ${items} ítems actualizados. ${marksCreated} marcas nuevas, ${marksOverwritten} reemplazadas.${omitted}`,
      });
      form.reset();
      await loadRoster();
      if (student) openStudent(student.id);
    } catch {
      setNote({ tone: "error", text: "No hay conexión con el servidor." });
    } finally {
      setImporting(false);
    }
  }

  async function signOut() {
    await fetch("/api/panel/session", { method: "DELETE" });
    router.refresh();
  }

  if (!hasDatabase) {
    return (
      <section className="card">
        <div className="alert is-error" role="alert">
          <span className="alert-icon">
            <IconAlert size={20} />
          </span>
          <div>
            <p className="alert-title">Falta la base de datos</p>
            <p className="alert-text">
              El proyecto no tiene DATABASE_URL. Conecta la base de datos en Vercel y vuelve a
              desplegar.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const visible = roster?.filter((row) => {
    const text = `${row.name} ${row.id} ${row.group}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });

  return (
    <div className="panel">
      <section className="card panel-import" aria-labelledby="import-title">
        <div className="card-head">
          <h2 className="card-title" id="import-title">
            Actualizar desde el Excel
          </h2>
          <p className="card-lede">
            Sube el archivo de seguimiento. Los nombres, correos y enlaces se actualizan; lo que ya
            marcaste aquí se conserva.
          </p>
        </div>

        <form onSubmit={handleImport} aria-busy={importing}>
          <div className="panel-files">
            <label className="field-label" htmlFor="file">
              Excel de seguimiento
              <input className="panel-file" id="file" name="file" type="file" accept=".xlsx" required />
            </label>
            <label className="field-label" htmlFor="ids">
              Excel con las cédulas (solo si el principal no las trae)
              <input className="panel-file" id="ids" name="ids" type="file" accept=".xlsx" />
            </label>
          </div>

          <label className="panel-check">
            <input type="checkbox" name="overwrite" value="true" />
            Reemplazar también las marcas con lo que diga el Excel
          </label>

          <button type="submit" className="btn btn-primary" disabled={importing}>
            {importing ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Subiendo
              </>
            ) : (
              <>
                <IconUpload size={16} />
                Subir Excel
              </>
            )}
          </button>
        </form>
      </section>

      <div aria-live="polite">
        {note && (
          <div className={note.tone === "ok" ? "alert is-ok" : "alert is-error"} role="status">
            <span className="alert-icon">
              {note.tone === "ok" ? <IconCheck size={20} /> : <IconAlert size={20} />}
            </span>
            <div>
              <p className="alert-text">{note.text}</p>
            </div>
          </div>
        )}
      </div>

      <div className="panel-grid">
        <section className="card panel-roster" aria-labelledby="roster-title">
          <div className="panel-roster-head">
            <h2 className="card-title" id="roster-title">
              Estudiantes
            </h2>
            <span className="count-pill">{roster?.length ?? 0}</span>
          </div>

          <div className="input-wrap panel-search">
            <IconSearch className="input-icon" size={18} />
            <input
              className="input"
              type="search"
              placeholder="Buscar por nombre o documento"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Buscar estudiante"
            />
          </div>

          {!roster && <p className="feed-empty">Cargando listado...</p>}
          {roster?.length === 0 && (
            <p className="feed-empty">Todavía no hay estudiantes. Sube el Excel para empezar.</p>
          )}

          <ul className="roster-list">
            {visible?.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  className={row.id === student?.id ? "roster-item is-active" : "roster-item"}
                  onClick={() => openStudent(row.id)}
                  aria-current={row.id === student?.id}
                >
                  <span className="roster-name">{row.name}</span>
                  <span className="roster-meta">
                    {row.group && <span className="badge is-muted">Grupo {row.group}</span>}
                    <span className="roster-count">
                      {row.done}/{row.total}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card panel-detail" aria-labelledby="detail-title">
          {!student ? (
            <p className="feed-empty" id="detail-title">
              Elige un estudiante del listado para marcar su avance.
            </p>
          ) : (
            <>
              <div className="panel-detail-head">
                <div>
                  <h2 className="card-title" id="detail-title">
                    {student.name}
                  </h2>
                  <p className="progress-count">
                    Documento {student.id}
                    {student.group ? ` | Grupo ${student.group}` : ""}
                  </p>
                </div>
                <a
                  className="btn btn-secondary btn-sm"
                  href={student.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir carpeta
                </a>
              </div>

              {student.phases.map((phase) => (
                <div className="panel-phase" key={phase.phase}>
                  <h3 className="phase-title">{phaseName(phase.phase)}</h3>
                  <ul className="panel-items">
                    {phase.items.map((item) => {
                      const isNote = item.mark !== "" && item.mark !== "x" && item.mark !== "/";
                      return (
                        <li className="panel-item" key={item.itemId}>
                          <span className="panel-item-label">{item.label}</span>
                          <div
                            className="mark-group"
                            role="group"
                            aria-label={`Estado de ${item.label}`}
                          >
                            {STATES.map((state) => (
                              <button
                                key={state.value || "pendiente"}
                                type="button"
                                className="mark-btn"
                                aria-pressed={!isNote && item.mark === state.value}
                                onClick={() => setMark(item.itemId, state.value)}
                              >
                                {state.label}
                              </button>
                            ))}
                          </div>
                          <input
                            className="input panel-item-note"
                            type="text"
                            placeholder="Observación para el estudiante"
                            defaultValue={isNote ? item.mark : ""}
                            key={`${item.itemId}-${item.mark}`}
                            onBlur={(event) => {
                              const value = event.target.value.trim();
                              if (value !== (isNote ? item.mark : "")) setMark(item.itemId, value);
                            }}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              <div className="panel-comments">
                <label className="field-label" htmlFor="comments">
                  Nota del tutor (la ve el estudiante)
                </label>
                <textarea
                  className="input panel-textarea"
                  id="comments"
                  rows={3}
                  value={student.comments}
                  onChange={(event) => setComments(event.target.value)}
                />
              </div>
            </>
          )}
          {loading && <p className="feed-empty">Cargando ficha...</p>}
        </section>
      </div>

      <div className="panel-footer">
        <button type="button" className="btn btn-tertiary" onClick={() => loadRoster()}>
          <IconRestart size={16} />
          Actualizar listado
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={signOut}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
