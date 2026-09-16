"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  IconAlert,
  IconCheck,
  IconCheckCircle,
  IconCopy,
  IconExternal,
  IconMessage,
  IconRestart,
  IconSearch,
} from "./icons";

type ItemState = "pending" | "done" | "na" | "note";

type Item = { label: string; state: ItemState; note: string };
type Phase = { phase: string; items: Item[] };

type Result = {
  name: string;
  url: string;
  group: string;
  comments: string;
  phases: Phase[];
  done: number;
  total: number;
};

type Status = "idle" | "loading" | "found" | "error";

/** Texto para lectores de pantalla: el círculo por sí solo no comunica nada. */
const STATE_LABEL: Record<ItemState, string> = {
  done: "Cumplido",
  pending: "Pendiente",
  na: "No aplica",
  note: "Con observación",
};

/**
 * Cómo se presenta cada respuesta de error de la API. El mensaje sigue
 * viniendo del servidor; esto solo decide el tono y el título.
 */
const ERROR_COPY: Record<string, { tone: "notice" | "error"; title: string }> = {
  not_found: { tone: "notice", title: "Documento no encontrado" },
  invalid_id: { tone: "notice", title: "Revisa el número" },
  rate_limited: { tone: "notice", title: "Demasiados intentos" },
  unavailable: { tone: "error", title: "El listado no está disponible" },
  network: { tone: "error", title: "Sin conexión" },
};
const FALLBACK_ERROR = { tone: "error" as const, title: "No pudimos hacer la consulta" };

/** Los encabezados del Excel se muestran con los nombres de la guía de carpetas. */
const PHASE_NAMES: Record<string, string> = {
  "carpeta administrativa": "Documentos administrativos",
  "fase 4": "Práctica simulada",
};
const phaseName = (name: string) => PHASE_NAMES[name.trim().toLowerCase()] ?? name;

