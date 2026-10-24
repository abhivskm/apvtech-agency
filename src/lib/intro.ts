/**
 * Intro loader shown on a visitor's first page load (once per browser session).
 * Set INTRO_LOADER to 1–4 to enable a variant on the live site, or null to turn it off.
 * In development every variant can be previewed at /loaders (or /?loader=1 … /?loader=4).
 */
export const INTRO_LOADER: IntroVariant | null = 4;

export type IntroVariant = 1 | 2 | 3 | 4;

export const INTRO_VARIANTS: Record<IntroVariant, { name: string; description: string; ms: number }> = {
  1: { name: "Signal pulse", description: "Your logo appears and the accent dot sends out two soft pulses, then the page fades in. Calm and minimal.", ms: 1700 },
  2: { name: "Wordmark rise", description: "The brand name rises word by word in large type with an accent bar, then the whole panel slides up to reveal the page. Bold, editorial.", ms: 2100 },
  3: { name: "Counter", description: "A large 0–100 counter with a thin accent line along the bottom, then the screen wipes upward. Classic agency style (decorative timing, not real progress).", ms: 2100 },
  4: { name: "Panel stack", description: "Your logo on a panel that lifts away, followed by two more layers in surface and accent colour. Echoes the layered hero collage.", ms: 1900 },
};
