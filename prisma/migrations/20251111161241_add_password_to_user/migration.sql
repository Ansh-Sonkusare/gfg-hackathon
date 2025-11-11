/*
  Warnings:

  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "collegeYear" INTEGER NOT NULL,
    "creditScore" INTEGER NOT NULL,
    "trustBadge" BOOLEAN NOT NULL,
    "currentBalance" INTEGER NOT NULL,
    "reputation" TEXT NOT NULL,
    "emergencyCreditAvailable" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'borrower'
);
INSERT INTO "new_users" ("collegeName", "collegeYear", "creditScore", "currentBalance", "email", "emergencyCreditAvailable", "id", "name", "reputation", "role", "trustBadge") SELECT "collegeName", "collegeYear", "creditScore", "currentBalance", "email", "emergencyCreditAvailable", "id", "name", "reputation", "role", "trustBadge" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
