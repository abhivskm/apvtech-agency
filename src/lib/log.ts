import { Prisma } from "@prisma/client";

/**
 * Logs an error without personal data. Database errors can echo the values that were being
 * saved (names, emails, messages), so for those only the error class, code and field names are logged.
 */
export function logError(context: string, err: unknown) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(context, { type: err.name, code: err.code, target: err.meta?.target });
  } else if (err instanceof Prisma.PrismaClientValidationError || err instanceof Prisma.PrismaClientUnknownRequestError) {
    console.error(context, { type: err.name });
  } else if (err instanceof Error) {
    console.error(context, { type: err.name, message: err.message.slice(0, 300), stack: err.stack?.split("\n").slice(0, 4).join("\n") });
  } else {
    console.error(context, { type: typeof err });
  }
}
