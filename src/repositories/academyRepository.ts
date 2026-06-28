import prisma from "../lib/db";

export interface ICreateAcademy {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  handle: string;
  userId: string;
}

export interface IUpdateAcademy {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notificationMinutesInAdvance?: number;
}

export interface ICreateInstructor {
  name: string;
  username: string;
}

const create = async (academy: ICreateAcademy) => {
  const result = await prisma.academy.create({
    data: {
      name: academy.name,
      phone: academy.phone,
      email: academy.email,
      address: academy.address,
      handle: academy.handle,
      users: { connect: { id: academy.userId } },
    },
  });
  return result;
};

const update = async (academy: IUpdateAcademy) => {
  const result = await prisma.academy.update({
    where: { id: academy.id },
    data: {
      name: academy.name,
      address: academy.address,
      phone: academy.phone,
      email: academy.email,
      notificationMinutesInAdvance: academy.notificationMinutesInAdvance,
    },
  });
  return result;
};

const getById = async (id: string) => {
  return prisma.academy.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      address: true,
      notificationMinutesInAdvance: true,
    },
  });
};

const createInstructor = async (
  academyId: string,
  instructorData: ICreateInstructor
) => {
  const newInstructor = await prisma.userAcademy.create({
    data: {
      name: instructorData.name,
      username: instructorData.username,
      academy: { connect: { id: academyId } },
      role: "INSTRUCTOR",
    },
  });

  return newInstructor;
};

const getInstructors = async (academyId: string) => {
  const newInstructor = await prisma.userAcademy.findMany({
    where: {
      academyId,
      role: "INSTRUCTOR",
    },
  });

  return newInstructor;
};

const getAll = async () => {
  return prisma.academy.findMany({
    select: {
      id: true,
      notificationsEnabled: true,
      notificationMinutesInAdvance: true,
      contactPhone: true,
      contactWhatsApp: true,
    },
  });
};

const updateNotificationConfig = async (
  id: string,
  config: {
    notificationsEnabled?: boolean;
    contactPhone?: string;
    contactWhatsApp?: string;
  }
) => {
  return prisma.academy.update({
    where: { id },
    data: config,
  });
};

export default {
  create,
  update,
  getById,
  createInstructor,
  getInstructors,
  getAll,
  updateNotificationConfig,
};
