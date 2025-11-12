import { router, publicProcedure, protectedProcedure, ee } from '../trpc';
import { observable } from '@trpc/server/observable';
import { LoanUpdate, BalanceUpdate, LenderWithAdvertisement } from '../types';
import { prisma } from '../types';

export const borrowerRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({ where: { id: ctx.userId } });
    if (!user) throw new Error('User not found');

    return {
      id: user.id,
      name: user.name,
      collegeName: user.collegeName,
      collegeYear: user.collegeYear,
      creditScore: user.creditScore,
      trustBadge: user.trustBadge ? "verified" : "unverified",
      currentBalance: user.currentBalance,
      reputation: user.reputation,
      emergencyCreditAvailable: user.emergencyCreditAvailable
    };
  }),

  getLenders: protectedProcedure.query(async ({ ctx }): Promise<LenderWithAdvertisement[]> => {
    // Get borrower profile for matching
    const borrower = await prisma.user.findUnique({ where: { id: ctx.userId } });
    if (!borrower) throw new Error('Borrower not found');

    // Get active advertisements with lender details
    const advertisements = await prisma.lenderAdvertisement.findMany({
      where: { isActive: true },
      include: {
        lender: {
          select: {
            id: true,
            name: true,
            collegeName: true,
            collegeYear: true,
            creditScore: true,
            trustBadge: true,
            riskTolerance: true,
            reputation: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return advertisements.map(ad => {
      // Calculate match percentage based on various factors
      let matchScore = 50; // Base score

      // College match bonus
      if (ad.lender.collegeName === borrower.collegeName) {
        matchScore += 20;
      }

      // Risk tolerance compatibility
      if (ad.riskTolerance === borrower.riskTolerance) {
        matchScore += 15;
      }

      // Trust score bonus
      matchScore += Math.min(15, ad.lender.creditScore / 100);

      // Trust badge bonus
      if (ad.lender.trustBadge) {
        matchScore += 10;
      }

      return {
        id: ad.lender.id,
        name: ad.lender.name,
        collegeName: ad.lender.collegeName,
        collegeYear: ad.lender.collegeYear,
        branch: "CSE", // Default
        matchPercentage: Math.min(100, Math.round(matchScore)),
        riskTolerance: ad.riskTolerance,
        interestRate: `${ad.interestRate}%`,
        trustBadge: ad.lender.trustBadge,
        profileImage: ad.lender.name.split(' ').map(n => n[0]).join(''),
        advertisement: {
          minAmount: ad.minAmount,
          maxAmount: ad.maxAmount,
          minDuration: ad.minDuration,
          maxDuration: ad.maxDuration,
          targetAudience: ad.targetAudience
        }
      };
    });
  }),

  getAllLenders: protectedProcedure.query(async ({ ctx }) => {
    // Get borrower profile for matching
    const borrower = await prisma.user.findUnique({ where: { id: ctx.userId } });
    if (!borrower) throw new Error('Borrower not found');

    // Get all lenders (users with role 'lender')
    const lenders = await prisma.user.findMany({
      where: { role: 'lender' },
      select: {
        id: true,
        name: true,
        collegeName: true,
        collegeYear: true,
        creditScore: true,
        trustBadge: true,
        riskTolerance: true,
        reputation: true
      }
    });

    return lenders.map(lender => {
      // Calculate match percentage based on various factors
      let matchScore = 50; // Base score

      // College match bonus
      if (lender.collegeName === borrower.collegeName) {
        matchScore += 20;
      }

      // Risk tolerance compatibility
      if (lender.riskTolerance === borrower.riskTolerance) {
        matchScore += 15;
      }

      // Trust score bonus
      matchScore += Math.min(15, lender.creditScore / 100);

      // Trust badge bonus
      if (lender.trustBadge) {
        matchScore += 10;
      }

      return {
        id: lender.id,
        name: lender.name,
        collegeName: lender.collegeName,
        collegeYear: lender.collegeYear,
        branch: "CSE", // Default
        matchPercentage: Math.min(100, Math.round(matchScore)),
        riskTolerance: lender.riskTolerance,
        interestRate: "Variable", // No fixed rate without advertisement
        trustBadge: lender.trustBadge,
        profileImage: lender.name.split(' ').map(n => n[0]).join('')
      };
    });
  }),

  getActiveLoans: protectedProcedure.query(async ({ ctx }) => {
    const loans = await prisma.loan.findMany({
      where: { borrowerId: ctx.userId, status: 'active' },
      include: { lender: true }
    });
    return loans.map(loan => ({
      id: loan.id,
      lenderName: loan.lender?.name || 'Unknown',
      amount: loan.amount,
      remaining: loan.remaining,
      interestRate: loan.interestRate,
      nextDueDate: new Date(loan.nextDueDate).toISOString().split('T')[0],
      status: loan.status,
      progressPercent: loan.progressPercent,
      dueAmount: loan.dueAmount,
      totalDueAmount: loan.totalDueAmount
    }));
  }),

  requestLoan: protectedProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'amount' in val && 'duration' in val && 'interestRate' in val) {
        const input = val as { lenderId?: number; amount: number; duration: number; interestRate: number };
        return input;
      }
      throw new Error('Invalid input');
    })
    .mutation(async ({ input, ctx }) => {
      let lender = null;
      let interestRate = input.interestRate;

      if (input.lenderId) {
        lender = await prisma.user.findUnique({ where: { id: input.lenderId } });
        if (!lender) throw new Error('Lender not found');

        // Get the lender's active advertisement to validate and get interest rate
        const advertisement = await prisma.lenderAdvertisement.findFirst({
          where: { lenderId: input.lenderId, isActive: true }
        });
        if (advertisement) {
          // Validate amount is within range if advertisement exists
          if (input.amount < advertisement.minAmount || input.amount > advertisement.maxAmount) {
            throw new Error(`Loan amount must be between ₹${advertisement.minAmount} and ₹${advertisement.maxAmount}`);
          }

          // Validate duration is within range
          if (input.duration < advertisement.minDuration || input.duration > advertisement.maxDuration) {
            throw new Error(`Loan duration must be between ${advertisement.minDuration} and ${advertisement.maxDuration} days`);
          }

          // Use advertisement interest rate if available
          interestRate = advertisement.interestRate;
        }
      }

        // Calculate monthly interest and total amount
        const numberOfMonths = Math.ceil(input.duration / 30);
        const monthlyInterestRate = interestRate / 100 / 12; // Convert annual rate to monthly
        const monthlyPrincipal = input.amount / numberOfMonths;
        const monthlyInterest = input.amount * monthlyInterestRate;
        const dueAmount = Math.round(monthlyPrincipal + monthlyInterest);

        // Total amount due = principal + total interest over loan period
        const totalInterest = monthlyInterest * numberOfMonths;
        const totalDueAmount = Math.round(input.amount + totalInterest);

        const loan = await prisma.loan.create({
          data: {
            borrowerId: ctx.userId,
            lenderId: input.lenderId || null,
            amount: input.amount,
            remaining: totalDueAmount, // Now remaining includes interest
            interestRate: interestRate,
            status: 'pending',
            loanType: 'personal', // Default
            nextDueDate: new Date(Date.now() + input.duration * 24 * 60 * 60 * 1000),
            progressPercent: 0,
            dueAmount: dueAmount,
            totalDueAmount: totalDueAmount
          }
        });

       // Note: Balance and transaction created when loan is funded

        // Emit loan update
        ee.emit('loanUpdate', {
         userId: ctx.userId,
         type: 'loanRequest',
         loanId: loan.id
       });

      // Emit event for subscriptions
      ee.emit('loanUpdate', {
        userId: ctx.userId,
        type: 'newLoan' as const,
        loan: loan
      });

      const lenderName = lender ? lender.name : 'Available Lenders';
      return { success: true, message: `Loan requested from ${lenderName}`, loanId: loan.id };
    }),

  makePayment: protectedProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'loanId' in val && 'amount' in val && 'frequency' in val && 'numberOfInstallments' in val) {
        return val as { loanId: number; amount: number; frequency: string; numberOfInstallments: number };
      }
      throw new Error('Invalid input');
    })
    .mutation(async ({ input, ctx }) => {
      const loan = await prisma.loan.findFirst({
        where: { id: input.loanId, borrowerId: ctx.userId }
      });
      if (!loan) throw new Error('Loan not found');

      // Validate frequency
      const validFrequencies = ['hourly', 'daily', 'weekly', 'monthly'];
      if (!validFrequencies.includes(input.frequency)) {
        throw new Error('Invalid frequency. Must be hourly, daily, weekly, or monthly');
      }

      // Calculate next payment date and end date
      const now = new Date();
      let nextPaymentDate = new Date(now);
      let endDate = new Date(now);

      switch (input.frequency) {
        case 'hourly':
          nextPaymentDate.setHours(now.getHours() + 1);
          endDate.setHours(now.getHours() + input.numberOfInstallments);
          break;
        case 'daily':
          nextPaymentDate.setDate(now.getDate() + 1);
          endDate.setDate(now.getDate() + input.numberOfInstallments);
          break;
        case 'weekly':
          nextPaymentDate.setDate(now.getDate() + 7);
          endDate.setDate(now.getDate() + (input.numberOfInstallments * 7));
          break;
        case 'monthly':
          nextPaymentDate.setMonth(now.getMonth() + 1);
          endDate.setMonth(now.getMonth() + input.numberOfInstallments);
          break;
      }

      // Create payment plan
      const paymentPlan = await prisma.paymentPlan.create({
        data: {
          loanId: input.loanId,
          userId: ctx.userId,
          frequency: input.frequency,
          amount: input.amount,
          nextPaymentDate: nextPaymentDate,
          endDate: endDate
        }
      });

      // Emit event
      ee.emit('loanUpdate', {
        userId: ctx.userId,
        type: 'paymentPlanCreated' as const,
        loan: loan,
        paymentPlan: paymentPlan
      });

      return { success: true, message: `Payment plan created for loan ${input.loanId} with ${input.frequency} payments of ₹${input.amount}`, paymentPlanId: paymentPlan.id };
    }),

  processPayment: protectedProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'loanId' in val && 'amount' in val) {
        return val as { loanId: number; amount: number };
      }
      throw new Error('Invalid input');
    })
    .mutation(async ({ input, ctx }) => {
      // Find the loan
      const loan = await prisma.loan.findFirst({
        where: { id: input.loanId, borrowerId: ctx.userId },
        include: { lender: true }
      });

      if (!loan) throw new Error('Loan not found');
      if (!loan.lender) throw new Error('Loan not funded yet');

      // Check borrower balance
      const borrower = await prisma.user.findUnique({ where: { id: ctx.userId } });
      if (!borrower || borrower.currentBalance < input.amount) {
        throw new Error('Insufficient balance');
      }

      // Check if payment amount is valid
      if (input.amount > loan.remaining) {
        throw new Error('Payment amount exceeds remaining loan balance');
      }

      // Calculate new loan values
      const newRemaining = loan.remaining - input.amount;
      const newProgressPercent = Math.round(((loan.amount - newRemaining) / loan.amount) * 100);

      // Update loan
      const updatedLoan = await prisma.loan.update({
        where: { id: input.loanId },
        data: {
          remaining: newRemaining,
          progressPercent: newProgressPercent,
          status: newRemaining === 0 ? 'completed' : 'active'
        }
      });

      // Update balances
      await prisma.user.update({
        where: { id: ctx.userId },
        data: { currentBalance: { decrement: input.amount } }
      });

      await prisma.user.update({
        where: { id: loan.lender.id },
        data: { currentBalance: { increment: input.amount } }
      });

      // Create transactions
      await prisma.transaction.create({
        data: {
          userId: ctx.userId,
          type: 'Loan Payment',
          amount: input.amount,
          positive: false
        }
      });

      await prisma.transaction.create({
        data: {
          userId: loan.lender.id,
          type: 'Loan Payment Received',
          amount: input.amount,
          positive: true
        }
      });

      // Emit balance updates
      ee.emit('balanceUpdate', {
        userId: ctx.userId,
        type: 'balanceUpdate',
        newBalance: borrower.currentBalance - input.amount
      });

      ee.emit('balanceUpdate', {
        userId: loan.lender.id,
        type: 'balanceUpdate',
        newBalance: loan.lender.currentBalance + input.amount
      });

      // Emit loan update
      ee.emit('loanUpdate', {
        userId: ctx.userId,
        type: 'payment',
        loan: updatedLoan
      });

      return {
        success: true,
        message: `Payment of ₹${input.amount} processed successfully`,
        newBalance: borrower.currentBalance - input.amount,
        remainingAmount: newRemaining
      };
    }),

  getTransactions: protectedProcedure.query(async ({ ctx }) => {
    const txns = await prisma.transaction.findMany({
      where: { userId: ctx.userId },
      orderBy: { date: 'desc' }
    });
    return txns.map(txn => ({
      type: txn.type,
      amount: txn.amount,
      date: txn.date.toISOString().split('T')[0],
      positive: txn.positive,
    }));
  }),

  getPaymentPlans: protectedProcedure.query(async ({ ctx }) => {
    const plans = await prisma.paymentPlan.findMany({
      where: { userId: ctx.userId, isActive: true },
      include: { loan: true },
      orderBy: { nextPaymentDate: 'asc' }
    });
    return plans.map(plan => ({
      id: plan.id,
      loanId: plan.loanId,
      frequency: plan.frequency,
      amount: plan.amount,
      nextPaymentDate: plan.nextPaymentDate.toISOString().split('T')[0],
      endDate: plan.endDate?.toISOString().split('T')[0],
      loanAmount: plan.loan.amount,
      remaining: plan.loan.remaining
    }));
  }),

  addFunds: protectedProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'amount' in val) {
        return val as { amount: number };
      }
      throw new Error('Invalid input');
    })
    .mutation(async ({ input, ctx }) => {
      // Create transaction for adding funds
      await prisma.transaction.create({
        data: {
          userId: ctx.userId,
          type: 'Wallet Recharge',
          amount: input.amount,
          positive: true
        }
      });

      // Update user balance
      const updatedUser = await prisma.user.update({
        where: { id: ctx.userId },
        data: { currentBalance: { increment: input.amount } }
      });

      // Emit balance update
      ee.emit('balanceUpdate', {
        userId: ctx.userId,
        type: 'balanceUpdate',
        newBalance: updatedUser.currentBalance
      });

      return { success: true, message: `Added ₹${input.amount} to your wallet` };
    }),

  // Subscription for loan updates
  onLoanUpdate: protectedProcedure.subscription(({ ctx }) => {
    return observable<LoanUpdate>((emit) => {
      const onUpdate = (data: LoanUpdate & { userId: number }) => {
        if (data.userId === ctx.userId) {
          emit.next(data);
        }
      };

      ee.on('loanUpdate', onUpdate);

      return () => {
        ee.off('loanUpdate', onUpdate);
      };
    });
  }),

  // Subscription for balance updates
  onBalanceUpdate: protectedProcedure.subscription(({ ctx }) => {
    return observable<BalanceUpdate>((emit) => {
      const onUpdate = (data: BalanceUpdate & { userId: number }) => {
        if (data.userId === ctx.userId) {
          emit.next(data);
        }
      };

      ee.on('balanceUpdate', onUpdate);

      return () => {
        ee.off('balanceUpdate', onUpdate);
      };
    });
  })
});
