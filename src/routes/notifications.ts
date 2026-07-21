import { Router, Request, Response } from "express";
import { NotificationStatus, UserAcademy } from "@prisma/client";
import notificationsRepository from "../repositories/notificationsRepository";
import { buildMessage, buildTemplateParams } from "../jobs/notificationJob";
import { sendWhatsAppTemplate } from "../services/whatsappService";
import academyRepository from "../repositories/academyRepository";

const router = Router();

router.get("/notifications", async (req: Request, res: Response) => {
  try {
    const user = req.user as UserAcademy;
    const { from, to, status } = req.query;

    const filters: { from?: Date; to?: Date; status?: NotificationStatus } = {};
    if (from) filters.from = new Date(from as string);
    if (to) filters.to = new Date(to as string);
    if (status && (status === "SENT" || status === "FAILED")) {
      filters.status = status as NotificationStatus;
    }

    const result = await notificationsRepository.getByAcademy(
      user.academyId,
      filters
    );
    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

router.post("/notifications/test", async (req: Request, res: Response) => {
  try {
    const user = req.user as UserAcademy;
    const { phone, clientName } = req.body;
    if (!phone) return res.status(400).json({ error: "phone requerido" });

    const academies = await academyRepository.getAll();
    const academy = academies.find((a) => a.id === user.academyId);
    if (!academy) return res.sendStatus(404);

    const classDate = new Date(Date.now() + 30 * 60 * 1000); // simulamos clase en 30 min
    const name = clientName ?? "Alumno de prueba";
    const message = buildMessage(name, classDate, "10:00");
    const params = buildTemplateParams(
      name,
      classDate,
      "10:00",
      academy.contactPhone || "24812413",
      academy.contactWhatsApp || "59895979419"
    );

    const { success, errorMsg } = await sendWhatsAppTemplate(phone, params);
    console.log(`[Notifications] /notifications/test (template) para ${phone}: success=${success}${errorMsg ? ` errorMsg=${errorMsg}` : ""}`);
    res.json({ success, errorMsg, message });
  } catch (e) {
    console.error("[Notifications] /notifications/test excepción:", e);
    res.sendStatus(500);
  }
});

export default router;
