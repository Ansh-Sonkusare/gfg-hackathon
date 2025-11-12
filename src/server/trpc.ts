import { initTRPC } from '@trpc/server';
import { EventEmitter } from 'events';
import { prisma } from './types';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key'; // In production, use env

const t = initTRPC.context<typeof createTRPCContext>().create();
export const createTRPCContext = (opts: { req: Request }) => {
  // Get user ID from JWT in cookies
  const cookieHeader = opts.req.headers.get('cookie');
  console.log('TRPC Context - Cookie header:', cookieHeader);

  const tokenCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
  console.log('TRPC Context - Token cookie:', tokenCookie ? 'present' : 'missing');

  let userId: number | null = null;
  if (tokenCookie) {
    try {
      const decoded = jwt.verify(tokenCookie, JWT_SECRET) as { userId: number };
      userId = decoded.userId;
      console.log('TRPC Context - Token verified, userId:', userId);
    } catch (err) {
      console.log('TRPC Context - Token verification failed:', err);
    }
  }

  return {
    userId,
  };
};

// Middleware to check authentication
export const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new Error('Not authenticated');
  }

  const user = await prisma.user.findUnique({ where: { id: ctx.userId } });
  if (!user) {
    throw new Error('User not found');
  }

  return next({
    ctx: {
      ...ctx,
      user,
      userId: ctx.userId,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);


export const router = t.router;
export const publicProcedure = t.procedure;

// Event emitter for subscriptions
export const ee = new EventEmitter();
