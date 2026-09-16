import { ImageResponse } from "next/og";
import { brandIcon } from "@/lib/brand-icon.mjs";

/** Ícono al guardar la página en la pantalla de inicio de iPhone / iPad. */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  // iOS redondea las esquinas por su cuenta
  return new ImageResponse(brandIcon(size.width, { rounded: false }), size);
}
