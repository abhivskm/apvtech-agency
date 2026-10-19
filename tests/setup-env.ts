// Integration tests run against an isolated database (never the development database).
const testUrl = process.env.TEST_DATABASE_URL ?? "postgresql://agency:agency_dev_password@localhost:5433/agency_test?schema=public";
process.env.DATABASE_URL = testUrl;
process.env.DIRECT_DATABASE_URL = testUrl;
process.env.APP_SECRET ??= "test-secret-test-secret-test-secret-123";
