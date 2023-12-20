import { Status } from "@prisma/client";
import prisma from "../lib/db";
import { DateRange, PaginationOptions } from "./types";

export interface ICreateClass {
  clientId: string;
  date?: string;
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
      realInstructor: !!classData.instructorId
        ? { connect: { id: classData.instructorId } }
        : undefined,
    },
    include: {
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

  const result = await prisma.class.update({
    where: { id: classData.id },
    data: updateData,
    include: {
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
    },
    select: {
      id: true,
      date: true,
      time: true,
      status: true,
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
};
