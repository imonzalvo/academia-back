import {
  Client,
  Prisma,
  ClientStatus,
  Class,
  TheoryExam,
  PracticalExam,
  knownUsBy,
} from "@prisma/client";
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
  academyId?: string;
  status: "DONE" | "ACTIVE" | "INACTIVE";
  knownUsBy: knownUsBy;
}

interface ClientSearch {
  data: Client;
  total: number;
}

const create = async (newClient: ICreateClient) => {
  const fullName = `${newClient.name} ${newClient.lastName}`;
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
      knownUsBy: newClient.knownUsBy,
      academy: { connect: { id: newClient.academyId } },
      fullName,
    },
  });

  return result;
};

type PopulatedClient = Client & {
  classes: Class[];
  theoryExams: TheoryExam[];
  practicalExams: PracticalExam[];
};

const get = async (id: string): Promise<PopulatedClient> => {
  if (!id) return null;

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
        include: {
          realInstructor: true,
        },
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  return client;
};

const update = async (updatedClient: Partial<ICreateClient>) => {
  const fullName = `${updatedClient.name} ${updatedClient.lastName}`;

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
      knownUsBy: updatedClient.knownUsBy,
      status: updatedClient.status,
      fullName,
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

const search = async (
  academyId: string,
  paginationOptions: PaginationOptions,
  search: string | undefined,
  status: ClientStatus | undefined
) => {
  const searchConditionsConjunction = [];

  searchConditionsConjunction.push({
    academyId: academyId,
  });

  if (!!search) {
    const nameSearchClause = {
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
        {
          fullName: {
            contains: search,
            mode: "insensitive" as Prisma.QueryMode,
          },
        },
      ],
    };
    searchConditionsConjunction.push(nameSearchClause);
  }

  if (!!status) {
    const statusCientClause = {
      status: status,
    };
    searchConditionsConjunction.push(statusCientClause);
  }

  const whereClause = {
    AND: searchConditionsConjunction,
  };

  const queryResult = await prisma.$transaction([
    prisma.client.count({
      where: whereClause,
    }),
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

const getNewClientsByDate = async (academyId: string, from: Date, to: Date) => {
  const queryResult = await prisma.client.findMany({
    where: {
      academyId,
      createdAt: { gte: from, lte: to },
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  return queryResult;
};

const getKnownByStats = async (
  academyId: string,
  dateRange?: { from: Date; to: Date }
) => {
  const whereClause = {
    knownUsBy: {
      not: null,
    },
    academyId,
  };

  if (!!dateRange) {
    whereClause["createdAt"] = {
      gte: dateRange.from,
      lte: dateRange.to,
    };
  }

  const queryResult = await prisma.client.groupBy({
    by: ["knownUsBy"],
    where: whereClause,
    _count: true,
  });

  const formattedResult = queryResult.map((result) => {
    return {
      category: result.knownUsBy,
      count: result._count,
    };
  });

  return formattedResult;
};

const getCountActiveClients = async (academyId: string) => {
  const queryResult = await prisma.client.count({
    where: {
      academyId,
      status: "ACTIVE",
    },
  });

  return queryResult;
};

const getGeneralInfoDoneStudents = async (academyId: string) => {
  const queryResult = await prisma.client.findMany({
    where: {
      academyId,
      status: "DONE",
    },
    select: {
      _count: {
        select: {
          classes: true,
          theoryExams: true,
          practicalExams: true,
        },
      },
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
  getKnownByStats,
  getCountActiveClients,
  getGeneralInfoDoneStudents,
};
