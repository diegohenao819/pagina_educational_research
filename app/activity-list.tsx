import {
  activities,
  activityStatus,
  formatRange,
  type Activity,
  type ActivityStatus,
  type Deliverable,
} from "@/content/activities";
import { IconExternal } from "./icons";

const STATUS_LABEL: Record<ActivityStatus, string> = {
  upcoming: "Próximamente",
  open: "Abierta",
  closed: "Cerrada",
};

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

function DeliverableBox({ item }: { item: Deliverable }) {
  return (
    <div className="deliver-item">
      <p className="deliver-where">
        {item.href ? (
          <a href={item.href} {...external}>
            {item.where}
          </a>
        ) : (
          item.where
        )}
      </p>
      {item.due && <p className="deliver-due">{item.due}</p>}

      {item.file && (
        <p className="deliver-text">
          Un PDF llamado <code className="file-name">{item.file}</code>
        </p>
      )}
      {item.text && <p className="deliver-text">{item.text}</p>}

      {item.documents && (
        <ul className="deliver-docs">
          {item.documents.map((doc) => (
            <li key={doc.name}>
              {doc.href ? (
                <a href={doc.href} {...external}>
                  {doc.name}
                </a>
              ) : (
                <strong>{doc.name}</strong>
              )}
              {doc.note && <span className="deliver-note"> {doc.note}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ActivityCard({ activity, now }: { activity: Activity; now: Date }) {
  const status = activityStatus(activity, now);
  const titleId = `${activity.id}-title`;

  return (
    <article
      className={status === "open" ? "card activity is-open" : "card activity"}
      id={activity.id}
      aria-labelledby={titleId}
    >
      <header className="activity-head">
        <p className="activity-phase">{activity.phase}</p>
        <span className={`badge is-${status}`}>{STATUS_LABEL[status]}</span>
      </header>
      <h3 className="activity-title" id={titleId}>
        {activity.title}
      </h3>
      <p className="activity-dates">
        {formatRange(activity.opens, activity.closes)}
        {activity.meta && `. ${activity.meta}.`}
      </p>

      <p className="activity-summary">{activity.summary}</p>

      {activity.facts && (
        <ul className="activity-list">
          {activity.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      )}

      {activity.links && (
        <div className="activity-links">
          {activity.links.map((link) => (
            <a
              key={link.href}
              className={link.primary ? "chip is-primary" : "chip"}
              href={link.href}
              {...external}
            >
              {link.label}
              <IconExternal size={14} />
            </a>
          ))}
        </div>
      )}

      {activity.steps && (
        <>
          <h4 className="activity-subtitle">Paso a paso</h4>
          <ol className="activity-steps">
            {activity.steps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong> {step.text}
              </li>
            ))}
          </ol>
        </>
      )}

      {activity.deliverables && (
        <>
          <h4 className="activity-subtitle">Qué entregas y dónde</h4>
          <div className="deliver">
            {activity.deliverables.map((item) => (
              <DeliverableBox key={item.where} item={item} />
            ))}
          </div>
        </>
      )}

      {activity.notes && (
        <ul className="activity-notes">
          {activity.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function ActivityList() {
  // La página se regenera cada hora (ver app/page.tsx), así que el estado de
  // cada fase cambia solo cuando abre o cierra.
  const now = new Date();
  return (
    <div className="activities">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} now={now} />
      ))}
    </div>
  );
}
