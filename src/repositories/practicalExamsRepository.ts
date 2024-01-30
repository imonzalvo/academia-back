import { Status } from "@prisma/client";
import prisma from "../lib/db";
import { DateRange, PaginationOptions } from "./types";
import { addHours, subHours } from "date-fns";

export interface ICreatePracticalExam {
  clientId: string;
  instructorId: string;
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
        finalResult: true,
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
      realInstructor: { connect: { id: newPracticalExam.instructorId } },
    },
    include: {
      result: true,
      finalResult: true
    },
  });

  return createdPayment;
};

const getExamsByDate = async (academyId: string, from: Date, to: Date) => {
  const maxDate = to < new Date() ? to : new Date();

  const queryResult = await prisma.practicalExam.findMany({
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

const isTimeSlotAvailable = async (range: DateRange, instructorId: string) => {
  // Check if there exists a class starting less than 1hr
  // before this slot OR starting less than an hour after this slot

  const slotBefore = subHours(range.from, 1);
  const slotAfter = addHours(range.from, 1);

  const lessThan1HrBeforeClause = [
    // Starting less than 1hr BEFORE this slot
    {
      date: {
        gt: slotBefore,
      },
    },
    {
      date: {
        lte: range.from,
      },
    },
  ];

  const lessThan1HrAfterClause = [
    // Starting less than 1hr AFTER this slot
    {
      date: {
        gt: range.from,
      },
    },
    {
      date: {
        lt: slotAfter,
      },
    },
  ];

  const result = await prisma.practicalExam.findMany({
    where: {
      AND: [
        {
          OR: [
            {
              AND: lessThan1HrBeforeClause,
            },
            {
              AND: lessThan1HrAfterClause,
            },
          ],
        },
        {
          realInstructorId: {
            equals: instructorId,
          },
        },
      ],
    },
  });
  console.log("exam result", result)

  return result && result.length == 0;
};

export default {
  create,
  findClientNext,
  findNextExams,
  getExamsByDate,
  isTimeSlotAvailable,
};
