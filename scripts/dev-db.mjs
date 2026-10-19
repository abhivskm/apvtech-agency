/**
 * Local PostgreSQL without Docker (development fallback).
 * Uses the `embedded-postgres` package, which ships real PostgreSQL binaries and runs as the current user.
 *
 *   npm run db:embedded        # starts Postgres on port 5433, Ctrl+C to stop
 *
 * Data lives outside the project folder (so cloud-sync tools such as OneDrive don't touch it):
 *   PG_DATA_DIR env var, or <home>/.agency-platform/pgdata
 *
 * Creates the `agency` and `agency_test` databases matching .env.example.
 */
import EmbeddedPostgres from "embedded-postgres";
import { existsSync, mkdirSync, readFileSync, unlinkSync } from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const dataDir = process.env.PG_DATA_DIR || path.join(os.homedir(), ".agency-platform", "pgdata");
const port = Number(process.env.PG_PORT || 5433);
const firstRun = !existsSync(path.join(dataDir, "PG_VERSION"));
mkdirSync(path.dirname(dataDir), { recursive: true });

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function portInUse(p) {
  return new Promise((resolve) => {
    const socket = net.connect({ port: p, host: "127.0.0.1" });
    socket.once("connect", () => (socket.destroy(), resolve(true)));
    socket.once("error", () => resolve(false));
  });
}

if (await portInUse(port)) {
  fail(
    `Port ${port} is already in use — PostgreSQL is probably already running (check your other terminals).\n` +
      `  If so, you don't need to start it again: just run "npm run dev".\n` +
      `  To use a different port: set PG_PORT and update DATABASE_URL in .env.`,
  );
}

// A crash or forced shutdown can leave a stale lock file that stops Postgres from starting.
const pidFile = path.join(dataDir, "postmaster.pid");
if (existsSync(pidFile)) {
  const pid = Number(readFileSync(pidFile, "utf8").split(/\r?\n/)[0]);
  let alive = false;
  try {
    process.kill(pid, 0);
    alive = true;
  } catch {
    /* process not running */
  }
  if (!alive) {
    unlinkSync(pidFile);
    console.log("Removed a stale postmaster.pid left by a previous run.");
  }
}

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "agency",
  password: "agency_dev_password",
  port,
  persistent: true,
  // Force UTF-8: on Windows initdb otherwise defaults to WIN1252, which rejects characters like ₹, → and Indic scripts.
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
  onLog: () => {},
  onError: (e) => console.error(String(e ?? "").trim()),
});

try {
  if (firstRun) {
    console.log(`Initialising new PostgreSQL cluster in ${dataDir}`);
    await pg.initialise();
  }
  await pg.start();
} catch (err) {
  fail(
    `PostgreSQL failed to start${err ? `: ${err.message ?? err}` : ""}.\n` +
      `  • Is another PostgreSQL already running on port ${port}?\n` +
      `  • Data directory: ${dataDir}\n` +
      `  • If this keeps happening, close all terminals running the database and try again.`,
  );
}

for (const name of ["agency", "agency_test"]) {
  try {
    await pg.createDatabase(name);
    console.log(`Created database ${name}`);
  } catch {
    /* already exists */
  }
}
console.log(`PostgreSQL ready on localhost:${port} (data: ${dataDir}). Keep this terminal open; press Ctrl+C to stop.`);

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1 << 30);
