import { Status } from "@prisma/client";
import prisma from "../lib/db";
import { PaginationOptions } from "./types";

export interface ICreateClass {
  clientId: string;
  date?: string;
  time?: string;
  comment?: string;
  notified?: boolean;
  instructor?: string;
  status?: Status;
  paid?: boolean;
}

export interface IUpdateClass {
  id: string;
  date?: string;
  time?: string;
  comment?: string;
  notified?: boolean;
  instructor?: string;
  status?: Status;
  paid?: boolean;
}

const create = async (classData: ICreateClass) => {
  const result = await prisma.class.create({
    data: {
      date: classData.date,
      time: classData.time,
      comment: classData.comment,
      notified: classData.notified,
      instructor: classData.instructor,
      status: classData.status,
      paid: classData.paid,
      client: { connect: { id: classData.clientId } },
    },
  });

  return result;
};

const update = async (classData: IUpdateClass) => {
  const result = await prisma.class.update({
    where: { id: classData.id },
    data: {
      date: classData.date,
      time: classData.time,
      comment: classData.comment,
      notified: classData.notified,
      instructor: classData.instructor,
      status: classData.status,
      paid: classData.paid,
    },
  });

  return result;
};

const getAll = async (paginationOptions: PaginationOptions) => {
  const queryResult = await prisma.$transaction([
    prisma.class.count(),
    prisma.class.findMany({
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

const deleteClass = async (id: string) => {
  const result = await prisma.class.delete({
    where: { id },
  });
  return result;
};

const getClassesByDate = async (academyId: string, from: Date, to: Date) => {
  const queryResult = await prisma.class.findMany({
    where: {
      client: {
        academyId,
      },
      date: { gte: from, lte: to },
    },
    select: {
      id: true,
      date: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return queryResult;
};

const get = async (id: string) => {
  const result = await prisma.class.findUnique({
    where: { id },
    include: {
      client: true,
    },
  });

  return result;
};

export default {
  create,
  update,
  get,
  delete: deleteClass,
  getAll,
  getClassesByDate,
};
