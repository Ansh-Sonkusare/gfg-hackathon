import { router, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '../types';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key'; // In production, use env

export const authRouter = router({
  signup: publicProcedure
    .input(z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      collegeName: z.string().min(1, 'College name is required'),
      collegeYear: z.number().min(1).max(4),
    }))
    .mutation(async ({ input }) => {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const user = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: input.password, // In production, hash this password
          collegeName: input.collegeName,
          collegeYear: input.collegeYear,
          creditScore: Math.floor(Math.random() * 350) + 550, // Random credit score 550-900
          trustBadge: Math.random() > 0.7, // 30% chance of trust badge
          currentBalance: Math.floor(Math.random() * 20000) + 500, // Random balance 500-20500
          reputation: 'Fair', // Default reputation
          emergencyCreditAvailable: Math.floor(Math.random() * 1000) + 100, // Random emergency credit 100-1100
          riskTolerance: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
          loanAmount: [200, 300, 400, 500, 600, 700, 800, 900, 1000][Math.floor(Math.random() * 9)],
          loanDuration: [7, 14, 21, 30][Math.floor(Math.random() * 4)],
        },
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // In production, use proper password hashing
      if (user.password !== input.password) {
        throw new Error('Invalid email or password');
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    }),

  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
    };
  }),
});