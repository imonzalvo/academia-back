import clientsRepository from "../repositories/clientsRepository";

type groupBy = "DATE" | "WEEK" | "MONTH";

const getNewClientsCountByDate = async (
  from: Date,
  to: Date,
  groupBy: groupBy
) => {
  const newClients = await clientsRepository.getNewClientsByDate(from, to);

  const groupedClients = countUserByDate(newClients);
  const populatedGroupedClients = completeGroupedClientsCount(
    groupedClients,
    from,
    to
  );

  return { groupBy, data: populatedGroupedClients };
};

const completeGroupedClientsCount = (groupedClients, from, to) => {
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

const countUserByDate = (clients: { id: string; createdAt: Date }[]) => {
  const dateCounts = clients.reduce((counts, item) => {
    const formattedDate = formatDate(item.createdAt);
    const updatedDateCount = (counts[formattedDate] || 0) + 1;
    counts[formattedDate] = updatedDateCount;
    return counts;
  }, {});

  return dateCounts;
};

export default {
  getNewClientsCountByDate,
};
