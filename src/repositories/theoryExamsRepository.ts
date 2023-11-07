import prisma from "../lib/db";

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

export default {
  findClientNext,
  create,
};
