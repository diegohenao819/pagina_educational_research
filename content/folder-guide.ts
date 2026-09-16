/**
 * Guía "Qué va en tu carpeta".
 *
 * Para cambiar un texto, un enlace o agregar un documento, edita esta lista.
 * Todo lo que está aquí es PÚBLICO: lo ve cualquiera que abra la página.
 *
 * - kind "rule"  → se marca como "Requisito"
 * - kind "tip"   → se marca como "Recomendación"
 * - kind "info"  → texto sin etiqueta
 * - art          → ilustración que acompaña la nota (ver app/guide-art.tsx)
 */

export type GuideArt = "arl" | "signature" | "hours" | "public-link" | "blur";

export type GuideNote = {
  kind: "rule" | "tip" | "info";
  text: string;
  art?: GuideArt;
};

export type GuideLink = {
  href: string;
  label: string;
  /** "download" muestra una flecha hacia abajo; "external" una flecha hacia afuera */
  icon: "download" | "external";
};

export type GuideDocument = {
  name: string;
  link?: GuideLink;
  notes?: GuideNote[];
};

export type GuideFolder = {
  /** Ancla para enlazar directo: /#carpeta-fase-2 */
  id: string;
  name: string;
  documents: GuideDocument[];
};

const ASISTENCIA: GuideLink = {
  href: "https://drive.google.com/file/d/1UadYpPG2ze7N0f30BfzzPbo3EO_-wQaH/view?usp=sharing",
  label: "Descargar formato",
  icon: "download",
};

export const folderGuide: GuideFolder[] = [
  {
    id: "carpeta-administrativos",
    name: "Documentos administrativos",
    documents: [
      {
        name: "ARL",
        link: {
          href: "https://drive.google.com/file/d/1TEgn7M6DipCK6l5spROUFFtSS75z85fJ/view?usp=sharing",
          label: "Ver comunicado",
          icon: "external",
        },
        notes: [{ kind: "rule", text: "Verifica que aparezca activa.", art: "arl" }],
      },
      {
        name: "Carta de presentación",
        link: {
          href: "https://sai.unad.edu.co/e-letter/",
          label: "Generar en SAI",
          icon: "external",
        },
      },
    ],
  },
  {
    id: "carpeta-fase-2",
    name: "Fase 2",
    documents: [
      {
        name: "Asistencia de 12 horas",
        link: ASISTENCIA,
        notes: [
          {
            kind: "rule",
            text: "Las firmas van a mano. No se aceptan firmas digitales.",
            art: "signature",
          },
          {
            kind: "info",
            text:
              "¿Aún no completas las 12 horas? Sube las que lleves y completa el resto en la Fase 3. Entre las dos fases deben sumar 24.",
            art: "hours",
          },
        ],
      },
      {
        name: "Diario de campo",
        link: {
          href: "https://drive.google.com/file/d/1QtYWt1aFG6s5zncfL8In8omOCDWz2XRl/view?usp=sharing",
          label: "Descargar formato",
          icon: "download",
        },
        notes: [
          { kind: "info", text: "Se entrega un solo diario de campo por fase." },
          {
            kind: "tip",
            text:
              "Lleva un diario personal de cada clase: tendrás la información fresca y podrás ir adelantando las reflexiones.",
          },
          { kind: "rule", text: "Incluye un link público a tus evidencias.", art: "public-link" },
          {
            kind: "rule",
            text: "Verifica que los rostros de los niños estén difuminados (blur).",
            art: "blur",
          },
        ],
      },
      {
        name: "Plan de trabajo",
        link: {
          href: "https://drive.google.com/file/d/1kKqlcI-elVP-aHtKrysHacUhy0b3h4Wd/view?usp=sharing",
          label: "Descargar formato",
          icon: "download",
        },
      },
    ],
  },
  {
    id: "carpeta-fase-3",
    name: "Fase 3",
    documents: [
      {
        name: "Asistencia de 12 horas",
        link: ASISTENCIA,
        notes: [
          {
            kind: "info",
            text:
              "Si en la Fase 2 no alcanzaste las 12 horas, aquí completas las que falten. El total entre las dos fases es de 24.",
          },
        ],
      },
      { name: "Field journal" },
    ],
  },
  {
    id: "carpeta-practica-simulada",
    name: "Práctica simulada",
    documents: [{ name: "Simulador de prácticas" }, { name: "Asistente de prácticas" }],
  },
];

export const guideTotals = {
  folders: folderGuide.length,
  documents: folderGuide.reduce((n, f) => n + f.documents.length, 0),
};
