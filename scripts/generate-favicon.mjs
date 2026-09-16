#!/usr/bin/env node
/**
 * Genera app/favicon.ico con el ícono de marca en 16, 32 y 48 px.
 *
 * Uso:  npm run favicon
 *
 * Usa el mismo motor de imágenes que trae Next (@vercel/og) y empaqueta los
 * PNG en un .ico (formato admitido por todos los navegadores actuales).
 */
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/dist/compiled/@vercel/og/index.node.js";
import { brandIcon } from "../lib/brand-icon.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SIZES = [16, 32, 48];

const images = [];
for (const size of SIZES) {
  const response = new ImageResponse(brandIcon(size), { width: size, height: size });
  images.push({ size, png: Buffer.from(await response.arrayBuffer()) });
}

// Cabecera ICO (6 bytes) + una entrada de 16 bytes por imagen + los PNG
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reservado
header.writeUInt16LE(1, 2); // tipo: ícono
header.writeUInt16LE(images.length, 4);

let offset = 6 + 16 * images.length;
const entries = images.map(({ size, png }) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // ancho
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // alto
  entry.writeUInt8(0, 2); // paleta
  entry.writeUInt8(0, 3); // reservado
  entry.writeUInt16LE(1, 4); // planos
  entry.writeUInt16LE(32, 6); // bits por píxel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += png.length;
  return entry;
});

const ico = Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
const out = resolve(ROOT, "app/favicon.ico");
writeFileSync(out, ico);

console.log(`  app/favicon.ico  (${SIZES.join(", ")} px, ${ico.length} bytes)`);
