import { Status } from "@prisma/client";
import prisma from "../lib/db";
import { PaginationOptions } from "./types";

export interface ICreateTheoryExam {
  clientId: string;
  date: string;
  comment: string;
  notified: boolean;
  time: string;
  result: boolean;
}

const findClientNext = async (clientId: string) => {
  const futureExam = await prisma.theoryExam.findFirst({
    where: {
      clientId: clientId,
      status: "PENDING",
      date: {
        gte: new Date(),
      },
    },
  });

  return futureExam;
};

const create = async (exam: ICreateTheoryExam) => {
  const newExam = await prisma.theoryExam.create({
    data: {
      date: exam.date,
      comment: exam.comment,
      notified: exam.notified,
      result: exam.result,
      time: exam.time,
      client: { connect: { id: exam.clientId } },
    },
  });

  return newExam;
};

const findNextExams = async (paginationOptions: PaginationOptions) => {
  const whereClause = {
    status: "PENDING" as Status,
    date: {
      gt: new Date(),
    },
  };
  const queryResult = await prisma.$transaction([
    prisma.theoryExam.count(),
    prisma.theoryExam.findMany({
      where: whereClause,
      skip: paginationOptions.skip,
      take: paginationOptions.limit,
      orderBy: {
        date: "asc",
      },
      include: {
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
  const theoryExams = queryResult[1];

  return { data: theoryExams, total };
};

const getExamsByDate = async (academyId: string, from: Date, to: Date) => {
  const maxDate = to < new Date() ? to : new Date();

  const queryResult = await prisma.theoryExam.findMany({
    where: {
      client: {
        academyId,
      },
      date: { gte: from, lte: maxDate },
      status: {
        in: ["DONE", "PENDING"],
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
  findNextExams,
  findClientNext,
  create,
  getExamsByDate,
};
