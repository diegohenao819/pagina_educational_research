import "server-only";

/**
 * Limitador por IP, en memoria (ventana deslizante simple).
 *
 * OJO: en Vercel cada instancia serverless tiene su propia memoria y las
 * instancias se reciclan, así que esto NO es un límite global estricto:
 * es un freno barato contra fuerza bruta desde una sola máquina.
 * Para algo estricto habría que usar un store compartido (Upstash Redis, etc.).
 */

const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_REQUESTS = 20;          // intentos por IP dentro de la ventana
const MAX_TRACKED_IPS = 5_000;    // techo de memoria

const hits = new Map<string, number[]>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  // Limpieza perezosa para que el Map no crezca sin control
  if (hits.size > MAX_TRACKED_IPS) {
    for (const [k, timestamps] of hits) {
      const fresh = timestamps.filter((t) => t > cutoff);
      if (fresh.length === 0) hits.delete(k);
      else hits.set(k, fresh);
    }
  }

  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);

  if (recent.length >= MAX_REQUESTS) {
    const oldest = recent[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000)),
    };
  }

  recent.push(now);
  hits.set(key, recent);

  return {
    allowed: true,
    remaining: MAX_REQUESTS - recent.length,
    retryAfterSeconds: 0,
  };
}

/** IP del cliente detrás del proxy de Vercel. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "desconocida";
}
