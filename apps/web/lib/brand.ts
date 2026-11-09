export const BRAND_NAME =
  process.env.NEXT_PUBLIC_BRAND_NAME?.trim() || "WithinTech Learn";
export const BRAND_SHORT_NAME = "WT Learn";
export const BRAND_TAGLINE = "Study at your pace";
export const BRAND_DESCRIPTION =
  "A product of WithinTech Rwanda designed to provide a vast array of courses necessary to thrive in this AI-driven technological era.";
export const SITE_URL = "https://learn.withintech.org";

/** Brand colours, mirrored from --primary and --background in globals.css. */
export const BRAND_COLORS = {
  primary: "#3d006b",
  background: "#ffffff",
  backgroundDark: "#0f0f0f",
} as const;

/** Intrinsic size of /logo.png and /logo-dark-mode.png (same for both). */
export const LOGO_SIZE = { width: 726, height: 480 } as const;
