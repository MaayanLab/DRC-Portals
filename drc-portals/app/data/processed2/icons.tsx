import prisma from '@/lib/prisma'
import singleton from '@/lib/singleton'

export const dccIcons = singleton('dccIcons', async () => {
  const dcc_icons = await prisma.dCC.findMany({
    select: {
      short_label: true,
      icon: true,
    }
  })
  return Object.fromEntries(dcc_icons.map(dcc => [dcc.short_label, dcc.icon]))
})
