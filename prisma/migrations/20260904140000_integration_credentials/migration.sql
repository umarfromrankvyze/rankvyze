
-- AlterTable
ALTER TABLE "Integration" ADD COLUMN     "lastError" TEXT,
ADD COLUMN     "secretCiphertext" TEXT,
ADD COLUMN     "secretHint" TEXT;

