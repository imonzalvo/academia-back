import { Router, Request, Response } from "express";
import academiesServices from "../services/academiesServices";

import {
  ICreateAcademy,
  IUpdateAcademy,
} from "../repositories/academyRepository";
import { UserAcademy } from "@prisma/client";

const router = Router();

router.post(`/academies`, async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, handle } = req.body;

    const userId = req.user?.id;

    const newAcademy: ICreateAcademy = {
      userId,
      name,
      email,
      phone,
      address,
      handle,
    };

    const result = await academiesServices.create(newAcademy);
    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

router.put(`/academies/:id`, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const user = req.user as UserAcademy;

    if (!id || user.role !== "ADMIN" || user.academyId !== id) {
      return res.sendStatus(401);
    }

    const updatedAcademy: IUpdateAcademy = {
      id,
      name,
      email,
      phone,
      address,
    };

    const result = await academiesServices.update(updatedAcademy);
    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

router.post(`/academies/instructors`, async (req: Request, res: Response) => {
  try {
    const { name, username } = req.body;

    const user = req.user as UserAcademy;

    const instructorData = {
      name,
      username,
    };

    const result = await academiesServices.createInstructor(
      user.academyId,
      instructorData
    );
    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

router.get(`/academies/instructors`, async (req: Request, res: Response) => {
  try {
    const user = req.user as UserAcademy;

    const result = await academiesServices.getInstructors(user.academyId);
    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

export default router;
