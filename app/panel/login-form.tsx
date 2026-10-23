"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { IconAlert, IconInfo } from "../icons";

export default function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password || status === "loading") return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/panel/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setStatus("error");
        setMessage(data?.message ?? "No pudimos iniciar sesión.");
        return;
      }

      setPassword("");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("No hay conexión con el servidor.");
    }
  }

  if (!configured) {
    return (
      <section className="card lookup">
        <div className="alert is-error" role="alert">
          <span className="alert-icon">
            <IconAlert size={20} />
          </span>
          <div>
            <p className="alert-title">Falta configurar la contraseña</p>
            <p className="alert-text">
              Agrega la variable TUTOR_PASSWORD en Vercel (Settings, Environment Variables), con al
              menos 8 caracteres, y vuelve a desplegar el proyecto.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="card lookup panel-login" aria-labelledby="login-title">
      <div className="card-head">
        <h2 className="lookup-title" id="login-title">
          Entrar al panel
        </h2>
        <p className="card-lede">Esta página es solo para el tutor del curso.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate aria-busy={status === "loading"}>
        <label className="field-label" htmlFor="password">
          Contraseña
        </label>
        <div className="lookup-row">
          <div className="input-wrap">
            <input
              className="input panel-password"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (status === "error") setStatus("idle");
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={!password || status === "loading"}
          >
            {status === "loading" ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Entrando
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </div>
      </form>

      <div aria-live="polite">
        {status === "error" && (
          <div className="alert is-error" role="alert">
            <span className="alert-icon">
              <IconInfo size={20} />
            </span>
            <div>
              <p className="alert-title">No pudimos entrar</p>
              <p className="alert-text">{message}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
