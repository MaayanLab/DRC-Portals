import { PrismaClient } from '.prisma/client/gsc'
import singleton from '@/lib/singleton'

export default singleton('prisma-gsc', () => {
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
  return new PrismaClient()
})
