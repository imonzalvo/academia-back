import prisma from "../lib/db";

const create = async (user) => {
  const result = await prisma.userAcademy.create({
    data: {
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      salt: user.salt,
      hash: user.hash,
    },
  });

  return result;
};

const get = async (id: string) => {
  if (!id) return null;

  const user = await prisma.userAcademy.findUnique({
    where: { id },
  });

  return user;
};

const findByUsername = async (username: string) => {
  const user = await prisma.userAcademy.findFirst({
    where: { username },
  });

  return user;
};

export default {
  create,
  get,
  findByUsername,
};
