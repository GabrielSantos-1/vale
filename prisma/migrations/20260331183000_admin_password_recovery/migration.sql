-- CreateTable
CREATE TABLE "AdminPasswordRecoveryToken" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "requestedIp" TEXT,
    "requestedUserAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminPasswordRecoveryToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminPasswordRecoveryToken_tokenHash_key" ON "AdminPasswordRecoveryToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminPasswordRecoveryToken_adminUserId_idx" ON "AdminPasswordRecoveryToken"("adminUserId");

-- CreateIndex
CREATE INDEX "AdminPasswordRecoveryToken_expiresAt_idx" ON "AdminPasswordRecoveryToken"("expiresAt");

-- CreateIndex
CREATE INDEX "AdminPasswordRecoveryToken_usedAt_idx" ON "AdminPasswordRecoveryToken"("usedAt");

-- AddForeignKey
ALTER TABLE "AdminPasswordRecoveryToken" ADD CONSTRAINT "AdminPasswordRecoveryToken_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
