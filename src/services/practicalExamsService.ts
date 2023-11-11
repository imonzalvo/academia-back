import ValidationError from "../errors/validationError";
import practicalExamsRepository, {
  ICreatePracticalExam,
} from "../repositories/practicalExamsRepository";

const create = async (newPracticalExam: ICreatePracticalExam) => {
  const parsedDate = new Date(newPracticalExam.date);
  const now = new Date();

  // if data < now => no validations
  if (parsedDate.getTime() <= now.getTime()) {
    const createdPayment = await practicalExamsRepository.create(
      newPracticalExam
    );

    return createdPayment;
  }

  // if date > now => validate
  const futureExam = await practicalExamsRepository.findClientNext(
    newPracticalExam.clientId
  );

  if (!!futureExam) {
    throw new ValidationError(
      "Ya hay un examen practico agendado para el futuro"
    );
  }

  const createdPayment = await practicalExamsRepository.create(
    newPracticalExam
  );

  return createdPayment;
};

const findNextExams = async (skip: number, limit: number) => {
  return await practicalExamsRepository.findNextExams({ skip, limit });
};

export default {
  create,
  findNextExams
};
