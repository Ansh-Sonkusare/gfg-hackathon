import { router, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '../types';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key'; // In production, use env

export const authRouter = router({
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
          role: user.role,
        },
      };
    }),

  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      role: ctx.user.role,
    };
  }),
});