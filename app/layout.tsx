import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Next descarga la fuente al compilar y la sirve desde el mismo dominio:
// el navegador del estudiante no hace ninguna petición a Google.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Educational Research | UNAD",
  description:
    "Espacio del curso Educational Research: consulta de carpetas individuales, avance por fases y anuncios.",
  // Es una herramienta interna del curso, no material para buscadores.
  robots: { index: false, follow: false },
};

// Solo tema claro: también los controles nativos del navegador.
export const viewport: Viewport = {
  themeColor: "#f0f2f5",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
