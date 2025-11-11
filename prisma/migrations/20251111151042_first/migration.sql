-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "collegeYear" INTEGER NOT NULL,
    "creditScore" INTEGER NOT NULL,
    "trustBadge" BOOLEAN NOT NULL,
    "currentBalance" INTEGER NOT NULL,
    "reputation" TEXT NOT NULL,
    "emergencyCreditAvailable" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'borrower'
);

-- CreateTable
CREATE TABLE "loans" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "borrowerId" INTEGER NOT NULL,
    "lenderId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL,
    "interestRate" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "loanType" TEXT NOT NULL,
    "nextDueDate" DATETIME NOT NULL,
    "progressPercent" INTEGER NOT NULL,
    "dueAmount" INTEGER NOT NULL,
    CONSTRAINT "loans_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "loans_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "positive" BOOLEAN NOT NULL,
    CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
