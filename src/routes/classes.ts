import { Router, Request, Response } from "express";
import classesService from "../services/classesService";

const router = Router();

router.post(
  `/clients/:id/classes`,
  async (req: Request, res: Response, next) => {
    const { id: clientId } = req.params;

    const user = req.user;

    try {
      const {
        date,
        time,
        comment,
        notified,
        instructor,
        status,
        paid,
        instructorId,
      } = req.body;

      const classData = {
        date,
        time,
        comment,
        notified,
        instructor,
        status,
        paid,
        clientId,
        instructorId,
      };

      const result = await classesService.create(classData, user);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

router.put(`/classes/:id`, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const {
      date,
      time,
      comment,
      notified,
      instructor,
      status,
      paid,
      instructorId,
      clientId
    } = req.body;

    const classData = {
      id,
      date,
      time,
      comment,
      notified,
      instructor,
      status,
      paid,
      instructorId,
      clientId
    };

    const result = await classesService.update(classData, req.user);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.delete(`/classes/:id`, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;

    const result = await classesService.delete(id, req.user);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
