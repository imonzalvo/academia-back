import { Router, Request, Response } from "express";
import notificationsRepository from "../repositories/notificationsRepository";

const router = Router();

router.get("/webhooks/whatsapp", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log("[WhatsAppWebhook] Verificación OK");
    res.status(200).send(challenge);
  } else {
    console.error("[WhatsAppWebhook] Verificación fallida");
    res.sendStatus(403);
  }
});

router.post("/webhooks/whatsapp", async (req: Request, res: Response) => {
  res.sendStatus(200); // Meta espera un ack rápido

  try {
    console.log("[WhatsAppWebhook] Payload:", JSON.stringify(req.body));

    const statuses = req.body?.entry?.[0]?.changes?.[0]?.value?.statuses ?? [];

    for (const status of statuses) {
      const messageId = status.id;
      const deliveryStatus = status.status; // sent | delivered | read | failed
      const deliveryError = status.errors?.[0]?.title;
      const timestamp = status.timestamp ? new Date(Number(status.timestamp) * 1000) : new Date();

      if (!messageId) continue;

      await notificationsRepository.updateDeliveryStatusByMessageId(messageId, {
        deliveryStatus,
        deliveryError,
        ...(deliveryStatus === "delivered" ? { deliveredAt: timestamp } : {}),
        ...(deliveryStatus === "read" ? { readAt: timestamp } : {}),
      });

      console.log(`[WhatsAppWebhook] messageId=${messageId} status=${deliveryStatus}${deliveryError ? ` error=${deliveryError}` : ""}`);
    }
  } catch (e) {
    console.error("[WhatsAppWebhook] Error procesando payload:", e);
  }
});

export default router;
