import NotFoundError from "../errors/notFound";
import UnauthorizedError from "../errors/unauthorizedError";
import clientsRepository, {
  ICreateClient,
} from "../repositories/clientsRepository";
import type {
  Client,
  ClientStatus,
  Payment,
  UserAcademy,
} from "@prisma/client";

export interface IPopulatedClient extends Client {
  nextClass: any;
  pendingPracticalExam: any;
  pendingTheoryExam: any;
}

const create = async (client: ICreateClient) => {
  const newUser = await clientsRepository.create(client);
  return newUser;
};

const get = async (id: string, currentUser) => {
  const client = await clientsRepository.get(id);
  await validateClientForUser(id, currentUser);

  const pendingPracticalExam = client.practicalExams.filter((exam) => {
    return new Date(exam.date) > new Date() && exam.status == "PENDING";
  })[0];

  const pendingTheoryExam = client.theoryExams.filter((exam) => {
    return new Date(exam.date) > new Date() && exam.status == "PENDING";
  })[0];

  const nextClass = client.classes.filter((exam) => {
    return new Date(exam.date) > new Date();
  })[0];

  const classesPerInstructor = getClassesPerInstructor(client.classes);

  const populatedClient = {
    ...client,
    pendingPracticalExam,
    pendingTheoryExam,
    nextClass,
    instructorsInfo: classesPerInstructor,
  };

  return populatedClient;
};

const update = async (
  client: Partial<ICreateClient>,
  currentUser: UserAcademy
) => {
  await validateClientForUser(client.id, currentUser);

  const updatedClient = await clientsRepository.update(client);
  return updatedClient;
};

const deleteClient = async (id: string, currentUser: UserAcademy) => {
  await validateClientForUser(id, currentUser);

  return await clientsRepository.delete(id);
};

const getClients = async (
  academyId: string,
  skip: number,
  limit: number,
  search: string,
  status: string,
  orderBy: string
) => {
  return await clientsRepository.search(
    academyId,
    { skip, limit },
    search,
    status as ClientStatus,
    orderBy
  );
};

const validateClientForUser = async (
  clientId: string,
  currentUser: UserAcademy
) => {
  const client = await clientsRepository.get(clientId);

  if (!client) throw new NotFoundError("Client not found");
  if (client.academyId != currentUser.academyId) {
    throw new UnauthorizedError("Client does not belong to this academy");
  }
};

const getClassesPerInstructor = (classes: any) => {
  return classes.reduce((acc, cls) => {
    if (cls.realInstructor) {
      const { id, name } = cls.realInstructor;
      const existingInstructor = acc.find((instructor) => instructor.id === id);
      if (existingInstructor) {
        existingInstructor.classCount++;
      } else {
        acc.push({ id, name, classCount: 1 });
      }
    }
    return acc;
  }, [] as Array<{ id: string; name: string; classCount: number }>);
};

export default {
  create,
  get,
  update,
  delete: deleteClient,
  getClients,
  validateClientForUser,
};
