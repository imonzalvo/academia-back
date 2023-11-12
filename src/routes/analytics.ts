import { Router, Request, Response } from "express";
import analyticsService from "../services/analyticsService";

const router = Router();

router.get(`/analytics/new_clients`, async (req: Request, res: Response) => {
  const { from, to } = req.query;
  try {
    const dateTo = new Date(to as string);
    const dateFrom = new Date(from as string);

    const result = await analyticsService.getNewClientsCountByDate(
      dateFrom,
      dateTo,
      "DATE"
    );
    res.json(result);
  } catch (error) {
    res.json({ error: `Error getting clients count ${error}` });
  }
});

export default router;
