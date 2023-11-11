import ValidationError from "../errors/validationError";
import theoryExamsRepository, {
  ICreateTheoryExam,
} from "../repositories/theoryExamsRepository";

const create = async (newTheoryExam: ICreateTheoryExam) => {
  const parsedDate = new Date(newTheoryExam.date);
  const now = new Date();

  // if data < now => no validations
  if (parsedDate.getTime() <= now.getTime()) {
    const createdExam = await theoryExamsRepository.create(newTheoryExam);

    return createdExam;
  }

  // if date > now => validate
  const futureExam = await theoryExamsRepository.findClientNext(
    newTheoryExam.clientId
  );

  if (!!futureExam) {
    throw new ValidationError(
      "Ya hay un examen teorico agendado para el futuro"
    );
  }

  const createdExam = await theoryExamsRepository.create(newTheoryExam);

  return createdExam;
};

const findNextExams = async (skip: number, limit: number) => {
  return await theoryExamsRepository.findNextExams({ skip, limit });
};

export default { create, findNextExams };
