import { cookies } from "next/headers";

import { json } from "@/lib/panel-api";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import {
  authConfigured,
  createSession,
  passwordMatches,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/tutor-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Entrar al panel. */
export async function POST(request: Request) {
  const limit = checkRateLimit(`panel:${clientIp(request.headers)}`);
  if (!limit.allowed) {
    return json(
      {
        error: "rate_limited",
        message: `Demasiados intentos. Vuelve a intentarlo en ${Math.ceil(
          limit.retryAfterSeconds / 60
        )} minuto(s).`,
      },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) }
    );
  }

  if (!authConfigured) {
    return json(
      {
        error: "not_configured",
        message:
          "El panel todavía no tiene contraseña. Agrega TUTOR_PASSWORD en Vercel y vuelve a desplegar.",
      },
      503
    );
  }

  const body = await request.json().catch(() => null);

  // Mismo freno que en la consulta de carpetas: la fuerza bruta se vuelve lenta
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (!passwordMatches((body as { password?: unknown } | null)?.password)) {
    return json({ error: "bad_password", message: "Contraseña incorrecta." }, 401);
  }

  const session = createSession();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, session.value, { ...SESSION_COOKIE_OPTIONS, maxAge: session.maxAge });

  return json({ ok: true });
}

/** Salir del panel. */
export async function DELETE() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  return json({ ok: true });
}
