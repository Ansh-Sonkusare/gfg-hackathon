/*
  Warnings:

  - You are about to drop the column `description` on the `lender_advertisements` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `lender_advertisements` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_lender_advertisements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lenderId" INTEGER NOT NULL,
    "minAmount" INTEGER NOT NULL,
    "maxAmount" INTEGER NOT NULL,
    "interestRate" REAL NOT NULL,
    "minDuration" INTEGER NOT NULL,
    "maxDuration" INTEGER NOT NULL,
    "riskTolerance" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lender_advertisements_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_lender_advertisements" ("createdAt", "id", "interestRate", "isActive", "lenderId", "maxAmount", "maxDuration", "minAmount", "minDuration", "priority", "riskTolerance", "targetAudience", "updatedAt") SELECT "createdAt", "id", "interestRate", "isActive", "lenderId", "maxAmount", "maxDuration", "minAmount", "minDuration", "priority", "riskTolerance", "targetAudience", "updatedAt" FROM "lender_advertisements";
DROP TABLE "lender_advertisements";
ALTER TABLE "new_lender_advertisements" RENAME TO "lender_advertisements";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
