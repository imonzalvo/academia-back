import { Status } from "@prisma/client";
import prisma from "../lib/db";
import { PaginationOptions } from "./types";

export interface ICreatePracticalExam {
  clientId: string;
  date: string;
  paid: boolean;
  comment: string;
  notified: boolean;
  time: string;
  result: { circuit: boolean; street: boolean };
}

const findClientNext = async (clientId: string) => {
  const nextExam = await prisma.practicalExam.findFirst({
    where: {
      clientId: clientId,
      status: "PENDING",
      date: {
        gte: new Date(),
      },
    },
  });

  return nextExam;
};

const findNextExams = async (paginationOptions: PaginationOptions) => {
  const whereClause = {
    status: "PENDING" as Status,
    date: {
      gt: new Date(),
    },
  };
  const queryResult = await prisma.$transaction([
    prisma.practicalExam.count(),
    prisma.practicalExam.findMany({
      where: whereClause,
      skip: paginationOptions.skip,
      take: paginationOptions.limit,
      orderBy: {
        date: "asc",
      },
      include: {
        result: true,
        client: {
          select: {
            name: true,
            lastName: true,
          },
        },
      },
    }),
  ]);

  const total = queryResult[0];
  const practicalExams = queryResult[1];

  return { data: practicalExams, total };
};

const create = async (newPracticalExam: ICreatePracticalExam) => {
  const createdPayment = await prisma.practicalExam.create({
    data: {
      paid: newPracticalExam.paid,
      date: newPracticalExam.date,
      comment: newPracticalExam.comment,
      notified: newPracticalExam.notified,
      time: newPracticalExam.time,
      status: "PENDING",
      result: {
        create: {
          street: newPracticalExam.result.street,
          circuit: newPracticalExam.result.circuit,
        },
      },
      client: { connect: { id: newPracticalExam.clientId } },
    },
    include: {
      result: true,
    },
  });

  return createdPayment;
};

const getExamsByDate = async (from: Date, to: Date) => {
  const maxDate = to < new Date() ? to : new Date();

  const queryResult = await prisma.practicalExam.findMany({
    where: {
      date: { gte: from, lte: maxDate },
      status: {
        in: ["DONE", "PENDING"]
      },
    },
    select: {
      id: true,
      date: true,
      status: true,
      result: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return queryResult;
};

export default {
  create,
  findClientNext,
  findNextExams,
  getExamsByDate,
};
