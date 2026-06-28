import { Router, Request, Response } from "express";
import { NotificationStatus, UserAcademy } from "@prisma/client";
import notificationsRepository from "../repositories/notificationsRepository";
import { buildMessage } from "../jobs/notificationJob";
import { sendWhatsAppMessage } from "../services/whatsappService";

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
    const { phone, clientName } = req.body;
    if (!phone) return res.status(400).json({ error: "phone requerido" });

    const message = buildMessage(
      clientName ?? "Alumno de prueba",
      new Date(Date.now() + 30 * 60 * 1000), // simulamos clase en 30 min
      "10:00"
    );

    const { success, errorMsg } = await sendWhatsAppMessage(phone, message);
    res.json({ success, errorMsg, message });
  } catch (e) {
    res.sendStatus(500);
  }
});

export default router;
