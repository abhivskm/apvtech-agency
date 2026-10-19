import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { StorageAdapter } from "@/lib/storage";

type S3Config = {
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
};

/** S3-compatible storage (Cloudflare R2, AWS S3, Backblaze B2, MinIO). */
export class S3Storage implements StorageAdapter {
  readonly name = "s3";
  private client: S3Client | null = null;

  constructor(private config: S3Config) {}

  isConfigured() {
    const c = this.config;
    return Boolean(c.bucket && c.accessKeyId && c.secretAccessKey && c.publicBaseUrl);
  }

  private getClient() {
    if (!this.isConfigured()) {
      throw new Error("S3 storage is not configured. Set S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY and S3_PUBLIC_BASE_URL.");
    }
    this.client ??= new S3Client({
      region: this.config.region,
      endpoint: this.config.endpoint,
      credentials: { accessKeyId: this.config.accessKeyId, secretAccessKey: this.config.secretAccessKey },
    });
    return this.client;
  }

  async put(key: string, body: Buffer, contentType: string) {
    await this.getClient().send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return { url: `${this.config.publicBaseUrl}/${key}` };
  }

  async delete(key: string) {
    await this.getClient().send(new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }));
  }
}
