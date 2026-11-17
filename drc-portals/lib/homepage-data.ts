import prisma from '@/lib/prisma'
import singleton from '@/lib/singleton'
import trpc from '@/lib/trpc/server'
import { createLastGoodCache } from '@/lib/last-good-cache'
import { getServiceStatus } from '@/lib/service-status'

// No sessions, user data, or personalized queries belong in this shared cache.
const cached = singleton('homepage-public-data', () => createLastGoodCache())

export async function getHomepagePublications() {
  const status = await getServiceStatus()
  return cached('publications', () => prisma.publication.findMany({
    orderBy: { year: 'desc' }, take: 9,
  }), status.primary)
}

export async function getHomepagePrograms() {
  const status = await getServiceStatus()
  return cached('programs', () => prisma.dCC.findMany({
    where: {
      cfde_partner: true, active: true, hidden: false,
      short_label: { in: [
        'Kids First', 'A2CPS', 'HuBMAP', '4DN', 'LINCS', 'IDG', 'GlyGen',
        'Bridge2AI', 'MoTrPAC', 'Metabolomics', 'SPARC', 'HMP', 'GTEx',
        'SenNet', 'ExRNA', 'SCGE', 'SMaHT',
      ] },
    },
  }), status.primary)
}

export function getHomepageSummary(include?: string[]) {
  return cached(`summary:${JSON.stringify(include)}`, () => trpc.types({ include }))
}

export async function getHomepageTweets() {
  const status = await getServiceStatus()
  return cached('tweets', () => prisma.kVStore.findFirst({
    select: { value: true }, where: { key: 'twitter-tweets' },
  }), status.primary)
}
