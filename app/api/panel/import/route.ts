import { importDataset, type Dataset } from "@/lib/course";
import { guard, json } from "@/lib/panel-api";
import { parseWorkbook } from "@/lib/parse-workbook.mjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024;

/** Sube el Excel a la base de datos. */
export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const form = await request.formData().catch(() => null);
  if (!form) return json({ error: "bad_request", message: "No recibimos el archivo." }, 400);

  const file = form.get("file");
  const ids = form.get("ids");
  const overwriteMarks = form.get("overwrite") === "true";

  if (!(file instanceof File) || file.size === 0) {
    return json({ error: "bad_request", message: "Elige el archivo de Excel." }, 400);
  }
  if (file.size > MAX_BYTES) {
    return json({ error: "too_large", message: "El archivo supera los 8 MB." }, 413);
  }

  let parsed;
  try {
    parsed = parseWorkbook(Buffer.from(await file.arrayBuffer()), {
      idsBuffer:
        ids instanceof File && ids.size > 0 ? Buffer.from(await ids.arrayBuffer()) : undefined,
      idsSourceName: ids instanceof File ? ids.name : undefined,
    });
  } catch (error) {
    return json(
      { error: "bad_file", message: error instanceof Error ? error.message : "Archivo ilegible." },
      400
    );
  }

  try {
    const summary = await importDataset(parsed.dataset as Dataset, { overwriteMarks });
    return json({ ok: true, summary, problems: parsed.problems });
  } catch (error) {
    console.error("[panel] import:", error);
    return json({ error: "db_error", message: "No pudimos guardar los datos." }, 500);
  }
}
