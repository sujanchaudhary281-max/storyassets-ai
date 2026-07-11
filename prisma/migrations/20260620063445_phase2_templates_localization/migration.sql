-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "androidTemplateId" TEXT,
ADD COLUMN     "iosTemplateId" TEXT,
ADD COLUMN     "matchStyleAcross" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "templateId" TEXT;

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "previewUrl" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_locales" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "translationMode" TEXT NOT NULL DEFAULT 'ai',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_locales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "localized_assets" (
    "id" TEXT NOT NULL,
    "localeId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "captionHeadline" TEXT,
    "captionSubtext" TEXT,
    "storageKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "overflowDetected" BOOLEAN NOT NULL DEFAULT false,
    "suggestedFontSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "localized_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_images" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "rightsConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reference_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_locales_projectId_locale_key" ON "project_locales"("projectId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "localized_assets_localeId_assetId_key" ON "localized_assets"("localeId", "assetId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_iosTemplateId_fkey" FOREIGN KEY ("iosTemplateId") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_androidTemplateId_fkey" FOREIGN KEY ("androidTemplateId") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_locales" ADD CONSTRAINT "project_locales_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "localized_assets" ADD CONSTRAINT "localized_assets_localeId_fkey" FOREIGN KEY ("localeId") REFERENCES "project_locales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "localized_assets" ADD CONSTRAINT "localized_assets_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "generated_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reference_images" ADD CONSTRAINT "reference_images_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
