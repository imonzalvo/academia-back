import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const clients = await prisma.client.updateMany({
    data: {
        academyId: "6573b6e66219c7abbb8d1743"
    }
  })

  console.log("Seeded the database with new clients: \n", clients)
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