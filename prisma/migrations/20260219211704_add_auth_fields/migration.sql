-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "customerId" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "loyaltyTier" TEXT NOT NULL DEFAULT 'BRONZE',
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Customer" ("createdAt", "customerId", "email", "firstName", "isBlacklisted", "lastName", "loyaltyPoints", "loyaltyTier", "phone", "updatedAt") SELECT "createdAt", "customerId", "email", "firstName", "isBlacklisted", "lastName", "loyaltyPoints", "loyaltyTier", "phone", "updatedAt" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
