-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "subscriptionEnd" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Claim_providerId_status_idx" ON "Claim"("providerId", "status");

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
