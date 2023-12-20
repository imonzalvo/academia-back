import classesRepository from "../repositories/classesRepository";
import practicalExamsRepository from "../repositories/practicalExamsRepository";
import { DateRange } from "../repositories/types";

const getEvents = async (instructorId: string, dateRange: DateRange) => {
  const classesByDateForInstructor =
    await classesRepository.getByDateRangeAndInstructor(
      instructorId,
      dateRange
    );

  // const examsByDateForInstructor =
  //   await practicalExamsRepository.getByDateRangeAndInstructor(
  //     instructorId,
  //     dateRange
  //   );

  return {
    classes: classesByDateForInstructor,
    // exams: examsByDateForInstructor,
  };
};

export default {
  getEvents,
};
