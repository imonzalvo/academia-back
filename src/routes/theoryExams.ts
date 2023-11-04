import { Router, Request, Response } from "express";
import prisma from "../lib/db";
import ValidationError from "../errors/validationError";

const router = Router();

router.post(
    "/clients/:id/theory_exams",
    async (req: Request, res: Response, next) => {
      const { id } = req.params;
      const { date, comment, notified, result, time } = req.body;
  
      try {
        const futureExams = await prisma.theoryExam.findFirst({
          where: {
            clientId: id,
            status: "PENDING",
            date: {
              gte: new Date(),
            },
          },
        });
  
        if (!!futureExams) {
          throw new ValidationError("Ya hay un examen teorico agendado");
        }
  
        const response = await prisma.theoryExam.create({
          data: {
            date,
            comment,
            notified,
            result,
            time,
            client: { connect: { id: id } },
          },
        });
  
        res.json(response);
      } catch (e) {
        return next(e);
      }
    }
  );
  
  router.put("/theory_exams/:id", async (req: Request, res: Response) => {
    const { id: examId } = req.params;
    const { date, comment, notified, result, time } = req.body;
  
    const response = await prisma.theoryExam.update({
      where: { id: examId },
      data: { date, comment, notified, result, time },
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
  

export default router;
