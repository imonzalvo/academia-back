import classesRepository from "../repositories/classesRepository";
import clientsRepository from "../repositories/clientsRepository";

type groupBy = "DATE" | "WEEK" | "MONTH";

interface DateGroupable {
  id: string;
  date: Date;
}

const getNewClientsCountByDate = async (
  from: Date,
  to: Date,
  groupBy: groupBy
) => {
  const newClients = await clientsRepository.getNewClientsByDate(from, to);

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
    to
  );

  return { groupBy, data: populatedGroupedClients };
};

const getClassesCountByDate = async (
  from: Date,
  to: Date,
  groupBy: groupBy
) => {
  const newClients = await classesRepository.getClassesByDate(from, to);

  const groupedClasses = countElementsByDate(newClients);
  const populatedGroupedClients = populateGroupedElementsDates(
    groupedClasses,
    from,
    to
  );

  return { groupBy, data: populatedGroupedClients };
};

const populateGroupedElementsDates = (groupedClients, from, to) => {
  const initialDate = new Date(from);

  for (var d = initialDate; d <= to; d.setDate(d.getDate() + 1)) {
    const formattedDate = formatDate(d);
    groupedClients[formattedDate] = groupedClients[formattedDate] || 0;
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
};
