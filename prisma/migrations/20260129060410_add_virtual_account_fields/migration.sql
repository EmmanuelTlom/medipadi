-- AlterTable
ALTER TABLE "User" ADD COLUMN     "paystackCustomerId" TEXT,
ADD COLUMN     "virtualAccountActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "virtualAccountBank" TEXT,
ADD COLUMN     "virtualAccountCreatedAt" TIMESTAMP(3),
ADD COLUMN     "virtualAccountName" TEXT,
ADD COLUMN     "virtualAccountNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_virtualAccountNumber_key" ON "User"("virtualAccountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_paystackCustomerId_key" ON "User"("paystackCustomerId");
