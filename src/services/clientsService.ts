import clientsRepository, {
  ICreateClient,
} from "../repositories/clientsRepository";
import type { Client, ClientStatus, Payment } from "@prisma/client";

export interface IPopulatedClient extends Client {
  nextClass: any;
  pendingPracticalExam: any;
  pendingTheoryExam: any;
}

const create = async (client: ICreateClient) => {
  const newUser = await clientsRepository.create(client);
  return newUser;
};

const get = async (id: string) => {
  const client = await clientsRepository.get(id);

  if (!client) return null;

  const pendingPracticalExam = client.practicalExams.filter((exam) => {
    return new Date(exam.date) > new Date() && exam.status == "PENDING";
  })[0];

  const pendingTheoryExam = client.theoryExams.filter((exam) => {
    return new Date(exam.date) > new Date() && exam.status == "PENDING";
  })[0];

  const nextClass = client.classes.filter((exam) => {
    return new Date(exam.date) > new Date();
  })[0];

  const populatedClient = {
    ...client,
    pendingPracticalExam,
    pendingTheoryExam,
    nextClass,
  };

  return populatedClient;
};

const update = async (client: Partial<ICreateClient>) => {
  const updatedClient = await clientsRepository.update(client);
  return updatedClient;
};

const deleteClient = async (id: string) => {
  return await clientsRepository.delete(id);
};

const getClients = async (
  skip: number,
  limit: number,
  search: string,
  status: string
) => {
  return await clientsRepository.search(
    { skip, limit },
    search,
    status as ClientStatus
  );
};

export default {
  create,
  get,
  update,
  delete: deleteClient,
  getClients,
};
