import { PrismaClient, User as PrismaUser, Loan as PrismaLoan, Transaction as PrismaTransaction } from '@prisma/client';

const prisma = new PrismaClient();

export { prisma };

// Use Prisma generated types
export type User = PrismaUser;
export type Loan = PrismaLoan;
export type Transaction = PrismaTransaction;

export interface LoanUpdate {
  type: 'newLoan' | 'payment' | 'funded';
  loan: Loan;
}