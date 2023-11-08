import { Router, Request, Response } from "express";
import prisma from "../lib/db";
import practicalExamsService from "../services/practicalExamsService";
const router = Router();

router.post(
  "/clients/:id/practical_exams",
  async (req: Request, res: Response, next) => {
    const { id } = req.params;

    const { date, paid, comment, notified, result, time, status } = req.body;

    const newPayment = {
      date,
      paid,
      comment,
      notified,
      result,
      time,
      status,
      clientId: id,
    };

    try {
      const response = await practicalExamsService.create(newPayment);

      res.json(response);
    } catch (e) {
      return next(e);
    }
  }
);

router.put("/practical_exams/:id", async (req: Request, res: Response) => {
  const { id: examId } = req.params;
  const { date, paid, comment, notified, result, time, status } = req.body;

  let basicData = {
    paid,
    date,
    comment,
    notified,
    time,
    status,
  };
  let updatedData;

  if (!result) {
    updatedData = { ...basicData };
  } else {
    updatedData = {
      ...basicData,
      result: {
        create: {
          street: result.street,
          circuit: result.circuit,
        },
      },
    };
  }

  const response = await prisma.practicalExam.update({
    where: { id: examId },
    data: updatedData,
    include: {
      result: true,
    },
  });

  res.json(response);
});

router.delete("/practical_exams/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prisma.practicalExam.delete({
      where: { id },
    });

    res.json(result);
  } catch (error) {
    res.json({ error: `Error creating payment` });
  }
});

export default router;
