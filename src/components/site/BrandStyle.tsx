import type { BrandColors } from "@/lib/brand";

const HEX = /^#[0-9a-fA-F]{6}$/;

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
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
  const css = `:root{${entries.map(([k, v]) => `${k}:${v}`).join(";")}}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
