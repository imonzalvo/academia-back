import { Router, Request, Response } from "express";

import prisma from "../lib/db";
import clientsService from "../services/clientsService";
import { ICreateClient } from "../repositories/clientsRepository";

const router = Router();

router.post(`/clients`, async (req: Request, res: Response) => {
  try {
    const {
      name,
      lastName,
      email,
      ci,
      phone,
      address,
      notes,
      secondaryPhone,
      status,
      knownUsBy,
      expedientExpirationDate,
    } = req.body;

    const user = req.user;

    const newClient: ICreateClient = {
      name,
      lastName,
      email,
      ci,
      phone,
      address,
      notes,
      secondaryPhone,
      status,
      knownUsBy,
      academyId: user?.academyId,
      expedientExpirationDate,
    };

    const result = await clientsService.create(newClient);
    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

router.put(`/clients/:id`, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      lastName,
      email,
      ci,
      phone,
      address,
      notes,
      secondaryPhone,
      status,
      knownUsBy,
      expedientExpirationDate,
    } = req.body;

    const user = req.user;

    const updatedClient: Partial<ICreateClient> = {
      id,
      name,
      lastName,
      email,
      ci,
      phone,
      address,
      notes,
      secondaryPhone,
      status,
      knownUsBy,
      expedientExpirationDate,
      academyId: user?.academyId,
    };

    const result = await clientsService.update(updatedClient, user);
    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

router.delete(`/clients/:id`, async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;

  const result = await clientsService.delete(id, user);
  res.json(result);
});

router.get(`/clients`, async (req: Request, res: Response) => {
  const { skip, limit, search, status, orderBy } = req.query;

  if (!!status && !["ACTIVE", "INACTIVE", "DONE"].includes(status as string)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  if (!!orderBy && !["EXPEDIENT_EXPIRATION", "CREATED_AT"].includes(orderBy as string)) {
    res.status(400).json({ error: "Invalid orderBy" });
    return;
  }

  const academyId = req.user?.academyId;

  const skipNumber = parseInt(skip as string);
  const limitNumber = parseInt(limit as string);

  const clients = await clientsService.getClients(
    academyId,
    skipNumber,
    limitNumber,
    search as string,
    status as string,
    orderBy as string
  );

  res.json(clients);
  return;
});

router.get(`/clients/:id`, async (req: Request, res: Response, next) => {
  const { id } = req.params;

  try {
    const client = await clientsService.get(id, req.user);
    res.json(client);
  } catch (error) {
    return next(error);
  }
});

router.post("/clients/:id/payments", async (req, res) => {
  const { id: clientId } = req.params;
  const { amount, date, comment, type } = req.body;

  const result = await prisma.payment.create({
    data: {
      amount,
      date,
      comment,
      type,
      client: { connect: { id: clientId } },
    },
  });

  res.json(result);
});

router.get("/clients/:id/payments", async (req, res) => {
  const { id: clientId } = req.params;

  try {
    const result = await prisma.payment.findMany({
      where: { clientId },
    });

    res.json(result);
  } catch (error) {
    res.json({ error: `Error getting payments ${error}` });
  }
});

export default router;
