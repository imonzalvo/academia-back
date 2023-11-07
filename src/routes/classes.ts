import { Router, Request, Response } from "express";
import prisma from "../lib/db";

const router = Router();

router.post(`/clients/:id/classes`, async (req: Request, res: Response) => {
  const { id: clientId } = req.params;

  try {
    const { date, time, comment, notified, instructor, status } = req.body;
    const result = await prisma.class.create({
      data: {
        date,
        time,
        comment,
        notified,
        instructor,
        status,
        client: { connect: { id: clientId } },
      },
    });
    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

router.put(`/classes/:id`, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, time, comment, notified, instructor, status } = req.body;

    const result = await prisma.class.update({
      where: { id },
      data: {
        date,
        time,
        comment,
        notified,
        instructor,
        status,
      },
    });
    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

router.delete(`/classes/:id`, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await prisma.class.delete({
      where: { id },
    });
    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

export default router;
