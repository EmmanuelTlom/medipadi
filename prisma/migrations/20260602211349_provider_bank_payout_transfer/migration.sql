-- AlterTable
ALTER TABLE "Payout" ADD COLUMN     "transferError" TEXT,
ADD COLUMN     "transferReference" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bankAccountName" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankCode" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "paystackRecipientCode" TEXT;
