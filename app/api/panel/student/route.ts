import { fetchPanelStudent, saveComments, saveMark } from "@/lib/course";
import { guard, json } from "@/lib/panel-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Ficha de un estudiante con sus ítems. */
export async function GET(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const id = new URL(request.url).searchParams.get("id") ?? "";

  try {
    const student = await fetchPanelStudent(id);
    if (!student) return json({ error: "not_found", message: "No encontramos ese documento." }, 404);
    return json(student);
  } catch (error) {
    console.error("[panel] student:", error);
    return json({ error: "db_error", message: "No pudimos leer la base de datos." }, 500);
  }
}

/** Guardar una marca o la nota del tutor. */
export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as
    | { id?: string; itemId?: number; mark?: string; comments?: string }
    | null;

  if (!body?.id) return json({ error: "bad_request", message: "Falta el documento." }, 400);

  try {
    if (typeof body.comments === "string") {
      await saveComments(body.id, body.comments);
    } else if (typeof body.itemId === "number") {
      await saveMark(body.id, body.itemId, typeof body.mark === "string" ? body.mark : "");
    } else {
      return json({ error: "bad_request", message: "Nada que guardar." }, 400);
    }

    const student = await fetchPanelStudent(body.id);
    return json({ ok: true, student });
  } catch (error) {
    console.error("[panel] save:", error);
    return json({ error: "db_error", message: "No pudimos guardar el cambio." }, 500);
  }
}
