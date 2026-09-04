
-- AlterTable
ALTER TABLE "Integration" ADD COLUMN     "accessNote" TEXT,
ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'GUIDED',
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Website" ADD COLUMN     "platform" TEXT,
ADD COLUMN     "platformConfidence" INTEGER,
ADD COLUMN     "platformConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "platformSignals" TEXT;

