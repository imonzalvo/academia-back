import academyRepository, {
  ICreateAcademy,
  ICreateInstructor,
  IUpdateAcademy,
} from "../repositories/academyRepository";

const create = async (newClient: ICreateAcademy) => {
  const newAcademy = await academyRepository.create(newClient);

  return newAcademy;
};

const update = async (updatedAcademy: IUpdateAcademy) => {
  const academy = await academyRepository.update(updatedAcademy);

  return academy;
};

const createInstructor = async (
  academyId: string,
  instructor: ICreateInstructor
) => {
  return await academyRepository.createInstructor(academyId, instructor);
};

const getInstructors = async (academyId: string) => {
  return await academyRepository.getInstructors(academyId);
};

export default {
  create,
  update,
  createInstructor,
  getInstructors
};
