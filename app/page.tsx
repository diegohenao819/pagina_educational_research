import Image from "next/image";
import FolderLookup from "./folder-lookup";
import ActivityList from "./activity-list";
import { documents } from "@/content/documents";
import { IconDownload, IconExternal } from "./icons";

const PRACTICE_FORM_URL = "https://forms.gle/zfNnoAdeMBbMUYiS7";

// El estado de cada fase (Abierta, Cerrada) depende de la fecha:
// la página se vuelve a generar cada hora.
export const revalidate = 3600;

export default function Home() {
  return (
    <div className="page page-home">
      <header className="card app-header">
        <Image
          className="app-logo"
          src="/logo-unad.png"
          alt="Logo de la UNAD, Universidad Nacional Abierta y a Distancia, acreditada en alta calidad"
          width={427}
          height={302}
          priority
        />
        <div className="app-heading">
          <h1 className="app-title">Educational Research</h1>
          <p className="app-subtitle">
            Consulta tu carpeta, revisa las actividades y descarga los formatos del curso.
          </p>
        </div>
        <p className="course-id" aria-label="UNAD, curso 518024">
          <span>UNAD</span>
          <span>518024</span>
        </p>
      </header>

      <nav className="section-nav" aria-label="Secciones de la página">
        <a href="#carpeta">Mi carpeta</a>
        <a href="#actividades">Actividades</a>
        <a href="#documentacion">Documentación</a>
      </nav>

      <main>
        <section className="home-section" id="carpeta" aria-label="Consulta tu carpeta">
          <FolderLookup
            note={
              <>
                Antes de consultar, registra tu lugar de prácticas en el{" "}
                <a href={PRACTICE_FORM_URL} target="_blank" rel="noopener noreferrer">
                  formulario
                </a>
                .
              </>
            }
          />
        </section>

        <section className="home-section" id="actividades" aria-labelledby="actividades-title">
          <h2 className="section-title" id="actividades-title">
            Actividades
          </h2>
          <ActivityList />
        </section>

        <section className="home-section" id="documentacion" aria-labelledby="documentacion-title">
          <h2 className="section-title" id="documentacion-title">
            Documentación
          </h2>
          <ul className="card doc-list">
            {documents.map((doc) => (
              <li className="doc-row" key={doc.name}>
                <div>
                  <p className="doc-name">{doc.name}</p>
                  <p className="doc-description">{doc.description}</p>
                </div>
                <a
                  className="link-action"
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {doc.action}
                  {doc.icon === "download" ? <IconDownload size={16} /> : <IconExternal size={16} />}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="app-footer">
        <p>
          Tu enlace es personal: no compartas tu carpeta. ¿Tu documento no aparece o el enlace no
          abre? Escríbele al tutor del curso.
        </p>
      </footer>
    </div>
  );
}
