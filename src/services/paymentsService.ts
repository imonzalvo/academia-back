import paymentsRepository from "../repositories/paymentsRepository";

const getAll = async (skip: number, limit: number) => {
    return await paymentsRepository.getAll({ skip, limit });
};

export default {
  getAll,
};
