import { PrismaClient } from '@prisma/client';
import type { Loan, PaymentPlan } from '@prisma/client';

const prisma = new PrismaClient();

export { prisma };

// Use Prisma generated types - these will be available after client generation
export type { User, Loan, Transaction, LenderAdvertisement, PaymentPlan } from '@prisma/client';

export interface LoanUpdate {
  userId: number;
  type: 'newLoan' | 'payment' | 'funded' | 'paymentPlanCreated' | 'paymentProcessed';
  loan?: Loan;
  paymentPlan?: PaymentPlan;
}

export interface BalanceUpdate {
  type: 'balanceUpdate';
  newBalance: number;
}

export interface LenderAdvertisementData {
  minAmount: number;
  maxAmount: number;
  minDuration: number;
  maxDuration: number;
  targetAudience: string;
}

export interface LenderWithAdvertisement {
  id: number;
  name: string;
  collegeName: string;
  collegeYear: number;
  branch: string;
  matchPercentage: number;
  riskTolerance: string;
  interestRate: string;
  trustBadge: boolean;
  profileImage: string;
  advertisement: LenderAdvertisementData;
}

export interface CreateAdvertisementInput {
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  minDuration: number;
  maxDuration: number;
  riskTolerance: string;
  targetAudience: string;
}

export interface LoanData {
  id: number;
  borrowerName?: string;
  borrower?: string;
  amount: number;
  remaining: number;
  interestRate: number;
  progressPercent: number;
  dueAmount: number;
  status: string;
  lenderName?: string;
  nextDueDate: string;
  earnings?: number;
  dueDate?: string;
}

export interface TransactionData {
  type: string;
  amount: number;
  date: string;
  positive: boolean;
}

export interface LoanRequestData {
  id: number;
  borrowerName: string;
  borrowerCollege: string;
  borrowerYear: number;
  borrowerTrustBadge: boolean;
  profileImage: string;
  matchPercentage: number;
  riskTolerance: string;
  amount: number;
  duration: number;
  interestRate: number;
}