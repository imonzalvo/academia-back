import { Router, Request, Response } from "express";
import prisma from "../lib/db";
import theoryExamsService from "../services/theoryExamsService";

const router = Router();

router.post(
  "/clients/:id/theory_exams",
  async (req: Request, res: Response, next) => {
    const { id } = req.params;
    const { date, comment, notified, result, time, status } = req.body;

    const theoryExam = {
      date,
      comment,
      notified,
      result,
      time,
      clientId: id,
      status,
    };

    try {
      const newExam = await theoryExamsService.create(theoryExam);

      res.json(newExam);
    } catch (e) {
      return next(e);
    }
  }
);

router.put("/theory_exams/:id", async (req: Request, res: Response) => {
  const { id: examId } = req.params;
  const { date, comment, notified, result, time, status } = req.body;

  const response = await prisma.theoryExam.update({
    where: { id: examId },
    data: { date, comment, notified, result, time, status },
  });

  res.json(response);
});

router.delete("/theory_exams/:id", async (req, res) => {
  const { id } = req.params;

  const result = await prisma.theoryExam.delete({
    where: { id },
  });

  res.json(result);
});

router.get("/theory_exams/upcoming", async (req, res) => {
  const { skip, limit } = req.query;

  const skipNumber = parseInt(skip as string);
  const limitNumber = parseInt(limit as string);

  try {
    const payments = await theoryExamsService.findNextExams(
      skipNumber,
      limitNumber
    );
    res.json(payments);
  } catch (error) {
    res.json({ error: `Error getting upcoming theory exams ${error}` });
  }
});

export default router;
