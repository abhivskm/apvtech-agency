import type { BrandColors } from "@/lib/brand";

const HEX = /^#[0-9a-fA-F]{6}$/;

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const LIGHT_BG = "#F7F7F2";

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Darkens a colour in small steps until it reaches 4.5:1 contrast against `bg`. */
export function readableOn(hex: string, bg: string) {
  let [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const toHex = () => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
  for (let i = 0; i < 40 && contrast(toHex(), bg) < 4.5; i++) [r, g, b] = [r * 0.92, g * 0.92, b * 0.92];
  return toHex().toUpperCase();
}

/** Emits brand colour tokens from Admin → Branding & Theme. Values are validated hex only. */
export function BrandStyle({ colors }: { colors: BrandColors }) {
  const entries: [string, string][] = [
    ["--brand-bg", colors.background],
    ["--brand-surface", colors.surface],
    ["--brand-elevated", colors.elevated],
    ["--brand-text", colors.text],
    ["--brand-muted", colors.muted],
    ["--brand-accent", colors.accent],
  ].filter(([, v]) => HEX.test(v)) as [string, string][];
  if (HEX.test(colors.accent)) {
    entries.push(["--brand-on-accent", luminance(colors.accent) > 0.4 ? "#0A0A0A" : "#FFFFFF"]);
  }
  let css = `:root{${entries.map(([k, v]) => `${k}:${v}`).join(";")}}`;
  // Light theme keeps the brand hue but darkens the accent until it is readable on the light background.
  if (HEX.test(colors.accent)) {
    const light = readableOn(colors.accent, LIGHT_BG);
    css += `:root[data-theme="light"]{--brand-accent:${light};--brand-on-accent:${luminance(light) > 0.4 ? "#0A0A0A" : "#FFFFFF"}}`;
  }
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
