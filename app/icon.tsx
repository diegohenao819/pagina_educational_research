import { ImageResponse } from "next/og";
import { brandIcon } from "@/lib/brand-icon.mjs";

/** Ícono de la pestaña y de las vistas previas (PNG). El .ico está en app/favicon.ico. */

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(brandIcon(size.width), size);
}
