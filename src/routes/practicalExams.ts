import { Router, Request, Response } from "express";
import prisma from "../lib/db";
import practicalExamsService from "../services/practicalExamsService";
const router = Router();

router.post(
  "/clients/:id/practical_exams",
  async (req: Request, res: Response, next) => {
    const { id } = req.params;

    const {
      date,
      paid,
      comment,
      notified,
      result,
      time,
      status,
      instructorId,
    } = req.body;

    const newExam = {
      date,
      paid,
      comment,
      notified,
      result,
      time,
      status,
      clientId: id,
      instructorId,
    };

    try {
      const response = await practicalExamsService.create(newExam);

      res.json(response);
    } catch (e) {
      return next(e);
    }
  }
);

router.put("/practical_exams/:id", async (req: Request, res: Response) => {
  const { id: examId } = req.params;
  const {
    date,
    paid,
    comment,
    notified,
    result,
    time,
    status,
    instructorId,
    finalResult,
  } = req.body;

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

  if (instructorId) {
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

  if (!!finalResult) {
    updatedData = {
      ...updatedData,
      status: "DONE",
      finalResult: {
        create: {
          street: finalResult.street,
          circuit: finalResult.circuit,
        },
      },
    };
  }

  const response = await prisma.practicalExam.update({
    where: { id: examId },
    data: updatedData,
    include: {
      result: true,
      finalResult: true,
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

router.get("/practical_exams/upcoming", async (req, res) => {
  const { skip, limit } = req.query;

  const skipNumber = parseInt(skip as string);
  const limitNumber = parseInt(limit as string);

  try {
    const payments = await practicalExamsService.findNextExams(
      skipNumber,
      limitNumber
    );
    res.json(payments);
  } catch (error) {
    res.json({ error: `Error getting upcoming practical exams ${error}` });
  }
});

export default router;
