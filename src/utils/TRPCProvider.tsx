'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, httpSubscriptionLink, splitLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from './trpc';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
        links: [
          splitLink({
            condition: (op) => op.type === 'subscription',
            true: httpSubscriptionLink({
              url: '/api/trpc',
            }),
            false: httpBatchLink({
              url: '/api/trpc',
              fetch: (url, options) => fetch(url, { ...options, credentials: 'include' }),
            }),
          }),
        ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}