import { router } from '../trpc';
import { borrowerRouter } from './borrower';
import { lenderRouter } from './lender';

export const appRouter = router({
  borrower: borrowerRouter,
  lender: lenderRouter,
});

export type AppRouter = typeof appRouter;