// if schema changes run the commands in
// npx prisma generate
// then run this

import prisma from '@/lib/prisma'

async function main() {
  const allsamples = await prisma.geneEntity.findMany()
  // console.log(allsamples)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })