import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = ({ size = 48, ...rest }: P) => ({
  width: size,
  height: size,
  viewBox: "0 0 64 64",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...rest,
});

export const IconFutbol = (p: P) => (
  <svg {...base(p)}>
    <circle cx="32" cy="32" r="24" />
    <path d="m32 21 10 7-4 12H26l-4-12Z" />
    <path d="M32 21V8M42 28l12-4M38 40l7 10M26 40l-7 10M22 28l-12-4" />
  </svg>
);

export const IconTenis = (p: P) => (
  <svg {...base(p)}>
    <ellipse cx="26" cy="24" rx="14" ry="17" transform="rotate(-35 26 24)" />
    <path d="M18 18l14 14M22 13l14 14M15 24l14 14M30 12 16 30M35 16 21 34M38 22 26 37" strokeWidth="1.6" />
    <path d="m35 36 6 6M41 42l10 10" strokeWidth="5" />
    <circle cx="50" cy="16" r="6" />
  </svg>
);

export const IconVoley = (p: P) => (
  <svg {...base(p)}>
    <circle cx="32" cy="32" r="24" />
    <path d="M32 32c-9-4-13-14-11-22M32 32c9-1 18 4 22 12M32 32c0 10-6 18-14 21" />
    <path d="M21 10c10 1 20 8 24 18M54 44c-8 4-19 3-27-3M18 53c-4-9-3-20 4-28" strokeWidth="2" opacity=".7" />
  </svg>
);

/** The field-hockey stick: the client's favourite motif, so it gets the most detail. */
export const IconHockey = (p: P) => (
  <svg {...base(p)}>
    <path d="M44 4 24 46c-3 7-8 11-14 11-5 0-7-4-5-7 2-2 5-1 7 1" strokeWidth="4.5" />
    <path d="M44 4 38 17" strokeWidth="6" />
    <path d="m33 26-3 6" strokeWidth="5.5" opacity=".55" />
    <circle cx="25" cy="56" r="4.5" />
  </svg>
);

export const IconRunning = (p: P) => (
  <svg {...base(p)}>
    <circle cx="40" cy="10" r="5" />
    <path d="m24 26 10-7 8 9 9 2M34 19l-5 15 9 7-3 13M29 34l-6 9H12" />
  </svg>
);

export const IconTraining = (p: P) => (
  <svg {...base(p)}>
    <path d="M8 26v12M14 20v24M50 20v24M56 26v12M14 32h36" strokeWidth="4" />
  </svg>
);

export const IconBasquet = (p: P) => (
  <svg {...base(p)}>
    <circle cx="32" cy="32" r="24" />
    <path d="M8 32h48M32 8v48M15 15c8 8 8 26 0 34M49 15c-8 8-8 26 0 34" />
  </svg>
);

export const SPORT_ICON = {
  futbol: IconFutbol,
  tenis: IconTenis,
  voley: IconVoley,
  hockey: IconHockey,
  running: IconRunning,
  training: IconTraining,
  basquet: IconBasquet,
} as const;