export default function FolderLookup() {
  const [id, setId] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [message, setMessage] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLoading = status === "loading";
  const canSubmit = id.length >= 6 && !isLoading;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("loading");
    setResult(null);
    setMessage("");
    setErrorCode("");
    setCopied(false);

    try {
      // POST, no GET: el documento nunca viaja en la URL, así que no queda
      // en el historial del navegador ni en los logs de acceso.
      const response = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorCode(typeof data?.error === "string" ? data.error : "");
        setMessage(data?.message ?? "No pudimos completar la consulta.");
        return;
      }

      setResult(data as Result);
      setStatus("found");
    } catch {
      setStatus("error");
      setErrorCode("network");
      setMessage("No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.");
    }
  }

  function reset() {
    setId("");
    setStatus("idle");
    setResult(null);
    setMessage("");
    setErrorCode("");
    setCopied(false);
    // El botón que se pulsó desaparece: el foco vuelve al campo
    inputRef.current?.focus();
  }

  async function copyLink() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  const error = ERROR_COPY[errorCode] ?? FALLBACK_ERROR;
  const percent = result && result.total > 0 ? Math.round((result.done / result.total) * 100) : 0;

  return (
    <>
      <section className="card lookup" aria-labelledby="lookup-title">
        <div className="card-head">
          <h2 className="lookup-title" id="lookup-title">
            Consulta tu carpeta
          </h2>
          <p className="card-lede">
            Escribe tu número de documento tal como quedó registrado en el curso, sin puntos ni
            espacios.
          </p>
        </div>

        <form className="lookup-form" onSubmit={handleSubmit} noValidate aria-busy={isLoading}>
          <label className="field-label" htmlFor="documento">
            Número de documento
          </label>

          <div className="lookup-row">
            <div className="input-wrap">
              <IconSearch className="input-icon" size={18} />
              <input
                ref={inputRef}
                className="input"
                id="documento"
                name="documento"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="search"
                placeholder="1234567890"
                aria-describedby="documento-ayuda"
                value={id}
                onChange={(event) => {
                  // Solo dígitos, máximo 12: filtra puntos, comas y espacios al pegar
                  setId(event.target.value.replace(/\D/g, "").slice(0, 12));
                  if (status !== "idle") {
                    setStatus("idle");
                    setResult(null);
                    setMessage("");
                    setErrorCode("");
                  }
                }}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={!canSubmit}>
              {isLoading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Buscando
                </>
              ) : (
                "Ver mi carpeta"
              )}
            </button>
          </div>

          <p className="field-hint" id="documento-ayuda">
            Entre 6 y 12 dígitos. Solo se muestra la carpeta que corresponde a ese documento.
          </p>
        </form>

        <div aria-live="polite">
          {status === "error" && (
            <div className={`alert is-${error.tone}`} role="alert">
              <span className="alert-icon">
                {error.tone === "notice" ? <IconSearch size={20} /> : <IconAlert size={20} />}
              </span>
              <div>
                <p className="alert-title">{error.title}</p>
                <p className="alert-text">{message}</p>
              </div>
            </div>
          )}

          {status === "found" && result && (
            <div className="found">
              <div className="found-head">
                <span className="found-icon">
                  <IconCheckCircle size={22} />
                </span>
                <div className="found-who">
                  <p className="found-title">Carpeta encontrada</p>
                  <p className="found-name">{result.name}</p>
                </div>
                {result.group && <span className="badge">CIPAS {result.group}</span>}
              </div>

              <div className="found-actions">
                <a
                  className="btn btn-primary"
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir mi carpeta
                  <IconExternal size={16} />
                </a>
                <button type="button" className="btn btn-secondary" onClick={copyLink}>
                  {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  {copied ? "Link copiado" : "Copiar link"}
                </button>
                <button type="button" className="btn btn-tertiary" onClick={reset}>
                  <IconRestart size={16} />
                  Consultar otro
                </button>
              </div>

              {result.comments && (
                <div className="tutor-note">
                  <IconMessage size={18} />
                  <div>
                    <p className="tutor-note-label">Nota del tutor</p>
                    <p className="tutor-note-text">{result.comments}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {status === "found" && result && result.total > 0 && (
        <section className="card progress" aria-labelledby="progress-title">
          <div className="progress-head">
            <div>
              <h2 className="card-title" id="progress-title">
                Progreso de tu carpeta
              </h2>
              <p className="progress-count">
                <strong>{result.done}</strong> de {result.total} documentos
              </p>
            </div>
            <span className="progress-pct">{percent}%</span>
          </div>

          <div
            className="bar"
            role="progressbar"
            aria-valuenow={result.done}
            aria-valuemin={0}
            aria-valuemax={result.total}
            aria-label="Avance de tu carpeta"
          >
            <span
              className={percent === 100 ? "bar-fill is-complete" : "bar-fill"}
              style={{ transform: `scaleX(${percent / 100})` }}
            />
          </div>

          <div className="phases">
            {result.phases.map((phase) => {
              const counted = phase.items.filter((item) => item.state !== "na");
              const phaseDone = counted.filter((item) => item.state === "done").length;
              return (
                <div className="phase" key={phase.phase}>
                  <div className="phase-head">
                    <h3 className="phase-title">{phaseName(phase.phase)}</h3>
                    <span className="phase-count">
                      {phaseDone}/{counted.length}
                    </span>
                  </div>
                  <ul className="checks">
                    {phase.items.map((item) => (
                      <li className={`check is-${item.state}`} key={item.label}>
                        <span className="check-mark" aria-hidden="true" />
                        <span className="check-body">
                          <span className="check-label">{item.label}</span>
                          {item.state === "note" && (
                            <span className="check-note">{item.note}</span>
                          )}
                        </span>
                        {item.state === "na" && <span className="badge is-muted">No aplica</span>}
                        <span className="sr-only">, {STATE_LABEL[item.state]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
