import { fetchRoster } from "@/lib/course";
import { guard, json } from "@/lib/panel-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Listado de estudiantes con su avance, para el panel. */
export async function GET() {
  const denied = await guard();
  if (denied) return denied;

  try {
    return json({ students: await fetchRoster() });
  } catch (error) {
    console.error("[panel] roster:", error);
    return json({ error: "db_error", message: "No pudimos leer la base de datos." }, 500);
  }
}
