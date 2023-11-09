import { Router, Request, Response } from "express";

import prisma from "../lib/db";

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
    } = req.body;

    const result = await prisma.client.create({
      data: {
        name,
        lastName,
        email,
        ci,
        phone,
        address,
        notes,
        secondaryPhone,
        status,
      },
    });
    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

router.put(`/clients/:id`, async (req: Request, res: Response) => {
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
    } = req.body;
    const { id } = req.params;

    const result = await prisma.client.update({
      where: { id },
      data: {
        name,
        lastName,
        email,
        ci,
        phone,
        address,
        notes,
        secondaryPhone,
        status,
      },
    });
    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

router.delete(`/clients/:id`, async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await prisma.client.delete({ where: { id } });
  res.json(result);
});

router.get(`/clients`, async (req: Request, res: Response) => {
  const { skip, limit, search } = req.query;

  let clients;

  if (!search) {
    const queryResult = await prisma.$transaction([
      prisma.client.count(),
      prisma.client.findMany({
        skip: parseInt(skip as string),
        take: parseInt(limit as string),
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);
    clients = queryResult[1];
    const result = { data: clients, total: queryResult[0] };
    res.json(result);
    return;
  }
  clients = await prisma.client.aggregateRaw({
    pipeline: [
      {
        $search: {
          index: "default",
          compound: {
            should: [
              {
                autocomplete: {
                  query: search,
                  path: "name",
                },
              },
              {
                autocomplete: {
                  query: search,
                  path: "lastName",
                },
              },
            ],
          },
        },
      },
      {
        $addFields: {
          id: { $toString: "$_id" },
          createdAt: { $toString: "$created_at" },
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: parseInt(skip as string) },
            { $limit: parseInt(limit as string) },
          ],
        },
      },
      {
        $project: {
          "data.id": 1,
          "data.name": 1,
          "data.lastName": 1,
          "data.ci": 1,
          "data.phone": 1,
          "data.secodaryPhone": 1,
          "data.createdAt": 1,
          "data.address": 1,
          "data.email": 1,
          "data.notes": 1,
          total: { $arrayElemAt: ["$metadata.total", 0] },
        },
      },
    ],
  });
  res.json(clients[0]);
});

router.get(`/clients/:id`, async (req: Request, res: Response) => {
  const { id } = req.params;

  const client = await prisma.client.findFirst({
    where: { id },
    include: {
      payments: true,
      practicalExams: {
        include: {
          result: true,
        },
        orderBy: {
          date: "desc",
        },
      },
      theoryExams: {
        orderBy: {
          date: "desc",
        },
      },
      classes: {
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  const pendingPracticalExam = client.practicalExams.filter((exam) => {
    return new Date(exam.date) > new Date() && exam.status == "PENDING";
  })[0];

  const pendingTheoryExam = client.theoryExams.filter((exam) => {
    return new Date(exam.date) > new Date() && exam.status == "PENDING";
  })[0];

  const nextClass = client.classes.filter((exam) => {
    return new Date(exam.date) > new Date();
  })[0];

  const response = {
    ...client,
    pendingPracticalExam,
    pendingTheoryExam,
    nextClass,
  };
  res.json(response);
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
