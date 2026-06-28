import { Router, Request, Response } from "express";
import academiesServices from "../services/academiesServices";

import {
  ICreateAcademy,
  IUpdateAcademy,
} from "../repositories/academyRepository";
import academyRepository from "../repositories/academyRepository";
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

router.get(`/academies/me`, async (req: Request, res: Response) => {
  try {
    const user = req.user as UserAcademy;
    if (!user.academyId) return res.sendStatus(401);
    const academy = await academyRepository.getById(user.academyId);
    if (!academy) return res.sendStatus(404);
    res.json({
      ...academy,
      notificationMinutesInAdvance: academy.notificationMinutesInAdvance ?? 1440,
    });
  } catch (e) {
    res.sendStatus(500);
  }
});

router.put(`/academies/:id`, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, notificationMinutesInAdvance } = req.body;

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
      notificationMinutesInAdvance,
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

router.get("/academies/notification-config", async (req: Request, res: Response) => {
  try {
    const user = req.user as UserAcademy;
    if (!user.academyId) return res.sendStatus(401);

    const academies = await academyRepository.getAll();
    const found = academies.find((a) => a.id === user.academyId);
    if (!found) return res.sendStatus(404);

    res.json({
      notificationsEnabled: found.notificationsEnabled,
      contactPhone: found.contactPhone ?? "",
      contactWhatsApp: found.contactWhatsApp ?? "",
    });
  } catch (e) {
    res.sendStatus(500);
  }
});

router.put("/academies/notification-config", async (req: Request, res: Response) => {
  try {
    const user = req.user as UserAcademy;
    if (!user.academyId || user.role !== "ADMIN") return res.sendStatus(401);

    const { notificationsEnabled, contactPhone, contactWhatsApp } = req.body;

    const result = await academyRepository.updateNotificationConfig(user.academyId, {
      notificationsEnabled,
      contactPhone,
      contactWhatsApp,
    });

    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

export default router;
