import { Router, Request, Response } from "express";
import prisma from "../lib/db";

const router = Router();

router.put("/payments/:id", async (req, res) => {
  const { id } = req.params;
  const { amount, date, comment } = req.body;

  try {
    const result = await prisma.payment.update({
      where: { id },
      data: {
        amount,
        date,
        comment,
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
