ALTER TABLE "CoverageArea"
  ADD COLUMN "postalCode" TEXT,
  ADD COLUMN "source" TEXT NOT NULL DEFAULT 'DEMO',
  ADD COLUMN "lastVerifiedAt" TIMESTAMP(3);

ALTER TABLE "CoverageSearch"
  ADD COLUMN "suburb" TEXT,
  ADD COLUMN "city" TEXT,
  ADD COLUMN "province" TEXT,
  ADD COLUMN "postalCode" TEXT,
  ADD COLUMN "latitude" DECIMAL(9,6),
  ADD COLUMN "longitude" DECIMAL(9,6),
  ADD COLUMN "resultStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN "networksFound" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "packagesFound" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "source" TEXT NOT NULL DEFAULT 'DEMO';

CREATE INDEX "CoverageArea_status_source_idx" ON "CoverageArea"("status", "source");
CREATE INDEX "CoverageSearch_createdAt_source_idx" ON "CoverageSearch"("createdAt", "source");
