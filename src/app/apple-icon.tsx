import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iPhone / iPad home-screen icon: the brand signal dot on the dark brand background (iOS needs a solid background). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A" }}>
        <div style={{ width: 96, height: 96, borderRadius: 999, background: "#C8F169" }} />
      </div>
    ),
    size,
  );
}
