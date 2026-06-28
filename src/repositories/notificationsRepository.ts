import { NotificationStatus } from "@prisma/client";
import prisma from "../lib/db";

export interface ICreateNotification {
  classId: string;
  clientId: string;
  phone: string;
  message: string;
  status: NotificationStatus;
  errorMsg?: string;
  sentAt: Date;
}

const create = async (data: ICreateNotification) => {
  return prisma.notification.create({ data });
};

const getByAcademy = async (
  academyId: string,
  filters: { from?: Date; to?: Date; status?: NotificationStatus } = {}
) => {
  return prisma.notification.findMany({
    where: {
      client: { academyId },
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.from || filters.to
        ? {
            sentAt: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
    },
    include: {
      client: {
        select: { id: true, fullName: true, phone: true },
      },
      class: {
        select: { id: true, date: true, time: true },
      },
    },
    orderBy: { sentAt: "desc" },
  });
};

export default { create, getByAcademy };
