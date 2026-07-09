-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'GUEST');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "authProvider" "AuthProvider" NOT NULL DEFAULT 'GUEST',
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "guestToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_googleId_key" ON "Profile"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_guestToken_key" ON "Profile"("guestToken");
