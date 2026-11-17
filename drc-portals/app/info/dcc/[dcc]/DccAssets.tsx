import prisma from '@/lib/prisma'
import { DCCAccordion } from '@/components/misc/DCCAccordion'
import { getDccDataObj } from '@/utils/dcc-assets'

export default async function DccAssets({ id, name }: { id: string, name: string }) {
  const assets = await getDccDataObj(prisma, id, name)
  return <DCCAccordion dcc={name} fulldata={assets} />
}
