import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Acceso al panel del tutor.
 *
 * Una sola credencial, TUTOR_PASSWORD, que vive como variable de entorno en
 * Vercel y nunca en el repositorio. Al entrar se guarda una cookie firmada con
 * esa misma contraseña: cambiarla cierra todas las sesiones abiertas.
 */

const PASSWORD = process.env.TUTOR_PASSWORD?.trim() ?? "";

/** Sin contraseña configurada, el panel queda cerrado para todos. */
export const authConfigured = PASSWORD.length >= 8;

export const SESSION_COOKIE = "tutor_session";
const MAX_AGE_SECONDS = 60 * 60 * 12;

const sign = (payload: string) =>
  createHmac("sha256", PASSWORD).update(payload).digest("base64url");

/** Compara sin filtrar información por el tiempo que tarda. */
function sameString(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function passwordMatches(input: unknown): boolean {
  if (!authConfigured) return false;
  return sameString(String(input ?? ""), PASSWORD);
}

export function createSession(): { value: string; maxAge: number } {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${expires}.${randomBytes(9).toString("base64url")}`;
  return { value: `${payload}.${sign(payload)}`, maxAge: MAX_AGE_SECONDS };
}

export function sessionIsValid(value: string | undefined): boolean {
  if (!authConfigured || !value) return false;

  const cut = value.lastIndexOf(".");
  if (cut < 1) return false;

  const payload = value.slice(0, cut);
  const signature = value.slice(cut + 1);
  if (!sameString(signature, sign(payload))) return false;

  const expires = Number(payload.split(".")[0]);
  return Number.isFinite(expires) && expires > Date.now();
}

/** Para componentes y rutas del servidor: ¿quien pide es el tutor? */
export async function isTutor(): Promise<boolean> {
  const jar = await cookies();
  return sessionIsValid(jar.get(SESSION_COOKIE)?.value);
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
