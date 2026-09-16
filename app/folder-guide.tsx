import type { ReactNode } from "react";
import { folderGuide, guideTotals, type GuideArt, type GuideNote } from "@/content/folder-guide";
import GuideMotion from "./guide-motion";
import {
  ArlArt,
  BlurArt,
  DocIcon,
  FolderIcon,
  FolderMap,
  HoursArt,
  PublicLinkArt,
  SignatureArt,
  plural,
} from "./guide-art";
import { IconDownload, IconExternal } from "./icons";

type ArtSpec = {
  render: () => ReactNode;
  /** Descripción para lectores de pantalla */
  label: string;
  /** Cuánto dura la animación, para devolverla a su estado quieto */
  duration?: number;
  /** Ocupa todo el ancho en lugar de ir al lado del texto */
  wide?: boolean;
};

const ART: Record<GuideArt, ArtSpec> = {
  arl: {
    render: () => <ArlArt />,
    label: "Certificado de ARL con el estado Activa.",
    duration: 3200,
  },
  signature: {
    render: () => <SignatureArt />,
    label: "Formato de asistencia firmado a mano en cada fila.",
    duration: 1700,
  },
  hours: {
    render: () => <HoursArt firstPhase={9} />,
    label:
      "Ejemplo: 9 horas en la Fase 2; las 3 que faltan pasan a la Fase 3, que suma 15. Total: 24 horas.",
    duration: 3600,
    wide: true,
  },
  "public-link": {
    render: () => <PublicLinkArt />,
    label: "Enlace con acceso público: cualquiera con el enlace puede verlo.",
  },
  blur: {
    render: () => <BlurArt />,
    label: "Foto de dos niños con los rostros difuminados.",
    duration: 2300,
  },
};

const TAG: Record<GuideNote["kind"], string | null> = {
  rule: "Requisito",
  tip: "Recomendación",
  info: null,
};

function Note({ note }: { note: GuideNote }) {
  const art = note.art ? ART[note.art] : null;
  const tag = TAG[note.kind];
  const classes = ["note", art && "has-art", art?.wide && "is-wide"].filter(Boolean).join(" ");

  return (
    <li className={classes}>
      <p className="note-text">
        {tag && <span className={`badge is-${note.kind}`}>{tag}</span>}
        {note.text}
      </p>
      {art && (
        <figure
          className="example"
          role="img"
          aria-label={art.label}
          {...(art.duration
            ? { "data-motion": "idle", "data-replay": "", "data-duration": art.duration }
            : {})}
        >
          {art.render()}
        </figure>
      )}
    </li>
  );
}

export default function FolderGuide() {
  return (
    <section className="guide" id="guia" aria-labelledby="guia-title">
      <GuideMotion>
        <div className="guide-layout">
          <div className="guide-side">
            <div className="card guide-intro">
              <h2 className="section-title" id="guia-title">
                Qué va en tu carpeta
              </h2>
              <p className="card-lede">
                Tu carpeta se organiza en {guideTotals.folders} subcarpetas con{" "}
                {guideTotals.documents} documentos en total. Revisa qué va en cada una, descarga los
                formatos y ten presentes las aclaraciones antes de subir tus archivos.
              </p>

              <figure className="guide-map" data-motion="idle" data-duration="1700">
                <FolderMap
                  folders={folderGuide.map((f) => ({
                    id: f.id,
                    name: f.name,
                    count: f.documents.length,
                  }))}
                />
                <figcaption>Elige una subcarpeta para ir a su detalle.</figcaption>
              </figure>

              <ul className="legend">
                <li>
                  <span className="badge is-rule">Requisito</span>
                  Lo que debe cumplir el documento.
                </li>
                <li>
                  <span className="badge is-tip">Recomendación</span>
                  Una sugerencia para hacerlo mejor.
                </li>
              </ul>
            </div>
          </div>

          <ol className="phase-list">
            {folderGuide.map((folder) => (
              <li className="card phase-card" id={folder.id} key={folder.id}>
                <div className="phase-card-head">
                  <FolderIcon papers={folder.documents.length} />
                  <h3 className="phase-card-title">{folder.name}</h3>
                  <span className="count-pill">{plural(folder.documents.length)}</span>
                </div>

                <ul className="doc-list">
                  {folder.documents.map((doc) => (
                    <li className="doc" key={doc.name}>
                      <div className="doc-head">
                        <DocIcon />
                        <h4 className="doc-name">{doc.name}</h4>
                        {doc.link && (
                          <a
                            className="btn btn-secondary btn-sm doc-action"
                            href={doc.link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${doc.link.label}: ${doc.name} (se abre en otra pestaña)`}
                          >
                            {doc.link.icon === "download" ? (
                              <IconDownload size={16} />
                            ) : (
                              <IconExternal size={16} />
                            )}
                            {doc.link.label}
                          </a>
                        )}
                      </div>

                      {doc.notes && doc.notes.length > 0 && (
                        <ul className="doc-notes">
                          {doc.notes.map((note) => (
                            <Note note={note} key={note.text} />
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </GuideMotion>
    </section>
  );
}
