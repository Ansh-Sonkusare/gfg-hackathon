import { router, protectedProcedure } from '../trpc';
import { prisma } from '../types';
import type { CreateAdvertisementInput } from '../types';

export const advertisementRouter = router({
  createAdvertisement: protectedProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null) {
        const input = val as CreateAdvertisementInput;

        // Validation
        if (input.minAmount >= input.maxAmount) throw new Error('Min amount must be less than max amount');
        if (input.minDuration >= input.maxDuration) throw new Error('Min duration must be less than max duration');
        if (input.interestRate < 0 || input.interestRate > 50) throw new Error('Interest rate must be between 0 and 50');

        return input;
      }
      throw new Error('Invalid input');
    })
    .mutation(async ({ input, ctx }) => {
      // Check if user is a lender (has lent money before)
      const hasLent = await prisma.loan.count({
        where: { lenderId: ctx.userId }
      });

      if (hasLent === 0) {
        throw new Error('You must have lent money at least once to create advertisements');
      }

      // Check max advertisements per user (3)
      const activeAds = await prisma.lenderAdvertisement.count({
        where: { lenderId: ctx.userId, isActive: true }
      });

      if (activeAds >= 3) {
        throw new Error('Maximum 3 active advertisements allowed per lender');
      }

      const advertisement = await prisma.lenderAdvertisement.create({
        data: {
          lenderId: ctx.userId,
          ...input
        },
        include: {
          lender: {
            select: {
              name: true,
              collegeName: true,
              creditScore: true,
              reputation: true
            }
          }
        }
      });

      return advertisement;
    }),

  getMyAdvertisements: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.lenderAdvertisement.findMany({
      where: { lenderId: ctx.userId },
      orderBy: { createdAt: 'desc' }
    });
  }),

  updateAdvertisement: protectedProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'id' in val) {
        const input = val as {
          id: number;
          minAmount?: number;
          maxAmount?: number;
          interestRate?: number;
          minDuration?: number;
          maxDuration?: number;
          riskTolerance?: string;
          targetAudience?: string;
          isActive?: boolean;
        };
        return input;
      }
      throw new Error('Invalid input');
    })
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      // Verify ownership
      const ad = await prisma.lenderAdvertisement.findFirst({
        where: { id, lenderId: ctx.userId }
      });

      if (!ad) {
        throw new Error('Advertisement not found or access denied');
      }

      return await prisma.lenderAdvertisement.update({
        where: { id },
        data: updateData
      });
    }),

  deleteAdvertisement: protectedProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'id' in val) {
        return val as { id: number };
      }
      throw new Error('Invalid input');
    })
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const ad = await prisma.lenderAdvertisement.findFirst({
        where: { id: input.id, lenderId: ctx.userId }
      });

      if (!ad) {
        throw new Error('Advertisement not found or access denied');
      }

      await prisma.lenderAdvertisement.delete({
        where: { id: input.id }
      });

      return { success: true };
    }),

  getAdvertisements: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.lenderAdvertisement.findMany({
      where: { isActive: true },
      include: {
        lender: {
          select: {
            name: true,
            collegeName: true,
            creditScore: true,
            reputation: true,
            trustBadge: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  })
});