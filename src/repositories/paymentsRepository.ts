import prisma from "../lib/db";
import { PaginationOptions } from "./types";

const getAll = async (paginationOptions: PaginationOptions) => {
  const queryResult = await prisma.$transaction([
    prisma.payment.count(),
    prisma.payment.findMany({
      skip: paginationOptions.skip,
      take: paginationOptions.limit,
      include: {
        client: {
          select: {
            name: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const total = queryResult[0];
  const clients = queryResult[1];

  return { data: clients, total };
};

export default {
  getAll,
};
