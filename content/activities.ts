/**
 * Actividades del curso, de la más reciente a la más vieja.
 *
 * Para agregar una fase nueva, pon un objeto ARRIBA en la lista. El estado
 * (Próximamente, Abierta, Cerrada) se calcula solo con `opens` y `closes`.
 * Todo lo que está aquí es PÚBLICO: lo ve cualquiera que abra la página.
 */

export type ActivityLink = {
  label: string;
  href: string;
  /** El enlace más importante de la fase: se pinta como botón naranja */
  primary?: boolean;
};

export type DeliverableDocument = {
  name: string;
  href?: string;
  note?: string;
};

export type Deliverable = {
  where: string;
  /** Enlace al lugar de entrega (tarea o foro del campus) */
  href?: string;
  due?: string;
  text?: string;
  /** Nombre exacto del archivo que se entrega */
  file?: string;
  documents?: DeliverableDocument[];
};

export type Activity = {
  /** Ancla para enlazar directo: /#fase-3 */
  id: string;
  phase: string;
  title: string;
  /** Fecha y hora de Colombia, en formato ISO */
  opens: string;
  closes: string;
  meta?: string;
  summary: string;
  facts?: string[];
  links?: ActivityLink[];
  steps?: { title: string; text: string }[];
  deliverables?: Deliverable[];
  notes?: string[];
};

const CAMPUS = "https://campus155.unad.edu.co/ses121/mod";

const FORMATS = {
  attendance: "https://drive.google.com/file/d/1UadYpPG2ze7N0f30BfzzPbo3EO_-wQaH/view?usp=sharing",
  fieldJournal: "https://drive.google.com/file/d/1QtYWt1aFG6s5zncfL8In8omOCDWz2XRl/view?usp=sharing",
  workPlan: "https://drive.google.com/file/d/1kKqlcI-elVP-aHtKrysHacUhy0b3h4Wd/view?usp=sharing",
};

