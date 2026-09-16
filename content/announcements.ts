/**
 * Anuncios del curso.
 *
 * Para publicar algo nuevo: agrega un objeto ARRIBA en la lista y despliega
 * (`git push` si el proyecto está conectado a Vercel). El más reciente va primero.
 *
 * `link` es opcional. Todo lo que pongas aquí es PÚBLICO: cualquiera que entre
 * a la página lo puede leer. Los enlaces privados de carpetas no van aquí.
 */

export type Announcement = {
  /** Fecha en formato AAAA-MM-DD */
  date: string;
  title: string;
  body: string;
  link?: { label: string; href: string };
};

export const announcements: Announcement[] = [
  {
    date: "2026-09-15",
    title: "Carpetas individuales habilitadas",
    body:
      "Ya puedes consultar el enlace de tu carpeta personal con tu número de documento en el buscador de arriba. Si tus datos no aparecen, escríbeme y lo reviso.",
  },
];

/** "2026-09-15" -> "15 sep 2026" (sin depender de la zona horaria del navegador) */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const months = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  if (!year || !month || !day) return iso;
  return `${day} ${months[month - 1]} ${year}`;
}
