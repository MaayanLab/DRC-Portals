import { cache } from 'react'
import { connection } from 'next/server'
import prisma from '@/lib/prisma'

// Share probes between the layout and page within a request. Do not cache outages
// across requests, so refreshing can recover as soon as the service returns.
async function available(probe: () => PromiseLike<unknown>): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      Promise.resolve().then(probe).then(() => true),
      new Promise<false>(resolve => {
        timer = setTimeout(() => resolve(false), 3000)
      }),
    ])
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

export const getServiceStatus = cache(async () => {
  // Opt into request-time rendering at the data boundary, outside error handlers.
  await connection()
  // Optional C2M2 and GSC services are handled by the features that use them.
  // Their availability must not delay or disable the rest of the site.
  const primary = await available(() => prisma.$queryRaw`SELECT 1`)
  return { primary, interrupted: !primary }
})
