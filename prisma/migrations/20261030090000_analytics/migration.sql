-- CreateTable
CREATE TABLE "AnalyticsSession" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "isNewVisitor" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entryPath" TEXT NOT NULL DEFAULT '',
    "currentPath" TEXT NOT NULL DEFAULT '',
    "channel" TEXT NOT NULL DEFAULT 'Direct',
    "source" TEXT NOT NULL DEFAULT 'direct',
    "referrerHost" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "device" TEXT NOT NULL DEFAULT 'desktop',
    "browser" TEXT NOT NULL DEFAULT 'Other',
    "os" TEXT NOT NULL DEFAULT 'Other',
    "language" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "pageviews" INTEGER NOT NULL DEFAULT 0,
    "engagedMs" INTEGER NOT NULL DEFAULT 0,
    "isLead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AnalyticsSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" BIGSERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "slug" TEXT,
    "label" TEXT,
    "area" TEXT,
    "value" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsDaily" (
    "day" DATE NOT NULL,
    "metric" TEXT NOT NULL,
    "dimension" TEXT NOT NULL DEFAULT '',
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AnalyticsDaily_pkey" PRIMARY KEY ("day","metric","dimension")
);

-- CreateIndex
CREATE INDEX "AnalyticsSession_startedAt_idx" ON "AnalyticsSession"("startedAt");

-- CreateIndex
CREATE INDEX "AnalyticsSession_lastSeenAt_idx" ON "AnalyticsSession"("lastSeenAt");

-- CreateIndex
CREATE INDEX "AnalyticsSession_visitorId_idx" ON "AnalyticsSession"("visitorId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_createdAt_idx" ON "AnalyticsEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AnalyticsSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

