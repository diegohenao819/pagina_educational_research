import type { CSSProperties } from "react";

/**
 * Ilustraciones de la guía de carpetas.
 *
 * Todas se dibujan en su estado FINAL por defecto (así se ven sin JavaScript o
 * con movimiento reducido). La animación solo existe cuando `guide-motion.tsx`
 * marca la figura con data-motion="armed" / "play"; ver globals.css.
 */

const vars = (values: Record<string, string>) => values as CSSProperties;
const ms = (value: number) => `${Math.round(value)}ms`;

export const plural = (n: number) => (n === 1 ? "1 documento" : `${n} documentos`);

/* ────────── carpeta con hojas ────────── */

const FOLDER_BACK =
  "M0 3a3 3 0 0 1 3-3h10.2a3 3 0 0 1 2.12.88L17.44 3H33a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3Z";
const FOLDER_FRONT = "M0 12a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3Z";

/** Carpeta de 36 × 28 con una hoja asomada por cada documento que contiene. */
function FolderShape({
  papers,
  root = false,
  paperDelay,
}: {
  papers: number;
  root?: boolean;
  paperDelay?: (k: number) => number;
}) {
  const fan = papers > 1 ? 10 / (papers - 1) : 0;
  return (
    <g className={root ? "fd is-root" : "fd"}>
      <path className="fd-back" d={FOLDER_BACK} />
      {Array.from({ length: papers }, (_, k) => (
        <g
          key={k}
          className="fd-paper"
          style={paperDelay ? vars({ "--pd": ms(paperDelay(k)) }) : undefined}
        >
          <g transform={`rotate(${papers > 1 ? (-5 + k * fan).toFixed(1) : 0} 18 17)`}>
            <rect className="fd-sheet" x="7" y="4.2" width="22" height="19" rx="1.6" />
            <path className="fd-line" d="M10.4 7.4h8.8" />
          </g>
        </g>
      ))}
      <path className="fd-front" d={FOLDER_FRONT} />
    </g>
  );
}

export function FolderIcon({ papers }: { papers: number }) {
  return (
    <svg className="gt-icon" viewBox="-0.5 -0.5 37 29" aria-hidden="true">
      <FolderShape papers={papers} />
    </svg>
  );
}

export function DocIcon() {
  return (
    <svg className="gd-icon" viewBox="0 0 16 20" aria-hidden="true">
      <path
        className="gd-sheet"
        d="M3 1h6.6L15 6.4V17a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2Z"
      />
      <path className="gd-fold" d="M9.5 1.2v3.7a1.3 1.3 0 0 0 1.3 1.3h4" />
      <path className="gd-lines" d="M4.6 10.2h6.6M4.6 13.6h6.6M4.6 6.8h2.6" />
    </svg>
  );
}

