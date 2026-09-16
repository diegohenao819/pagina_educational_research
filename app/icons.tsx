import type { ReactNode } from "react";

/**
 * Íconos de la interfaz: una sola rejilla de 20 × 20 y un solo trazo, para
 * que todos pesen lo mismo. Son decorativos (aria-hidden); el texto de al
 * lado siempre dice lo que hace el control.
 */

type IconProps = { size?: number; className?: string };

function Svg({ size = 18, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className ? `icon ${className}` : "icon"}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const IconInfo = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10" cy="10" r="7.25" />
    <path d="M10 9.2v4.4" />
    <circle cx="10" cy="6.5" r="0.95" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconAlert = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10" cy="10" r="7.25" />
    <path d="M10 6.3v4.5" />
    <circle cx="10" cy="13.6" r="0.95" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="8.8" cy="8.8" r="5.05" />
    <path d="m12.6 12.6 3.9 3.9" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m4.8 10.4 3.3 3.3 7.1-7.4" />
  </Svg>
);

export const IconCheckCircle = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10" cy="10" r="8.25" fill="currentColor" stroke="none" />
    <path d="m6.5 10.2 2.4 2.4 4.7-4.9" stroke="#fff" strokeWidth="1.9" />
  </Svg>
);

export const IconCopy = (p: IconProps) => (
  <Svg {...p}>
    <rect x="7.25" y="7.25" width="8.75" height="8.75" rx="2" />
    <path d="M12.75 7.25V5.5A1.5 1.5 0 0 0 11.25 4h-5.75A1.5 1.5 0 0 0 4 5.5v5.75a1.5 1.5 0 0 0 1.5 1.5h1.75" />
  </Svg>
);

export const IconExternal = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8.5 4.5H5.75A1.75 1.75 0 0 0 4 6.25v8A1.75 1.75 0 0 0 5.75 16h8a1.75 1.75 0 0 0 1.75-1.75V11.5" />
    <path d="M11.75 4H16v4.25M16 4l-6.25 6.25" />
  </Svg>
);

export const IconDownload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 3.75v8.75M6.25 8.75 10 12.5l3.75-3.75M4.25 16h11.5" />
  </Svg>
);

export const IconMegaphone = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.75 8.6v2.8c0 .55.45 1 1 1h1.6l5.9 3.4V4.2L6.35 7.6h-1.6c-.55 0-1 .45-1 1Z" />
    <path d="M15.25 7.4a3.6 3.6 0 0 1 0 5.2" />
  </Svg>
);

export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 10h11M11 5.5l4.5 4.5-4.5 4.5" />
  </Svg>
);

export const IconMessage = (p: IconProps) => (
  <Svg {...p}>
    <path d="M16 11.9a1.6 1.6 0 0 1-1.6 1.6H8.2l-3.7 3V5.6A1.6 1.6 0 0 1 6.1 4h8.3A1.6 1.6 0 0 1 16 5.6Z" />
  </Svg>
);

export const IconRestart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.3 10a5.7 5.7 0 1 0 1.7-4.05L4.3 7.6" />
    <path d="M4.3 3.9v3.7H8" />
  </Svg>
);
