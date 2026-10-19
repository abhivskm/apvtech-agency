import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/content/queries";
import { DEFAULT_BRAND, DEFAULT_COLORS } from "@/lib/brand";

/**
 * Branded 1200×630 social sharing card (Open Graph / Twitter) for pages that have no image of their own.
 * Usage: /og?title=Page%20title&label=Services
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const settings = await getSettings();
  const colors = settings?.colors ?? DEFAULT_COLORS;
  const brand = settings?.brandName || DEFAULT_BRAND.brandName;
  const title = (searchParams.get("title") || settings?.tagline || DEFAULT_BRAND.tagline).slice(0, 120);
  const label = (searchParams.get("label") || "").slice(0, 40);
  const host = (settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const size = title.length > 70 ? 60 : title.length > 40 ? 72 : 84;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: colors.background,
          color: colors.text,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>
          <div style={{ width: 18, height: 18, borderRadius: 999, background: colors.accent }} />
          {brand}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {label && (
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, letterSpacing: 4, textTransform: "uppercase", color: colors.muted }}>
              <div style={{ width: 40, height: 2, background: colors.accent }} />
              {label}
            </div>
          )}
          <div style={{ display: "flex", fontSize: size, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>{title}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 24, color: colors.muted }}>
          <span>{host}</span>
          <div style={{ width: 120, height: 6, background: colors.accent }} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" },
    },
  );
}
