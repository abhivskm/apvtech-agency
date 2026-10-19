import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

/** Applies migrations to the TEST database before integration tests run. */
export default function setup() {
  let url = process.env.TEST_DATABASE_URL;
  if (!url) {
    try {
      const env = readFileSync(".env", "utf8");
      url = env.match(/^TEST_DATABASE_URL="?([^"\n]+)"?/m)?.[1];
    } catch {
      /* no .env */
    }
  }
  url ??= "postgresql://agency:agency_dev_password@localhost:5433/agency_test?schema=public";
  if (!/_test\b|test/.test(url)) throw new Error(`Refusing to run integration tests against a non-test database: ${url}`);
  process.env.TEST_DATABASE_URL = url;
  execSync("npx prisma migrate deploy", { stdio: "inherit", env: { ...process.env, DATABASE_URL: url, DIRECT_DATABASE_URL: url } });
}
