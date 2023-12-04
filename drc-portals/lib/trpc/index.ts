import { initTRPC } from '@trpc/server';
import singleton from '@/lib/singleton';
export const {
  router,
  procedure,
  mergeRouters,
} = singleton('trpc', () => initTRPC.create())