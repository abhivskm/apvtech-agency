-- Work: Batch Ops Dashboard for an online coaching platform (internal automation tool), placed second.
-- The tool is private and works on the company's internal sheets, so no internal screens or data are shown:
-- the cover is an illustration of the workflow around the real login screen. No metrics are claimed.
-- Content only; runs once per database.

INSERT INTO "ProjectCategory" ("id","slug","name","order")
SELECT 'pcat_automation','automation','Automation & internal tools', COALESCE(MAX("order"), 0) + 1 FROM "ProjectCategory"
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "MediaAsset" ("id","kind","url","filename","mime","width","height","alt","credit","updatedAt") VALUES
('media-batchops-cover','IMAGE','/work/batch-ops/cover-v2.jpg','batch-ops-cover.jpg','image/jpeg',2400,1600,'Illustration of the Batch Ops Dashboard: login screen and the read, preview, confirm, push, backup and rollback workflow',NULL,(NOW() AT TIME ZONE 'UTC')),
('media-batchops-login','IMAGE','/work/batch-ops/login-v2.jpg','batch-ops-login.jpg','image/jpeg',1800,1125,'Batch Ops Dashboard sign-in screen',NULL,(NOW() AT TIME ZONE 'UTC'))
ON CONFLICT ("id") DO NOTHING;

UPDATE "Project" SET "order" = "order" + 1 WHERE "order" >= 1;

INSERT INTO "Project" ("id","slug","title","client","isConcept","year","summary","description","challenge","solution","outcome","coverId","industryId","featured","order","status","publishedAt","seoTitle","seoDescription","updatedAt")
VALUES ('proj_batchops','online-coaching-batch-operations-dashboard',
 'Batch Operations Dashboard — online coaching platform',
 'Online coaching platform', false, 2026,
 'An internal dashboard that automates daily batch operations for an online NEET coaching team, working directly on their existing Google Sheets and learning platform.',
 '<p>This is a private internal tool, so the screens and data are not shown here.</p>',
 'Running live NEET batches meant a lot of repeated manual work every day: pushing lectures, notes and practice tests to the learning platform, keeping class schedules and learning paths in step across many Google Sheets, making thumbnails, and fixing mistakes by hand. It was done through spreadsheet scripts and copy-paste, which took time and was easy to get wrong.',
 'We built a secure web dashboard that keeps Google Sheets as the source of truth and replaces the manual steps with guided actions. It finds every sheet from one master sheet and checks their health; runs a live class push (lecture, notes, nodes and practice test) in one click; lets the team reorder, add or delete classes with dates and learning paths updated together; auto-arranges upcoming classes by faculty pattern, leave days and holidays; generates thumbnails; and edits any sheet safely. Every action shows a preview first and needs confirmation, production changes need an extra typed confirmation, and every save is backed up so it can be rolled back. Admins manage users and feature access, separate test and live environments, an emergency stop, push limits and a tamper-evident activity log.',
 'The dashboard is in use by the batch operations team, replacing the manual spreadsheet steps with guided, reversible actions, which saves time on daily batch work and reduces errors.',
 'media-batchops-cover', NULL,
 true, 1, 'PUBLISHED', (NOW() AT TIME ZONE 'UTC'),
 'Batch Operations Dashboard — Workflow Automation for Online Coaching',
 'Case study: an internal dashboard that automates daily batch operations for an online NEET coaching team on top of Google Sheets, with previews, backups and rollback.',
 (NOW() AT TIME ZONE 'UTC'));

INSERT INTO "ProjectMedia" ("id","projectId","mediaId","order") VALUES
('pm_batchops_1','proj_batchops','media-batchops-login',0);

INSERT INTO "ProjectService" ("projectId","serviceId")
SELECT 'proj_batchops', s."id" FROM "Service" s WHERE s."slug" IN ('ai-automation','it-support-software')
ON CONFLICT DO NOTHING;

INSERT INTO "ProjectCategoryLink" ("projectId","categoryId")
SELECT 'proj_batchops', c."id" FROM "ProjectCategory" c WHERE c."slug" = 'automation'
ON CONFLICT DO NOTHING;
