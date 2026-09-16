import { NextResponse } from "next/server";
import { findStudent, normalizeId, directorySize } from "@/lib/students";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

// Nunca cachear ni prerenderizar: la respuesta depende del cuerpo del POST.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Piso de latencia: iguala el tiempo de acierto y de fallo, y frena el barrido. */
const MIN_RESPONSE_MS = 400;

const PRIVATE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};

function reply(body: unknown, status: number, extra: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...PRIVATE_HEADERS, ...extra } });
}

export async function POST(request: Request) {
  const startedAt = Date.now();

  // Espera hasta completar el piso de latencia antes de contestar
  const settle = async <T,>(response: T): Promise<T> => {
    const elapsed = Date.now() - startedAt;
    if (elapsed < MIN_RESPONSE_MS) {
      await new Promise((r) => setTimeout(r, MIN_RESPONSE_MS - elapsed));
    }
    return response;
  };

  const ip = clientIp(request.headers);
  const limit = checkRateLimit(ip);

  if (!limit.allowed) {
    return settle(
      reply(
        {
          error: "rate_limited",
          message: `Demasiados intentos. Vuelve a intentarlo en ${Math.ceil(
            limit.retryAfterSeconds / 60
          )} minuto(s).`,
        },
        429,
        { "Retry-After": String(limit.retryAfterSeconds) }
      )
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return settle(reply({ error: "bad_request", message: "Solicitud inválida." }, 400));
  }

  const id = normalizeId((payload as { id?: unknown } | null)?.id);

  if (id.length < 6 || id.length > 12) {
    return settle(
      reply(
        {
          error: "invalid_id",
          message: "Escribe tu número de documento (entre 6 y 12 dígitos, sin puntos ni comas).",
        },
        400
      )
    );
  }

  if (directorySize() === 0) {
    console.error("[lookup] El directorio está vacío: revisa STUDENTS_JSON.");
    return settle(
      reply(
        {
          error: "unavailable",
          message: "El listado no está disponible en este momento. Escríbele al tutor.",
        },
        503
      )
    );
  }

  const student = findStudent(id);

  if (!student) {
    // Nunca se registra el número consultado (dato personal).
    return settle(
      reply(
        {
          error: "not_found",
          message:
            "No encontramos ese documento en el listado del curso. Revisa los dígitos o escríbele al tutor.",
        },
        404
      )
    );
  }

  // Sólo se devuelve el registro que coincide. `student` ya viene recortado
  // a lo que el estudiante puede ver: nunca lleva cédula ni correo.
  return settle(reply(student, 200));
}

/** Un GET no debe poder filtrar nada ni dejar cédulas en la URL. */
export function GET() {
  return reply({ error: "method_not_allowed" }, 405, { Allow: "POST" });
}
