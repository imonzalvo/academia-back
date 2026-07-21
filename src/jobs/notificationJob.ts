import { addMinutes } from "date-fns";
import academyRepository from "../repositories/academyRepository";
import classesRepository from "../repositories/classesRepository";
import notificationsRepository from "../repositories/notificationsRepository";
import { sendWhatsAppTemplate, ITemplateParams } from "../services/whatsappService";
import prisma from "../lib/db";

const getFirstName = (fullName: string): string => fullName.trim().split(/\s+/)[0] ?? fullName;

export const buildTemplateParams = (
  clientName: string,
  classDate: Date,
  classTime: string | null | undefined,
  contactPhone: string,
  contactWhatsApp: string
): ITemplateParams => {
  const dateStr = classDate.toLocaleDateString("es-UY", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
  const timeStr = classTime ?? classDate.toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" });

  return {
    firstName: getFirstName(clientName),
    date: dateStr,
    time: timeStr,
    contactPhone,
    contactWhatsApp: contactWhatsApp.replace(/\D/g, ""), // sin +
  };
};

// Usado por el simulador en el endpoint /notifications/test
export const buildMessage = (clientName: string, classDate: Date, classTime?: string | null): string => {
  const dateStr = classDate.toLocaleDateString("es-UY", { weekday: "short", day: "numeric", month: "long" });
  const timeStr = classTime ?? classDate.toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" });
  return `Hola ${getFirstName(clientName)} 👋\n\n📅 ${dateStr} a las ${timeStr}hs\n\nAnte cualquier consulta escribinos por WhatsApp.`;
};

export const runNotificationJob = async () => {
  console.log("[NotificationJob] Iniciando...");

  const academies = await academyRepository.getAll();

  for (const academy of academies) {
    if (academy.notificationsEnabled !== true) continue;

    if (!academy.contactPhone || !academy.contactWhatsApp) {
      console.warn(`[NotificationJob] Academia ${academy.id} sin teléfonos de contacto configurados — saltando.`);
      continue;
    }

    const minutes = academy.notificationMinutesInAdvance ?? 1440;
    const now = new Date();
    const from = addMinutes(now, minutes - 30);
    const to = addMinutes(now, minutes + 30);

    const classes = await classesRepository.getClassesPendingNotification(academy.id, from, to);

    for (const cls of classes) {
      if (!cls.client?.phone) continue;

      const clientName = cls.client.fullName ?? cls.client.phone;
      const params = buildTemplateParams(
        clientName,
        cls.date,
        cls.time,
        academy.contactPhone,
        academy.contactWhatsApp
      );

      const targetPhone = process.env.WHATSAPP_TEST_RECIPIENT ?? cls.client.phone;

      const { success, errorMsg } = await sendWhatsAppTemplate(targetPhone, params);

      const messagePreview = `Hola ${params.firstName} 👋\n📅 ${params.date} a las ${params.time}hs`;

      await notificationsRepository.create({
        classId: cls.id,
        clientId: cls.client.id,
        phone: cls.client.phone,
        message: messagePreview,
        status: success ? "SENT" : "FAILED",
        errorMsg,
        sentAt: new Date(),
      });

      if (success) {
        await prisma.class.update({ where: { id: cls.id }, data: { notified: true } });
        console.log(`[NotificationJob] Enviado a ${cls.client.phone} (clase ${cls.id})`);
      } else {
        console.error(`[NotificationJob] Error al enviar a ${cls.client.phone}: ${errorMsg}`);
      }
    }
  }

  console.log("[NotificationJob] Finalizado.");
};

