import { Client, Prisma, ClientStatus } from "@prisma/client";
import prisma from "../lib/db";
import { PaginationOptions } from "./types";

export interface ICreateClient {
  id?: string;
  name: string;
  lastName: string;
  email: string;
  ci: string;
  phone: string;
  address: string;
  notes: string;
  secondaryPhone: string;
  status: "DONE" | "ACTIVE" | "INACTIVE";
}

interface ClientSearch {
  data: Client;
  total: number;
}

const create = async (newClient: ICreateClient) => {
  const result = await prisma.client.create({
    data: {
      name: newClient.name,
      lastName: newClient.lastName,
      email: newClient.email,
      ci: newClient.ci,
      phone: newClient.phone,
      address: newClient.address,
      notes: newClient.notes,
      secondaryPhone: newClient.secondaryPhone,
      status: newClient.status,
    },
  });

  return result;
};

const get = async (id: string) => {
  const client = await prisma.client.findFirst({
    where: { id },
    include: {
      payments: true,
      practicalExams: {
        include: {
          result: true,
        },
        orderBy: {
          date: "desc",
        },
      },
      theoryExams: {
        orderBy: {
          date: "desc",
        },
      },
      classes: {
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  return client;
};

const update = async (updatedClient: Partial<ICreateClient>) => {
  const result = await prisma.client.update({
    where: { id: updatedClient.id },
    data: {
      name: updatedClient.name,
      lastName: updatedClient.lastName,
      email: updatedClient.email,
      ci: updatedClient.ci,
      phone: updatedClient.phone,
      address: updatedClient.address,
      notes: updatedClient.notes,
      secondaryPhone: updatedClient.secondaryPhone,
      status: updatedClient.status,
    },
  });

  return result;
};

const deleteClient = async (id: string) => {
  const result = await prisma.client.delete({ where: { id } });
  return result;
};

const getAll = async (paginationOptions: PaginationOptions) => {
  const whereClause = {
    status: {
      in: ["ACTIVE" as ClientStatus],
    },
  };
  const queryResult = await prisma.$transaction([
    prisma.client.count({ where: whereClause }),
    prisma.client.findMany({
      where: whereClause,
      skip: paginationOptions.skip,
      take: paginationOptions.limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const total = queryResult[0];
  const clients = queryResult[1];

  return { data: clients, total };
};

const search = async (paginationOptions: PaginationOptions, search: string) => {
  const activeCientClause = {
    status: {
      in: ["ACTIVE" as ClientStatus],
    },
  };

  const searchClause = {
    OR: [
      {
        name: { contains: search, mode: "insensitive" as Prisma.QueryMode },
      },
      {
        lastName: {
          contains: search,
          mode: "insensitive" as Prisma.QueryMode,
        },
      },
    ],
  };

  const queryResult = await prisma.$transaction([
    prisma.client.count({
      where: { AND: [searchClause] },
    }),
    prisma.client.findMany({
      where: { AND: [searchClause] },
      skip: paginationOptions.skip,
      take: paginationOptions.limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const total = queryResult[0];
  const clients = queryResult[1];

  return { data: clients, total };
};

const getNewClientsByDate = async (from: Date, to: Date) => {
  const queryResult = await prisma.client.findMany({
    where: {
      createdAt: { gte: from, lte: to },
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  return queryResult;
};

export default {
  create,
  get,
  update,
  delete: deleteClient,
  getAll,
  search,
  getNewClientsByDate,
};
