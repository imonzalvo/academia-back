import classesRepository from "../repositories/classesRepository";
import clientsRepository from "../repositories/clientsRepository";
import practicalExamsRepository from "../repositories/practicalExamsRepository";
import theoryExamsRepository from "../repositories/theoryExamsRepository";

type groupBy = "DATE" | "WEEK" | "MONTH";

interface DateGroupable {
  id: string;
  date: Date;
}

type resultDateGroupable = DateGroupable & {
  result: string;
};

const getNewClientsCountByDate = async (
  academyId: string,
  from: Date,
  to: Date,
  groupBy: groupBy
) => {
  const newClients = await clientsRepository.getNewClientsByDate(
    academyId,
    from,
    to
  );

  const formattedNewClients = newClients.map((client) => {
    return {
      ...client,
      date: client.createdAt,
    };
  });

  const groupedClients = countElementsByDate(formattedNewClients);
  const populatedGroupedClients = populateGroupedElementsDates(
    groupedClients,
    from,
    to,
    0
  );

  return { groupBy, data: populatedGroupedClients };
};

const getClassesCountByDate = async (
  academyId: string,
  from: Date,
  to: Date,
  groupBy: groupBy
) => {
  const newClients = await classesRepository.getClassesByDate(
    academyId,
    from,
    to
  );

  const groupedClasses = countElementsByDate(newClients);
  const populatedGroupedClients = populateGroupedElementsDates(
    groupedClasses,
    from,
    to,
    0
  );

  return { groupBy, data: populatedGroupedClients };
};

const getPracticalExamsCountByDate = async (
  academyId: string,
  from: Date,
  to: Date,
  groupBy: groupBy
) => {
  const exams = await practicalExamsRepository.getExamsByDate(
    academyId,
    from,
    to
  );

  const formattedExams = exams.map((e) => {
    const isExamApproved = e.result.circuit && e.result.street;
    const result = isExamApproved ? "approved" : "failed";
    return {
      ...e,
      result,
    };
  });

  const groupedExams = countElementsWithResultByDate(formattedExams);
  const defaultValues = {
    approved: 0,
    failed: 0,
  };
  const populatedGroupedExams = populateGroupedElementsDates(
    groupedExams,
    from,
    to,
    defaultValues
  );

  return { groupBy, data: populatedGroupedExams };
};

const getTheoryExamsCountByDate = async (
  academyId: string,
  from: Date,
  to: Date,
  groupBy: groupBy
) => {
  const exams = await theoryExamsRepository.getExamsByDate(academyId, from, to);

  const formattedExams = exams.map((e) => {
    const result = e.result ? "approved" : "failed";
    return {
      ...e,
      result,
    };
  });

  const groupedExams = countElementsWithResultByDate(formattedExams);
  const defaultValues = {
    approved: 0,
    failed: 0,
  };
  const populatedGroupedExams = populateGroupedElementsDates(
    groupedExams,
    from,
    to,
    defaultValues
  );

  return { groupBy, data: populatedGroupedExams };
};

// Utils functions

const populateGroupedElementsDates = (groupedClients, from, to, defaults) => {
  const initialDate = new Date(from);

  for (var d = initialDate; d <= to; d.setDate(d.getDate() + 1)) {
    const formattedDate = formatDate(d);
    groupedClients[formattedDate] = groupedClients[formattedDate] || defaults;
  }

  return groupedClients;
};

// Function to format date as DD-MM-YYYY
function formatDate(date: Date) {
  const day = date.getDate().toString().padStart(2, "0");

  // Months are 0-based
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

const countElementsWithResultByDate = (elements: resultDateGroupable[]) => {
  const dateCounts = elements.reduce((counts, e) => {
    const formattedDate = formatDate(e.date);

    if (!counts[formattedDate]) {
      counts[formattedDate] = {
        approved: 0,
        failed: 0,
      };
    }

    counts[formattedDate][e.result] += 1;

    return counts;
  }, {});

  return dateCounts;
};

const countElementsByDate = (elements: Required<DateGroupable>[]) => {
  const dateCounts = elements.reduce((counts, e) => {
    const formattedDate = formatDate(e.date);
    const updatedDateCount = (counts[formattedDate] || 0) + 1;
    counts[formattedDate] = updatedDateCount;
    return counts;
  }, {});

  return dateCounts;
};

export default {
  getNewClientsCountByDate,
  getClassesCountByDate,
  getPracticalExamsCountByDate,
  getTheoryExamsCountByDate,
};
