import "server-only";

/** Server-only environment access. Never import this from client components. */
export const env = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  appSecret: process.env.APP_SECRET ?? "",
  storageDriver: (process.env.STORAGE_DRIVER ?? "local") as "local" | "s3",
  maxUploadBytes: Number(process.env.MAX_UPLOAD_MB ?? 10) * 1024 * 1024,
  maxVideoUploadBytes: Number(process.env.MAX_VIDEO_UPLOAD_MB ?? 50) * 1024 * 1024,
  s3: {
    endpoint: process.env.S3_ENDPOINT || undefined,
    region: process.env.S3_REGION || "auto",
    bucket: process.env.S3_BUCKET ?? "",
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    publicBaseUrl: (process.env.S3_PUBLIC_BASE_URL ?? "").replace(/\/$/, ""),
  },
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "",
  cronSecret: process.env.CRON_SECRET ?? "",
  isProd: process.env.NODE_ENV === "production",
};

export function assertAppSecret() {
  if (env.appSecret.length < 32) {
    throw new Error("APP_SECRET must be set to a random string of at least 32 characters.");
  }
}
