import { createElement as h } from "react";

/**
 * Ícono de marca: carpeta blanca sobre el naranja UNAD.
 *
 * Lo usan app/icon.tsx (pestaña), app/apple-icon.tsx (iPhone / iPad) y
 * scripts/generate-favicon.mjs (favicon.ico). Si cambias el diseño aquí,
 * vuelve a correr `npm run favicon` para regenerar el .ico.
 */

export const BRAND_ORANGE = "#b5450c";

const FOLDER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 37 29">
    <path fill="#ffffff" fill-opacity="0.62" d="M0 3a3 3 0 0 1 3-3h10.2a3 3 0 0 1 2.12.88L17.44 3H33a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3Z"/>
    <path fill="#ffffff" d="M0 12a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3Z"/>
  </svg>`
)}`;

/**
 * @param {number} size Lado del ícono en píxeles.
 * @param {{ rounded?: boolean }} [options] Sin esquinas redondeadas para iOS,
 *   que aplica su propia máscara.
 */
export function brandIcon(size, { rounded = true } = {}) {
  const width = Math.round(size * 0.625);
  const height = Math.round((width * 29) / 37);

  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND_ORANGE,
        borderRadius: rounded ? Math.round(size * 0.22) : 0,
      },
    },
    h("img", { src: FOLDER_SVG, width, height, alt: "" })
  );
}
