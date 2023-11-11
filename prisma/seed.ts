import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
// async function main() {
//   const clients = await prisma.client.updateMany({
//     data: {
//         status: "ACTIVE"
//     }
//   })
// }
// main()
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })