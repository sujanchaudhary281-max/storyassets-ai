-- AlterTable
ALTER TABLE "generated_assets" ADD COLUMN     "deviceSize" TEXT,
ADD COLUMN     "parentAssetId" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "screenshot_versions" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "captionHeadline" TEXT,
    "captionSubtext" TEXT,
    "storageKey" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "fileSizeBytes" INTEGER,
    "versionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "screenshot_versions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "generated_assets" ADD CONSTRAINT "generated_assets_parentAssetId_fkey" FOREIGN KEY ("parentAssetId") REFERENCES "generated_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screenshot_versions" ADD CONSTRAINT "screenshot_versions_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "generated_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
