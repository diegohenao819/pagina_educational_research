import { ImageResponse } from "next/og";

/** Ícono de la pestaña y de las vistas previas: carpeta blanca sobre el naranja UNAD. */

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

const FOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 37 29">
    <path fill="#ffffff" fill-opacity="0.62" d="M0 3a3 3 0 0 1 3-3h10.2a3 3 0 0 1 2.12.88L17.44 3H33a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3Z"/>
    <path fill="#ffffff" d="M0 12a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3Z"/>
  </svg>`
)}`;

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#b5450c",
          borderRadius: 14,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={FOLDER} width={40} height={31} alt="" />
      </div>
    ),
    size
  );
}
