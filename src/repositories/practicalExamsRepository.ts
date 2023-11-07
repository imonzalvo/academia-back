import prisma from "../lib/db";

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

export default {
  create,
  findClientNext,
};
