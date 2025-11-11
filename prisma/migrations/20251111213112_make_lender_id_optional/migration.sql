-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_loans" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "borrowerId" INTEGER NOT NULL,
    "lenderId" INTEGER,
    "amount" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL,
    "interestRate" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "loanType" TEXT NOT NULL,
    "nextDueDate" DATETIME NOT NULL,
    "progressPercent" INTEGER NOT NULL,
    "dueAmount" INTEGER NOT NULL,
    CONSTRAINT "loans_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "loans_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_loans" ("amount", "borrowerId", "dueAmount", "id", "interestRate", "lenderId", "loanType", "nextDueDate", "progressPercent", "remaining", "status") SELECT "amount", "borrowerId", "dueAmount", "id", "interestRate", "lenderId", "loanType", "nextDueDate", "progressPercent", "remaining", "status" FROM "loans";
DROP TABLE "loans";
ALTER TABLE "new_loans" RENAME TO "loans";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
