import "server-only";

import { NextResponse } from "next/server";

import { hasDatabase } from "./db";
import { isTutor } from "./tutor-auth";

/** Utilidades comunes de las rutas del panel. */

export const PRIVATE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};

export function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...PRIVATE_HEADERS, ...extra } });
}

/**
 * Devuelve una respuesta de error cuando quien pide no es el tutor o falta la
 * base de datos; `null` cuando puede seguir.
 */
export async function guard(): Promise<NextResponse | null> {
  if (!(await isTutor())) {
    return json({ error: "unauthorized", message: "Inicia sesión para continuar." }, 401);
  }
  if (!hasDatabase) {
    return json(
      {
        error: "no_database",
        message: "Falta configurar la base de datos (DATABASE_URL) en el proyecto.",
      },
      503
    );
  }
  return null;
}
