"use client";

import { useState, type FormEvent } from "react";

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

/** Texto para lectores de pantalla — el icono por sí solo no comunica nada. */
const STATE_LABEL: Record<ItemState, string> = {
  done: "Cumplido",
  pending: "Pendiente",
  na: "No aplica",
  note: "Con observación",
};

export default function FolderLookup() {
  const [id, setId] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const isLoading = status === "loading";
  const canSubmit = id.length >= 6 && !isLoading;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("loading");
    setResult(null);
    setMessage("");
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
        setMessage(data?.message ?? "No pudimos completar la consulta.");
        return;
      }

      setResult(data as Result);
      setStatus("found");
    } catch {
      setStatus("error");
      setMessage("No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.");
    }
  }

  function reset() {
    setId("");
    setStatus("idle");
    setResult(null);
    setMessage("");
    setCopied(false);
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

  const percent = result && result.total > 0 ? Math.round((result.done / result.total) * 100) : 0;

  return (
    <section className="card" aria-labelledby="lookup-title">
      <h2 className="card-title" id="lookup-title">
        Consulta tu carpeta
      </h2>
      <p className="card-hint">
        Escribe tu número de documento tal como quedó registrado en el curso, sin puntos ni
        espacios.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <label className="field-label" htmlFor="documento">
          Número de documento
        </label>

        <div className="field-row">
          <input
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
              }
            }}
          />

          <button type="submit" className="btn-primary" disabled={!canSubmit}>
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

        <span className="sr-only" id="documento-ayuda">
          Entre 6 y 12 dígitos. Solo se muestra la carpeta que corresponde a ese documento.
        </span>
      </form>

      <div aria-live="polite" aria-atomic="true">
        {status === "error" && (
          <p className="alert" role="alert">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M8 4.5v4.2M8 11.3v.2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>{message}</span>
          </p>
        )}

        {status === "found" && result && (
          <>
            <div className="result">
              <p className="result-label">Carpeta encontrada</p>
              <p className="result-name">
                {result.name}
                {result.group && <span className="chip">CIPAS {result.group}</span>}
              </p>

              <div className="result-actions">
                <a
                  className="btn-open"
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir mi carpeta
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M5.25 2.5h6.25v6.25M11.5 2.5 5.5 8.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 9.5v2h-7v-7h2"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>

                <button type="button" className="btn-ghost" onClick={copyLink}>
                  {copied ? "Link copiado" : "Copiar link"}
                </button>

                <button type="button" className="btn-ghost" onClick={reset}>
                  Consultar otro
                </button>
              </div>
            </div>

            {result.comments && (
              <div className="note-box">
                <p className="note-label">Nota del tutor</p>
                <p className="note-text">{result.comments}</p>
              </div>
            )}

            {result.total > 0 && (
              <div className="progress">
                <div className="progress-head">
                  <p className="progress-count">
                    <strong>{result.done}</strong> de {result.total} al día
                  </p>
                  <div
                    className="progress-track"
                    role="progressbar"
                    aria-valuenow={result.done}
                    aria-valuemin={0}
                    aria-valuemax={result.total}
                    aria-label="Avance general"
                  >
                    <div className="progress-fill" style={{ width: `${percent}%` }} />
                  </div>
                </div>

                {result.phases.map((phase) => (
                  <div className="phase" key={phase.phase}>
                    <p className="phase-name">{phase.phase}</p>
                    <ul className="items">
                      {phase.items.map((item) => (
                        <li className={`item is-${item.state}`} key={item.label}>
                          <span className="item-mark" aria-hidden="true" />
                          <span className="item-label">{item.label}</span>
                          {item.state === "note" && <span className="item-note">{item.note}</span>}
                          {item.state === "na" && <span className="item-tag">no aplica</span>}
                          <span className="sr-only">— {STATE_LABEL[item.state]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
