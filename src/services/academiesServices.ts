import academyRepository, {
  ICreateAcademy,
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

export default {
  create,
  update,
};
