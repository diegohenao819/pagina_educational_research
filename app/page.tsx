import FolderLookup from "./folder-lookup";
import FolderGuide from "./folder-guide";
import { announcements, formatDate } from "@/content/announcements";

export default function Home() {
  return (
    <main className="shell">
      <header>
        <p className="eyebrow">UNAD · 518024</p>
        <h1>Educational Research</h1>
        <p className="lede">
          Espacio del curso. Aquí encuentras el enlace a tu carpeta individual y los
          anuncios que vaya publicando a lo largo del semestre.
        </p>
      </header>

      <aside className="callout" aria-labelledby="formulario-title">
        <p className="callout-label">Antes de consultar tu carpeta</p>
        <h2 className="callout-title" id="formulario-title">
          Registra tu lugar de prácticas
        </h2>
        <p className="callout-text">
          Completa el formulario con la información de tu institución de práctica,
          especialmente los datos de contacto del docente titular que te acompañará.
        </p>
        <a
          className="btn-open"
          href="https://forms.gle/zfNnoAdeMBbMUYiS7"
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir formulario
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M5.25 2.5h6.25v6.25M11.5 2.5 5.5 8.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 9.5v2h-7v-7h2"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </aside>

      <FolderLookup />

      <FolderGuide />

      <section className="section" aria-labelledby="anuncios-title">
        <h2 className="section-title" id="anuncios-title">
          Anuncios
        </h2>

        {announcements.length === 0 ? (
          <p className="empty">Todavía no hay anuncios publicados.</p>
        ) : (
          announcements.map((post) => (
            <article className="post" key={`${post.date}-${post.title}`}>
              <p className="post-date">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </p>
              <h3 className="post-title">{post.title}</h3>
              <p className="post-body">{post.body}</p>
              {post.link && (
                <a
                  className="post-link"
                  href={post.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {post.link.label} →
                </a>
              )}
            </article>
          ))
        )}
      </section>

      <footer>
        <p>
          Cada enlace es personal y se entrega únicamente al documento que le corresponde.
          No compartas tu carpeta con otras personas.
        </p>
        <p>
          ¿Tu documento no aparece o el enlace no abre? Escríbele al tutor del curso para
          que lo revise.
        </p>
      </footer>
    </main>
  );
}
