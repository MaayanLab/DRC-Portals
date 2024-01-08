// if schema changes run the commands in
// npx prisma generate
// then run this

import { PrismaClient } from '@prisma/client/'

const prisma = new PrismaClient()

async function main() {
  const allsamples = await prisma.geneEntity.findMany()
  console.log(allsamples)
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