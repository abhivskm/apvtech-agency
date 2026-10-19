/** Deterministic IDs for seeded media so re-running the seed is idempotent. */
export const mid = (key: string) => `seed-media-${key}`;
