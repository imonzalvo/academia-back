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
    },
  });
  return result;
};

export default {
  create,
  update,
};
