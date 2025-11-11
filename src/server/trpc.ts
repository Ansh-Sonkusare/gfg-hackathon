import { initTRPC } from '@trpc/server';
import { EventEmitter } from 'events';

export const createTRPCContext = () => {
  return {
    userId: 1, // Mock user ID - replace with actual auth
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Event emitter for subscriptions
export const ee = new EventEmitter();