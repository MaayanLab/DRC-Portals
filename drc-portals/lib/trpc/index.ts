import { initTRPC } from '@trpc/server';
export const {
  router,
  procedure,
  mergeRouters,
  createCallerFactory,
} = initTRPC.create()