export const activities: Activity[] = [
  {
    id: "fase-3",
    phase: "Fase 3",
    title: "Practical component: educational and pedagogical practice",
    opens: "2026-10-05T00:00:00-05:00",
    closes: "2026-11-01T23:55:00-05:00",
    meta: "Individual, 130 puntos",
    summary:
      "Analizas tu diario de campo de la Fase 2: eliges fragmentos, les pones códigos, los agrupas en categorías y explicas qué significan para tu práctica.",
    links: [
      {
        label: "Plantilla (Anexo 1)",
        href: "https://docs.google.com/document/d/1yKrFx5P6mC8EiHTqDAsIl7AopyGwVJUh/edit?usp=sharing",
        primary: true,
      },
      {
        label: "Lista de chequeo",
        href: "https://drive.google.com/file/d/13KxLB5Bt3JcIL7sdJhLA8G3qeh1T_yV1/view?usp=sharing",
      },
      { label: "Guía de la actividad", href: `${CAMPUS}/resource/view.php?id=4589` },
    ],
    steps: [
      {
        title: "Anonimiza tu diario.",
        text: "Cambia los nombres por códigos: S1, S2, Teacher A, School A.",
      },
      {
        title: "Llena la matriz de 4 columnas.",
        text: "Fragmento textual, código, categoría e interpretación. Entre 7 y 10 filas.",
      },
      {
        title: "Escribe el análisis.",
        text: "Unas 500 palabras en tus propias palabras, con autores citados en APA 7.",
      },
      {
        title: "Guarda capturas del proceso.",
        text: "Si usas IA, van en el Apéndice A (figuras A1 a A4).",
      },
      { title: "Participa en el foro.", text: "Publica tu matriz y responde a 2 compañeros." },
    ],
    deliverables: [
      {
        where: "Campus",
        href: `${CAMPUS}/assign/view.php?id=4594`,
        due: "Hasta el 1 nov",
        file: "518024 - Phase 3 - Your Full Name.pdf",
        text: "Portada, matriz, análisis, evidencias, referencias y asistencia a ÉPICA y CIPAS.",
      },
      {
        where: "Tu carpeta",
        due: "Hasta el 1 nov",
        documents: [
          { name: "Anexo 2: asistencia de 12 horas", href: FORMATS.attendance },
          { name: "Anexo 3: field journal", href: FORMATS.fieldJournal, note: "Con todas tus sesiones." },
        ],
      },
      {
        where: "Foro",
        href: `${CAMPUS}/forum/view.php?id=4592`,
        due: "Hasta el 29 oct",
        text: "Tu matriz y 2 respuestas a compañeros, escritas por ti.",
      },
    ],
    notes: [
      "¿Te faltan horas de la Fase 2? Complétalas ahora: 24 horas en total al cierre de la Fase 3.",
      "ÉPICA sobre IA en investigación cualitativa: 24 oct, 10:00 a.m.",
      "La IA puede ayudarte con las columnas 1 a 3. La interpretación y el análisis son tuyos: más de 15 % de similitud en Turnitin, incluido texto de IA, es 0.",
    ],
  },
  {
    id: "fase-2",
    phase: "Fase 2",
    title: "Practical component: educational and pedagogical practice",
    opens: "2026-08-31T00:00:00-05:00",
    closes: "2026-10-04T23:55:00-05:00",
    summary: "Usa instrumentos de recolección de datos en tu contexto educativo de práctica.",
    links: [
      { label: "Guía de la actividad", href: `${CAMPUS}/resource/view.php?id=4583` },
      { label: "Rúbrica y entrega", href: `${CAMPUS}/assign/view.php?id=4587` },
    ],
    deliverables: [
      {
        where: "Tu carpeta",
        documents: [
          {
            name: "Asistencia de 12 horas",
            href: FORMATS.attendance,
            note: "Firmas a mano, no digitales.",
          },
          {
            name: "Diario de campo",
            href: FORMATS.fieldJournal,
            note: "Con link público a tus evidencias y rostros de los niños difuminados.",
          },
          { name: "Plan de trabajo", href: FORMATS.workPlan },
        ],
      },
      {
        where: "Campus",
        href: `${CAMPUS}/assign/view.php?id=4587`,
        file: "518024 - Phase 2 - Your Full Name.pdf",
        text: "Con el formato de la guía.",
      },
    ],
  },
  {
    id: "fase-1",
    phase: "Fase 1",
    title: "Alignment and theoretical foundations of the qualitative research",
    opens: "2026-08-17T00:00:00-05:00",
    closes: "2026-09-01T23:55:00-05:00",
    summary:
      "Cuestionario sobre las diferencias entre métodos y diseños cualitativos, cuantitativos y mixtos.",
    facts: [
      "8 preguntas de selección múltiple con única respuesta",
      "60 minutos y 2 intentos (cuenta la nota más alta)",
      "25 de 500 puntos",
    ],
    links: [{ label: "Cuestionario en el campus", href: `${CAMPUS}/quiz/view.php?id=9866` }],
  },
];

export type ActivityStatus = "upcoming" | "open" | "closed";

export function activityStatus(activity: Activity, now: Date): ActivityStatus {
  if (now < new Date(activity.opens)) return "upcoming";
  if (now > new Date(activity.closes)) return "closed";
  return "open";
}

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "2026-10-05T00:00:00-05:00" -> [5, "oct", 2026], leído en hora de Colombia */
function parts(iso: string): [number, string, number] {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return [day, MONTHS[month - 1], year];
}

/** "5 oct a 1 nov 2026" */
export function formatRange(opens: string, closes: string): string {
  const [d1, m1, y1] = parts(opens);
  const [d2, m2, y2] = parts(closes);
  return y1 === y2 ? `${d1} ${m1} a ${d2} ${m2} ${y2}` : `${d1} ${m1} ${y1} a ${d2} ${m2} ${y2}`;
}
