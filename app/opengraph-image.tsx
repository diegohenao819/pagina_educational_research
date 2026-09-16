import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Vista previa del enlace (Teams, WhatsApp, correo...).
 * Next la genera una sola vez al compilar y la publica en /opengraph-image.
 */

export const alt =
  "Educational Research, UNAD, curso 518024: consulta tu carpeta de prácticas, revisa tu avance y descarga los formatos.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLORS = {
  bg: "#f0f2f5",
  surface: "#ffffff",
  border: "#e4e6eb",
  text: "#1c1e21",
  secondary: "#65676b",
  chipText: "#4b4f56",
  accent: "#b5450c",
  accentSoft: "#fff4ec",
  accentText: "#a13d0a",
};

const svg = (markup: string) => `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`;

// Íconos de trazo, igual que en la página (rejilla de 20 × 20)
const icon = (paths: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="${COLORS.secondary}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
  );

const ICON_FOLDER = icon(
  '<path d="M3.5 6.2A1.7 1.7 0 0 1 5.2 4.5h3l1.6 1.6h5a1.7 1.7 0 0 1 1.7 1.7v6.5a1.7 1.7 0 0 1-1.7 1.7H5.2a1.7 1.7 0 0 1-1.7-1.7Z"/>'
);
const ICON_CHECK = icon('<circle cx="10" cy="10" r="7.25"/><path d="m6.8 10.2 2.2 2.2 4.3-4.5"/>');
const ICON_DOWNLOAD = icon('<path d="M10 3.75v8.75M6.25 8.75 10 12.5l3.75-3.75M4.25 16h11.5"/>');

// La carpeta dorada de la guía, con sus hojas
const FOLDER_ART = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 37 29">
    <path fill="#d99a28" d="M0 3a3 3 0 0 1 3-3h10.2a3 3 0 0 1 2.12.88L17.44 3H33a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3Z"/>
    <g transform="rotate(-5 18 17)"><rect x="7" y="4.2" width="22" height="19" rx="1.6" fill="#fff" stroke="#cfd3d9" stroke-width="0.6"/></g>
    <g transform="rotate(0 18 17)"><rect x="7" y="4.2" width="22" height="19" rx="1.6" fill="#fff" stroke="#cfd3d9" stroke-width="0.6"/><path d="M10.4 7.4h8.8" stroke="#cfd3d9" stroke-width="0.9" stroke-linecap="round"/></g>
    <g transform="rotate(5 18 17)"><rect x="7" y="4.2" width="22" height="19" rx="1.6" fill="#fff" stroke="#cfd3d9" stroke-width="0.6"/><path d="M10.4 7.4h8.8" stroke="#cfd3d9" stroke-width="0.9" stroke-linecap="round"/></g>
    <path fill="#f2c056" d="M0 12a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3Z"/>
  </svg>`
);

function Chip({ icon: src, label }: { icon: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 22px",
        borderRadius: 999,
        background: COLORS.bg,
        color: COLORS.chipText,
        fontSize: 24,
        fontWeight: 600,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} width={26} height={26} alt="" />
      {label}
    </div>
  );
}

export default async function OpengraphImage() {
  const root = process.cwd();
  const [regular, semibold, bold, logo] = await Promise.all([
    readFile(join(root, "assets/fonts/inter-400.woff")),
    readFile(join(root, "assets/fonts/inter-600.woff")),
    readFile(join(root, "assets/fonts/inter-700.woff")),
    readFile(join(root, "public/logo-unad.png")),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 44,
          background: COLORS.bg,
          fontFamily: "Inter",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "44px 56px",
            background: COLORS.surface,
            border: `2px solid ${COLORS.border}`,
            borderRadius: 28,
            boxShadow: "0 2px 6px rgba(16, 24, 40, 0.05)",
          }}
        >
          {/* Encabezado: logo e identificador del curso */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={170} height={120} alt="" />
            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                border: `2px solid ${COLORS.border}`,
                borderRadius: 999,
                fontSize: 26,
                fontWeight: 600,
              }}
            >
              <div style={{ display: "flex", padding: "8px 20px", color: COLORS.secondary }}>UNAD</div>
              <div
                style={{
                  display: "flex",
                  padding: "8px 20px",
                  color: COLORS.accentText,
                  background: COLORS.accentSoft,
                  borderLeft: `2px solid ${COLORS.border}`,
                  borderRadius: "0 999px 999px 0",
                }}
              >
                518024
              </div>
            </div>
          </div>

          {/* Título, propósito y la carpeta de la guía */}
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 76,
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.05,
                  color: COLORS.text,
                }}
              >
                Educational Research
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 18,
                  fontSize: 32,
                  fontWeight: 400,
                  lineHeight: 1.35,
                  color: COLORS.secondary,
                }}
              >
                Consulta tu carpeta de prácticas, revisa tu avance y descarga los formatos del
                curso.
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FOLDER_ART} width={170} height={134} alt="" />
          </div>

          {/* Qué encuentra el estudiante */}
          <div style={{ display: "flex", gap: 14 }}>
            <Chip icon={ICON_FOLDER} label="Tu carpeta" />
            <Chip icon={ICON_CHECK} label="Avance por fases" />
            <Chip icon={ICON_DOWNLOAD} label="Formatos" />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: semibold, weight: 600, style: "normal" },
        { name: "Inter", data: bold, weight: 700, style: "normal" },
      ],
    }
  );
}
