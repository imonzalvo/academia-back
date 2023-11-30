import { UserAcademy } from "@prisma/client";
import classesRepository, {
  ICreateClass,
  IUpdateClass,
} from "../repositories/classesRepository";
import NotFoundError from "../errors/notFound";
import UnauthorizedError from "../errors/unauthorizedError";
import clientsService from "./clientsService";

const create = async (classData: ICreateClass, currentUser: UserAcademy) => {
  await clientsService.validateClientForUser(classData.clientId, currentUser);
  const result = await classesRepository.create(classData);

  return result;
};

const update = async (classData: IUpdateClass, currentUser: UserAcademy) => {
  await validateClassForUser(classData.id, currentUser);
  const result = await classesRepository.update(classData);

  return result;
};

const deleteClass = async (classId: string, currentUser: UserAcademy) => {
  await validateClassForUser(classId, currentUser);
  const result = await classesRepository.delete(classId);

  return result;
};

const validateClassForUser = async (
  classId: string,
  currentUser: UserAcademy
) => {
  const classData = await classesRepository.get(classId);
  if (!classData) throw new NotFoundError("Class not found");
  if (classData.client.academyId != currentUser.academyId)
    throw new UnauthorizedError("Class does not belong to user academy");
};

export default {
  create: create,
  update: update,
  delete: deleteClass,
};
