import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const clients = await prisma.client.findMany({});

  const promises = clients.map(async (client) => {
    return prisma.client.update({
      where: { id: client.id },
      data: {
        fullName: `${client.name} ${client.lastName}`,
      },
    });
  });

  console.log("before promises")
  await Promise.all(promises);

  console.log("Seeded the database with new clients: \n", clients[0]);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
