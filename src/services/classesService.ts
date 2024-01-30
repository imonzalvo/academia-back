import { UserAcademy } from "@prisma/client";
import classesRepository, {
  ICreateClass,
  IUpdateClass,
} from "../repositories/classesRepository";
import NotFoundError from "../errors/notFound";
import UnauthorizedError from "../errors/unauthorizedError";
import clientsService from "./clientsService";
import { addHours } from "date-fns";
import ValidationError from "../errors/validationError";
import practicalExamsRepository from "../repositories/practicalExamsRepository";

interface ClassTimeSlotValidator {
  date?: string;
  instructorId?: string;
}

const create = async (classData: ICreateClass, currentUser: UserAcademy) => {
  await clientsService.validateClientForUser(classData.clientId, currentUser);
  await validateTimeSlotForClass(classData);

  const result = await classesRepository.create(classData);

  return result;
};

const update = async (classData: IUpdateClass, currentUser: UserAcademy) => {
  await validateClassForUser(classData.id, currentUser);
  await validateTimeSlotForClass(classData);

  console.log("class data", classData)
  const result = await classesRepository.update(classData);

  return result;
};

const deleteClass = async (classId: string, currentUser: UserAcademy) => {
  await validateClassForUser(classId, currentUser);
  const result = await classesRepository.delete(classId);

  return result;
};

// Auxiliary functions

const validateClassForUser = async (
  classId: string,
  currentUser: UserAcademy
) => {
  const classData = await classesRepository.get(classId);
  if (!classData) throw new NotFoundError("Class not found");
  if (classData.client.academyId != currentUser.academyId)
    throw new UnauthorizedError("Class does not belong to user academy");
};

const validateTimeSlotForClass = async (classData: ClassTimeSlotValidator) => {
  if (!classData.date) {
    return true;
  }

  if (!!classData.instructorId) {
    const from = new Date(classData.date);
    const to = addHours(new Date(classData.date), 1);

    const classesTimeSlotAvailablePromise =
      classesRepository.isTimeSlotAvailable(
        { from, to },
        classData.instructorId,
        classData.id
      );

    const examsTimeSlotAvailablePromise =
      practicalExamsRepository.isTimeSlotAvailable(
        { from, to },
        classData.instructorId
      );

    const validations = await Promise.all([
      classesTimeSlotAvailablePromise,
      examsTimeSlotAvailablePromise,
    ]);

    const classesTimeSlotAvailable = validations[0];
    const examsTimeSlotAvailable = validations[1];

    // TODO: check validations
    console.log("")

    if (!classesTimeSlotAvailable || !examsTimeSlotAvailable) {
      throw new ValidationError("Instructor no disponible en este horario");
    }
  }
};

export default {
  create: create,
  update: update,
  delete: deleteClass,
};
