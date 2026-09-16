import Image from "next/image";
import FolderLookup from "./folder-lookup";
import FolderGuide from "./folder-guide";
import { announcements, formatDate } from "@/content/announcements";
import { IconArrowRight, IconExternal, IconInfo, IconMegaphone } from "./icons";

const PRACTICE_FORM_URL = "https://forms.gle/zfNnoAdeMBbMUYiS7";

export default function Home() {
  return (
    <div className="page">
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
            Consulta tu carpeta de prácticas, revisa tu avance y descarga los formatos del curso.
          </p>
        </div>
        <p className="course-id" aria-label="UNAD, curso 518024">
          <span>UNAD</span>
          <span>518024</span>
        </p>
      </header>

      <main>
        <div className="workspace">
          <div className="workspace-main">
            <section className="notice" aria-labelledby="formulario-title">
              <span className="notice-icon">
                <IconInfo size={20} />
              </span>
              <div className="notice-body">
                <h2 className="notice-title" id="formulario-title">
                  Registra tu lugar de prácticas
                </h2>
                <p className="notice-text">
                  Antes de consultar tu carpeta, completa el formulario con tu institución de
                  práctica y los datos de contacto del docente titular que te acompañará.
                </p>
              </div>
              <a
                className="btn btn-secondary notice-action"
                href={PRACTICE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir formulario
                <IconExternal size={16} />
              </a>
            </section>

            <FolderLookup />
          </div>

          <aside className="workspace-side">
            <section className="card feed" aria-labelledby="anuncios-title">
              <h2 className="card-title" id="anuncios-title">
                Anuncios
              </h2>

              {announcements.length === 0 ? (
                <p className="feed-empty">Todavía no hay anuncios publicados.</p>
              ) : (
                <ol className="feed-list">
                  {announcements.map((post) => (
                    <li className="feed-item" key={`${post.date}-${post.title}`}>
                      <article>
                        <div className="feed-meta">
                          <span className="feed-avatar">
                            <IconMegaphone size={18} />
                          </span>
                          <div>
                            <p className="feed-author">Tutor del curso</p>
                            <p className="feed-date">
                              <time dateTime={post.date}>{formatDate(post.date)}</time>
                            </p>
                          </div>
                        </div>
                        <h3 className="feed-title">{post.title}</h3>
                        <p className="feed-body">{post.body}</p>
                        {post.link && (
                          <a
                            className="link-action"
                            href={post.link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {post.link.label}
                            <IconArrowRight size={16} />
                          </a>
                        )}
                      </article>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </aside>
        </div>

        <FolderGuide />
      </main>

      <footer className="app-footer">
        <p>
          Cada enlace es personal y se entrega únicamente al documento que le corresponde. No
          compartas tu carpeta con otras personas.
        </p>
        <p>
          ¿Tu documento no aparece o el enlace no abre? Escríbele al tutor del curso para que lo
          revise.
        </p>
      </footer>
    </div>
  );
}
