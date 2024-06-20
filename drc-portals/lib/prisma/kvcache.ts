import prisma from "@/lib/prisma";
import { Prisma } from '@prisma/client'
import { z } from 'zod'

export default async function kvCache<T extends Prisma.InputJsonValue | null | undefined>(
  key: string,
  dataFactory: () => Promise<T>,
  expiration: number | null = 60*1000,
): Promise<T> {
  const entry = await prisma.kVStore.findUnique({
    where: { key }
  })
  if (entry !== null) {
    const { expires, data } = z.object({
      expires: z.number().optional(),
      data: z.any(),
    }).parse(entry.value)
    if (expires && expires > Date.now()) {
      console.log('cache hit')
      return data
    }
  }
  const expires = expiration !== null ? Date.now() + expiration : expiration
  const data = await dataFactory()
  await prisma.kVStore.upsert({
    where: { key },
    create: {
      key,
      value: {
        expires,
        data,
      }
    },
    update: {
      value: {
        expires,
        data,
      }
    }
  })
  return data
}
