/** Small preview URL for admin grids. Unsplash images are resized by their CDN; other URLs are returned unchanged. */
export function thumbUrl(url: string, size = 400) {
  try {
    const u = new URL(url);
    if (u.hostname === "images.unsplash.com") {
      u.searchParams.set("w", String(size));
      u.searchParams.set("h", String(size));
      u.searchParams.set("fit", "crop");
      u.searchParams.set("q", "60");
      return u.toString();
    }
  } catch {
    /* relative URL (local uploads) */
  }
  return url;
}
