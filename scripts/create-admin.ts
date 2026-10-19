/**
 * Secure initial administrator provisioning.
 *
 *   npm run create-admin
 *
 * Prompts for name, email and password (password input is hidden), enforces password strength,
 * and creates a SUPER_ADMIN. Non-interactive use (CI / first deploy):
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_NAME="Your Name" ADMIN_PASSWORD='…' npm run create-admin
 *
 * There is no default account and no credentials are stored in the repository.
 * If the email already exists, the script refuses unless --reset-password is passed.
 */
import { PrismaClient } from "@prisma/client";
import { createInterface } from "node:readline";
import { hashPassword, passwordProblem } from "../src/lib/auth/password";

const db = new PrismaClient();
const resetPassword = process.argv.includes("--reset-password");

function ask(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      const out = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
      out._writeToOutput = (s: string) => {
        if (s.includes(question)) out.output.write(s);
        else out.output.write("*");
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || (await ask("Admin email: "))).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email address.");

  const existing = await db.user.findUnique({ where: { email } });
  if (existing && !resetPassword) {
    throw new Error("A user with this email already exists. Re-run with --reset-password to set a new password.");
  }

  const name = existing?.name ?? (process.env.ADMIN_NAME || (await ask("Full name: ")));
  if (!name) throw new Error("Name is required.");

  const password = process.env.ADMIN_PASSWORD || (await ask("Password (min 12 chars): ", true));
  const problem = passwordProblem(password);
  if (problem) throw new Error(problem);
  if (!process.env.ADMIN_PASSWORD) {
    const confirm = await ask("Confirm password: ", true);
    if (confirm !== password) throw new Error("Passwords do not match.");
  }

  const passwordHash = await hashPassword(password);
  if (existing) {
    await db.user.update({ where: { id: existing.id }, data: { passwordHash, active: true } });
    await db.session.deleteMany({ where: { userId: existing.id } });
    await db.activityLog.create({ data: { action: "user.password_reset_cli", entityType: "User", entityId: existing.id, actorEmail: "cli", summary: `Password reset via CLI for ${email}` } });
    console.log(`Password reset for ${email}. Existing sessions revoked.`);
  } else {
    const user = await db.user.create({ data: { email, name, passwordHash, role: "SUPER_ADMIN" } });
    await db.activityLog.create({ data: { action: "user.create_cli", entityType: "User", entityId: user.id, actorEmail: "cli", summary: `Super Admin ${email} created via CLI` } });
    console.log(`Super Admin ${email} created. Sign in at /admin/login`);
  }
}

main()
  .catch((e) => {
    console.error(`\n✖ ${e instanceof Error ? e.message : e}`);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
