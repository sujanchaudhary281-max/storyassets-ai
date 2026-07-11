-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "generationsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxLanguages" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxProjects" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "monthlyGenerations" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "periodResetAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "credit_packs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "stripePaymentId" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credit_packs_stripePaymentId_key" ON "credit_packs"("stripePaymentId");

-- AddForeignKey
ALTER TABLE "credit_packs" ADD CONSTRAINT "credit_packs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
