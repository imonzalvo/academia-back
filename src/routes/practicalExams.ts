import { Router, Request, Response } from "express";
import prisma from "../lib/db";
import ValidationError from "../errors/validationError";

const router = Router();


router.post(
    "/clients/:id/practical_exams",
    async (req: Request, res: Response, next) => {
      const { id } = req.params;
  
      const { date, paid, comment, notified, result, time } = req.body;
      try {
        const parsedDate = new Date(date);
        const now = new Date();
        if (parsedDate.getTime() <= now.getTime()) {
          throw new ValidationError("La fecha no puede ser anterior a hoy");
        }
  
        const futureExams = await prisma.practicalExam.findFirst({
          where: {
            clientId: id,
            status: "PENDING",
            date: {
              gte: new Date(),
            },
          },
        });
  
        if (!!futureExams) {
          throw new ValidationError("Ya hay un examen practico agendado");
        }
  
        const response = await prisma.practicalExam.create({
          data: {
            paid,
            date,
            comment,
            notified,
            time,
            status: "PENDING",
            result: {
              create: {
                street: result.street,
                circuit: result.circuit,
              },
            },
            client: { connect: { id: id } },
          },
          include: {
            result: true,
          },
        });
  
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
