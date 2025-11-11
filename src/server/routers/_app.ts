import { router } from '../trpc';
import { authRouter } from './auth';
import { borrowerRouter } from './borrower';
import { lenderRouter } from './lender';
import { advertisementRouter } from './advertisement';

export const appRouter = router({
  auth: authRouter,
  borrower: borrowerRouter,
  lender: lenderRouter,
  advertisement: advertisementRouter,
});

export type AppRouter = typeof appRouter;