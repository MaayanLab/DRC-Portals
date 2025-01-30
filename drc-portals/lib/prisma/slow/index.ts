import { PrismaClient } from '@prisma/client'
import singleton from '@/lib/singleton'

export default singleton('prisma-slow', () => {
  if (process.env.NODE_ENV === 'development') {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.PDP_DATABASE_URL || process.env.DATABASE_URL,
        },
      },
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
  return new PrismaClient()
})
