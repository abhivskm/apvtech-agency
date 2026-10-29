-- Batch Ops Dashboard case study: the client is shown only as "Online coaching platform" (no company name),
-- with a neutral URL and redacted screenshots. Applies to databases that ran the first version of the project migration.
UPDATE "Project"
   SET "slug" = 'online-coaching-batch-operations-dashboard',
       "title" = 'Batch Operations Dashboard — online coaching platform',
       "client" = 'Online coaching platform',
       "seoTitle" = 'Batch Operations Dashboard — Workflow Automation for Online Coaching',
       "updatedAt" = (NOW() AT TIME ZONE 'UTC')
 WHERE "id" = 'proj_batchops';

UPDATE "MediaAsset" SET "url" = '/work/batch-ops/cover-v2.jpg', "filename" = 'batch-ops-cover.jpg', "updatedAt" = (NOW() AT TIME ZONE 'UTC') WHERE "id" = 'media-batchops-cover';
UPDATE "MediaAsset" SET "url" = '/work/batch-ops/login-v2.jpg', "filename" = 'batch-ops-login.jpg', "updatedAt" = (NOW() AT TIME ZONE 'UTC') WHERE "id" = 'media-batchops-login';
