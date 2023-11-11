import { Router, Request, Response } from "express";
import prisma from "../lib/db";
import paymentsService from "../services/paymentsService";

const router = Router();

router.get("/payments", async (req, res) => {
  const { skip, limit } = req.query;

  const skipNumber = parseInt(skip as string);
  const limitNumber = parseInt(limit as string);

  try {
    const payments = await paymentsService.getAll(skipNumber, limitNumber);
    res.json(payments);
  } catch (error) {
    res.json({ error: `Error getting payments ${error}` });
  }
});

router.put("/payments/:id", async (req, res) => {
  const { id } = req.params;
  const { amount, date, comment, type } = req.body;

  try {
    const result = await prisma.payment.update({
      where: { id },
      data: {
        amount,
        date,
        comment,
        type,
      },
    });

    res.json(result);
  } catch (error) {
    res.json({ error: `Error creating payment ${error}` });
  }
});

router.delete("/payments/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prisma.payment.delete({
      where: { id },
    });

    res.json(result);
  } catch (error) {
    res.json({ error: `Error creating payment` });
  }
});

export default router;
