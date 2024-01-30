import { Status } from "@prisma/client";
import prisma from "../lib/db";
import { DateRange, PaginationOptions } from "./types";
import { addHours, subHours } from "date-fns";

export interface ICreateClass {
  clientId: string;
  date: string;
  time?: string;
  comment?: string;
  notified?: boolean;
  instructor?: string;
  status?: Status;
  paid?: boolean;
  instructorId?: string;
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
  instructorId?: string;
  clientId?: string;
}

const isTimeSlotAvailable = async (
  range: DateRange,
  instructorId: string,
  classId?: string
) => {
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

  const result = await prisma.class.findMany({
    where: {
      status: {
        not: {
          equals: "CANCELED",
        },
      },
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
        {
          id: {
            not: {
              equals: classId,
            },
          },
        },
      ],
    },
  });

  return result && result.length == 0;
};

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
      realInstructor: !!classData.instructorId
        ? { connect: { id: classData.instructorId } }
        : undefined,
    },
    include: {
      client: {
        select: {
          name: true,
          fullName: true,
          lastName: true,
          id: true,
        },
      },
      realInstructor: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return result;
};

const update = async (classData: IUpdateClass) => {
  let updateData = {
    date: classData.date,
    time: classData.time,
    comment: classData.comment,
    notified: classData.notified,
    instructor: classData.instructor,
    status: classData.status,
    paid: classData.paid,
  };

  if (!!classData.instructorId) {
    updateData["realInstructor"] = { connect: { id: classData.instructorId } };
  }

  if (!!classData.clientId) {
    updateData["client"] = { connect: { id: classData.clientId } };
  }

  const result = await prisma.class.update({
    where: { id: classData.id },
    data: updateData,
    include: {
      client: {
        select: {
          id: true,
          fullName: true,
        },
      },
      realInstructor: {
        select: {
          id: true,
          name: true,
        },
      },
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
        realInstructor: {
          select: {
            id: true,
            name: true,
          },
        },
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

const getByDateRangeAndInstructor = async (
  instructorId: string,
  dateRange: DateRange
) => {
  const queryResult = await prisma.class.findMany({
    where: {
      realInstructorId: instructorId,
      date: { gte: dateRange.from, lte: dateRange.to },
      status: {
        not: {
          equals: "CANCELED",
        },
      },
    },
    select: {
      id: true,
      date: true,
      time: true,
      status: true,
      notified: true,
      paid: true,
      comment: true,
      realInstructorId: true,
      client: {
        select: {
          fullName: true,
          id: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  return queryResult;
};

const deleteClass = async (id: string) => {
  const result = await prisma.class.delete({
    where: { id },
    include: {
      realInstructor: true,
    },
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
      realInstructor: true,
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
  getByDateRangeAndInstructor,
  isTimeSlotAvailable,
};
