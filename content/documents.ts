/**
 * Documentación del curso: formatos y enlaces que sirven en todas las fases.
 *
 * Para cambiar un enlace o agregar un documento, edita esta lista.
 * Todo lo que está aquí es PÚBLICO: lo ve cualquiera que abra la página.
 */

export type CourseDocument = {
  name: string;
  description: string;
  href: string;
  action: string;
  /** "download" muestra una flecha hacia abajo; "external" una flecha hacia afuera */
  icon: "download" | "external";
};

export const documents: CourseDocument[] = [
  {
    name: "Formato de asistencia",
    description: "F-7-6-12. Fases 2 y 3.",
    href: "https://drive.google.com/file/d/1UadYpPG2ze7N0f30BfzzPbo3EO_-wQaH/view?usp=sharing",
    action: "Descargar",
    icon: "download",
  },
  {
    name: "Formato de diario de campo",
    description: "Uno por fase.",
    href: "https://drive.google.com/file/d/1QtYWt1aFG6s5zncfL8In8omOCDWz2XRl/view?usp=sharing",
    action: "Descargar",
    icon: "download",
  },
  {
    name: "Formato de plan de trabajo",
    description: "Fase 2.",
    href: "https://drive.google.com/file/d/1kKqlcI-elVP-aHtKrysHacUhy0b3h4Wd/view?usp=sharing",
    action: "Descargar",
    icon: "download",
  },
  {
    name: "Carta de presentación",
    description: "Se genera en SAI (e-Letter).",
    href: "https://sai.unad.edu.co/e-letter/",
    action: "Abrir SAI",
    icon: "external",
  },
  {
    name: "Comunicado ARL",
    description: "Verifica que tu ARL aparezca activa.",
    href: "https://drive.google.com/file/d/1TEgn7M6DipCK6l5spROUFFtSS75z85fJ/view?usp=sharing",
    action: "Ver",
    icon: "external",
  },
];
