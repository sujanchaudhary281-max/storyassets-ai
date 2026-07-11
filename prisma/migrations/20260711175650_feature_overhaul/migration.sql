-- User: admin bypass flag
ALTER TABLE "users" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Project: merge shortDescription + fullDescription into description
ALTER TABLE "projects" ADD COLUMN "description" TEXT;
UPDATE "projects" SET "description" = "fullDescription";
ALTER TABLE "projects" ALTER COLUMN "description" SET NOT NULL;
ALTER TABLE "projects" DROP COLUMN "shortDescription";
ALTER TABLE "projects" DROP COLUMN "fullDescription";

-- Project: new fields
ALTER TABLE "projects" ADD COLUMN "iconUrl" TEXT;
ALTER TABLE "projects" ADD COLUMN "ageGroup" TEXT DEFAULT 'all-ages';
ALTER TABLE "projects" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';

-- GeneratedAsset: soft delete
ALTER TABLE "generated_assets" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- ActivityLog
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "activity_logs_userId_createdAt_idx" ON "activity_logs"("userId", "createdAt");
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ProjectDraft
CREATE TABLE "project_drafts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "formData" JSONB NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_drafts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "project_drafts_userId_updatedAt_idx" ON "project_drafts"("userId", "updatedAt");

ALTER TABLE "project_drafts" ADD CONSTRAINT "project_drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