export function IconDownload() {
  return (
    <svg className="ic-down" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1.8v7.4M3.9 6.2 7 9.3l3.1-3.1M2.2 12.2h9.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconExternal() {
  return (
    <svg className="ic-out" width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M5.25 2.5h6.25v6.25M11.5 2.5 5.5 8.5M9 9.5v2h-7v-7h2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ────────── mapa: tu carpeta → subcarpetas ────────── */

type MapFolder = { id: string; name: string; count: number };

export function FolderMap({ folders }: { folders: MapFolder[] }) {
  const W = 344;
  const GAP = 58;
  const rows = folders.map((_, i) => 36 + i * GAP);
  const H = rows[rows.length - 1] + 36;
  const rootY = (rows[0] + rows[rows.length - 1]) / 2;

  // Coreografía: la carpeta raíz aparece, las ramas se dibujan hacia afuera
  // y cada subcarpeta recibe sus hojas cuando la rama llega.
  const branchAt = (i: number) => 200 + i * 90;
  const rowAt = (i: number) => branchAt(i) + 360;
  const paperAt = (i: number, k: number) => rowAt(i) + 170 + k * 70;

  return (
    <svg
      className="gm"
      viewBox={`0 0 ${W} ${H}`}
      role="group"
      aria-label={`Tu carpeta tiene ${folders.length} subcarpetas`}
    >
      <g aria-hidden="true">
        <g transform={`translate(12 ${rootY - 20.4}) scale(1.46)`}>
          <g className="gm-root">
            <FolderShape papers={3} root paperDelay={(k) => 90 + k * 60} />
          </g>
        </g>
        <text className="gm-root-label" x="38" y={rootY + 38} textAnchor="middle">
          Tu carpeta
        </text>
        <text className="gm-root-sub" x="38" y={rootY + 53} textAnchor="middle">
          {folders.length} subcarpetas
        </text>

        {rows.map((y, i) => (
          <g key={`branch-${i}`}>
            <path
              className="gm-branch"
              pathLength={1}
              d={`M66 ${rootY}C90 ${rootY} 84 ${y} 106 ${y}`}
              style={vars({ "--d": ms(branchAt(i)) })}
            />
            <circle
              className="gm-dot"
              cx="106"
              cy={y}
              r="2.4"
              style={vars({ "--d": ms(branchAt(i) + 420) })}
            />
          </g>
        ))}
      </g>

      {folders.map((folder, i) => {
        const y = rows[i];
        return (
          <a
            key={folder.id}
            className="gm-link"
            href={`#${folder.id}`}
            aria-label={`${folder.name}: ${plural(folder.count)}`}
          >
            <rect className="gm-hit" x="98" y={y - 25} width={W - 100} height="50" rx="12" />
            <g className="gm-row" style={vars({ "--d": ms(rowAt(i)) })} aria-hidden="true">
              <g transform={`translate(114 ${y - 14})`}>
                <FolderShape papers={folder.count} paperDelay={(k) => paperAt(i, k)} />
              </g>
              <text className="gm-name" x="160" y={y - 1.5}>
                {folder.name}
              </text>
              <text className="gm-count" x="160" y={y + 13.5}>
                {plural(folder.count)}
              </text>
            </g>
          </a>
        );
      })}
    </svg>
  );
}

/* ────────── 12 + 12 = 24 horas ────────── */

export function HoursArt({ firstPhase = 9 }: { firstPhase?: number }) {
  const TOTAL = 24;
  const HALF = 12;
  const x0 = 8;
  const step = 12;
  const cw = 9.5;
  const cy = 26;
  const ch = 20;
  const cellX = (i: number) => x0 + i * step + (i >= HALF ? 5 : 0);
  const boundary = (cellX(HALF - 1) + cw + cellX(HALF)) / 2;
  const end = cellX(TOTAL - 1) + cw;
  const missing = HALF - firstPhase;
  const carryFrom = cellX(firstPhase);
  const carryTo = cellX(HALF - 1) + cw;

  // Fase 2 llena sus horas → se marcan las que faltan → Fase 3 completa el resto
  const fillAt = (i: number) =>
    i < firstPhase ? 100 + i * 130 : 2100 + (i - firstPhase) * 60;

  return (
    <svg viewBox="0 0 306 98" aria-hidden="true">
      <text className="h-axis" x={x0} y="15">
        0 h
      </text>
      <text className="h-axis" x={boundary} y="15" textAnchor="middle">
        12 h
      </text>
      <text className="h-axis" x={end} y="15" textAnchor="end">
        24 h
      </text>
      <path className="h-tick" d={`M${boundary} 19.5V50`} />

      {Array.from({ length: TOTAL }, (_, i) => {
        const isGap = i >= firstPhase && i < HALF;
        return (
          <g key={i}>
            <rect
              className={isGap ? "h-slot is-gap" : "h-slot"}
              x={cellX(i)}
              y={cy}
              width={cw}
              height={ch}
              rx="2.5"
              style={isGap ? vars({ "--d": ms(1400 + (i - firstPhase) * 90) }) : undefined}
            />
            <rect
              className={i < firstPhase ? "h-fill is-f2" : "h-fill is-f3"}
              x={cellX(i)}
              y={cy}
              width={cw}
              height={ch}
              rx="2.5"
              style={vars({ "--d": ms(fillAt(i)) })}
            />
          </g>
        );
      })}

      {missing > 0 && (
        <g className="h-carry">
          <path className="h-bracket" d={`M${carryFrom} 50.5v3.5h${carryTo - carryFrom}v-3.5`} />
          <text className="h-note" x={(carryFrom + carryTo) / 2} y="66" textAnchor="middle">
            {missing} h pasan a la Fase 3
          </text>
        </g>
      )}

      <rect className="h-swatch is-f2" x={x0} y="80.5" width="9" height="9" rx="2" />
      <text className="h-legend" x={x0 + 14} y="88.6">
        Fase 2 · {firstPhase} h
      </text>
      <rect className="h-swatch is-f3" x="100" y="80.5" width="9" height="9" rx="2" />
      <text className="h-legend" x="114" y="88.6">
        Fase 3 · {TOTAL - firstPhase} h
      </text>

      <g className="h-total">
        <circle className="ok-disc" cx="224" cy="85" r="6.5" />
        <path className="ok-tick" d="M221 85.2l2.1 2.1 3.9-4.1" />
        <text className="h-legend is-strong" x="235" y="88.6">
          Total 24 h
        </text>
      </g>
    </svg>
  );
}

/* ────────── firma a mano ────────── */

export function SignatureArt() {
  return (
    <svg viewBox="0 0 132 84" aria-hidden="true">
      <rect className="ga-paper" x="6" y="4" width="120" height="76" rx="5" />
      <rect className="ga-bar is-strong" x="15" y="12" width="40" height="5" rx="2.5" />
      <rect className="ga-bar" x="86" y="12" width="22" height="5" rx="2.5" />
      <path className="ga-rule" d="M15 24h102M15 40h102M15 56h102M15 72h102M80 24v48" />
      <rect className="ga-bar" x="15" y="30" width="34" height="4" rx="2" />
      <rect className="ga-bar" x="15" y="46" width="44" height="4" rx="2" />
      <rect className="ga-bar" x="15" y="62" width="28" height="4" rx="2" />

      <path
        className="sg-ink is-dry"
        d="M85 35c1.4-4 2.9-6.6 4-6 1.3.8-1 6.3.3 6.8 1.2.4 2.6-4.3 4-4.6 1.5-.3-.1 4.4 1.2 4.6 1.6.2 3.4-3.4 5-3.2 1.4.2.2 3 1.6 3.1 2.2.2 5.2-1.6 8.4-2.2"
      />
      <path
        className="sg-ink is-dry"
        d="M86 51.5c2.2-2.6 4.6-7.2 6.2-6.6 1.8.7-2.6 7.6-1 8 1.8.5 3.8-5.2 5.4-4.8 1.3.3-.8 3.6.6 3.9 1.9.4 4.3-2.4 6.6-2.8M89 53.2c5.4-.6 12-1.3 22-1.9"
      />
      <path
        className="sg-ink sg-draw"
        pathLength={1}
        d="M85 67c1-4.6 2.4-8.6 3.9-8.4 1.7.2-1 7.8.2 8.4 1.1.5 2.3-5 3.6-5.4 1.5-.5.2 5.2 1.4 5.5 1.4.3 2.8-4 4.3-4.1 1.6-.1.6 3.7 1.9 3.9 1.8.3 4.1-2.5 6.4-3M87.5 69.8c6.8-1.3 16.4-2 28.5-2.6"
      />
    </svg>
  );
}

/* ────────── rostros con blur ────────── */

function ChildA() {
  return (
    <>
      <circle className="ph-skin-a" cx="48" cy="50" r="11" />
      <path
        className="ph-hair-a"
        d="M37 48.5c0-7.4 5-12 11-12s11 4.6 11 12c-2.6-3.2-6.4-4.6-11-4.4-4.6-.2-8.4 1.2-11 4.4Z"
      />
      <circle className="ph-eye" cx="44" cy="51" r="1.25" />
      <circle className="ph-eye" cx="52" cy="51" r="1.25" />
      <path className="ph-mouth" d="M44.6 55.2c2 1.5 4.8 1.5 6.8 0" />
    </>
  );
}

function ChildB() {
  return (
    <>
      <circle className="ph-hair-b" cx="76.6" cy="49.5" r="3.3" />
      <circle className="ph-hair-b" cx="99.4" cy="49.5" r="3.3" />
      <circle className="ph-skin-b" cx="88" cy="53" r="10" />
      <path
        className="ph-hair-b"
        d="M78 51c0-6.6 4.4-10.6 10-10.6S98 44.4 98 51c-2.4-2.8-5.8-4-10-3.8-4.2-.2-7.6 1-10 3.8Z"
      />
      <circle className="ph-eye" cx="84.4" cy="54" r="1.15" />
      <circle className="ph-eye" cx="91.6" cy="54" r="1.15" />
      <path className="ph-mouth" d="M85 57.8c1.8 1.3 4.2 1.3 6 0" />
    </>
  );
}

export function BlurArt() {
  return (
    <svg viewBox="0 0 132 84" aria-hidden="true">
      <defs>
        <filter id="guide-face-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.7" />
        </filter>
        <clipPath id="guide-photo-clip">
          <rect x="6" y="4" width="120" height="76" rx="7" />
        </clipPath>
      </defs>

      <g clipPath="url(#guide-photo-clip)">
        <rect className="ph-sky" x="6" y="4" width="120" height="76" />
        <circle className="ph-sun" cx="24" cy="18" r="6" />
        <path className="ph-ground" d="M6 66c18-6 36-8 56-4.5S102 64 126 58v26H6Z" />
        <path className="ph-shirt-a" d="M30 86c0-11 8-18 18-18s18 7 18 18Z" />
        <path className="ph-shirt-b" d="M72 86c0-10 7-16 16-16s16 6 16 16Z" />

        <g className="bl-sharp" style={vars({ "--d": "750ms" })}>
          <ChildA />
        </g>
        <g className="bl-soft" filter="url(#guide-face-blur)" style={vars({ "--d": "750ms" })}>
          <ChildA />
        </g>
        <g className="bl-sharp" style={vars({ "--d": "900ms" })}>
          <ChildB />
        </g>
        <g className="bl-soft" filter="url(#guide-face-blur)" style={vars({ "--d": "900ms" })}>
          <ChildB />
        </g>
      </g>
      <rect className="ph-frame" x="6" y="4" width="120" height="76" rx="7" />

      <rect className="bl-box" x="34.5" y="36" width="27" height="28" rx="6" style={vars({ "--bd": "100ms" })} />
      <rect className="bl-box" x="72" y="38.5" width="32" height="26" rx="6" style={vars({ "--bd": "250ms" })} />

      <g className="bl-check">
        <circle className="ok-disc" cx="115" cy="15" r="7" />
        <path className="ok-tick" d="M111.8 15.2l2.2 2.2 4-4.3" />
      </g>
    </svg>
  );
}

/* ────────── ARL activa ────────── */

export function ArlArt() {
  return (
    <svg viewBox="0 0 132 84" aria-hidden="true">
      <rect className="ga-paper" x="6" y="4" width="120" height="76" rx="5" />
      <path
        className="ga-shield"
        d="M21 11.5l6 2.3v4.7c0 3.8-2.6 6.3-6 7.5-3.4-1.2-6-3.7-6-7.5v-4.7Z"
      />
      <rect className="ga-bar is-strong" x="34" y="13" width="48" height="5" rx="2.5" />
      <rect className="ga-bar" x="34" y="22" width="30" height="4" rx="2" />
      <path className="ga-rule" d="M15 34h102" />
      <rect className="ga-bar" x="15" y="41" width="72" height="4" rx="2" />
      <rect className="ga-bar" x="15" y="49" width="52" height="4" rx="2" />

      <rect className="arl-pill" x="15" y="59" width="60" height="15" rx="7.5" />
      <circle className="arl-ring" cx="24" cy="66.5" r="5.5" />
      <circle className="arl-dot" cx="24" cy="66.5" r="3" />
      <text className="arl-text" x="31.5" y="70.2">
        Activa
      </text>
    </svg>
  );
}

/* ────────── link público ────────── */

export function PublicLinkArt() {
  return (
    <svg viewBox="0 0 132 84" aria-hidden="true">
      <rect className="ga-panel" x="6" y="4" width="120" height="76" rx="7" />
      <rect className="pl-field" x="15" y="13" width="102" height="17" rx="8.5" />
      <g transform="translate(20.5 15.5) scale(0.5)" className="pl-icon">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </g>
      <rect className="ga-bar" x="37" y="19.5" width="62" height="4" rx="2" />

      <circle className="pl-globe-bg" cx="26" cy="55" r="11" />
      <g transform="translate(19.4 48.4) scale(0.55)" className="pl-globe">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
      </g>
      <text className="pl-strong" x="44" y="52.5">
        Público
      </text>
      <text className="pl-soft" x="44" y="65.5">
        con el enlace
      </text>
    </svg>
  );
}
