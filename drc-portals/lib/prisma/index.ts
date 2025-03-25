import { PrismaClient } from '.prisma/client'
import singleton from '@/lib/singleton'

export default singleton('prisma', () => {
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
        url: process.env.DATABASE_URL,
      },
    },
  }).$extends({
    query: {
      $allOperations({ args, query, operation }) {
        return query(args).catch(e => console.error(`[exception in prisma op ${operation}]: ${e}`))
      },
    },
  })
})
