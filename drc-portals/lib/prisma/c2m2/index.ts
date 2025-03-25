import { PrismaClient } from '.prisma/client/c2m2'
import singleton from '@/lib/singleton'

export default singleton('prisma-c2m2', () => {
  if (process.env.NODE_ENV === 'development') {
    const prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
      ],
    })
    prisma.$on('query', async (e) => {
        console.log(`${e.query} ${e.params}`)
    })
    return prisma
  }
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.C2M2_DATABASE_URL || process.env.DATABASE_URL,
      },
    },
  }).$extends({
    query: {
      $allOperations({ args, query, operation }) {
        return query(args).catch(e => console.error(`[exception in prisma-c2m2 op ${operation}]: ${e}`))
      },
    },
  })
})
