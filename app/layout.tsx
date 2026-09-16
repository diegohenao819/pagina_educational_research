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

const SITE_URL = "https://educationalresearch.vercel.app";
const TITLE = "Educational Research | UNAD";
const SHARE_DESCRIPTION =
  "Consulta tu carpeta de prácticas con tu número de documento, revisa tu avance por fases y descarga los formatos del curso.";

export const metadata: Metadata = {
  // Base para que la imagen de vista previa se publique con URL absoluta
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description:
    "Espacio del curso Educational Research: consulta de carpetas individuales, avance por fases y anuncios.",
  // Es una herramienta interna del curso, no material para buscadores.
  // (No impide la vista previa en Teams o WhatsApp.)
  robots: { index: false, follow: false },
  // Vista previa al compartir el enlace. La imagen sale de app/opengraph-image.tsx.
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "/",
    siteName: "UNAD",
    title: TITLE,
    description: SHARE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SHARE_DESCRIPTION,
  },
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
