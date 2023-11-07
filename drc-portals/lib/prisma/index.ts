import { PrismaClient } from '@prisma/client'
import singleton from '@/lib/singleton'

export default singleton('prisma', () => new PrismaClient())
