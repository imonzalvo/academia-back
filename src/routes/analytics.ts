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

    const formattedResultData = Object.entries(result.data).map((entry) => {
      return { date: entry[0], count: entry[1] };
    });

    res.json({ data: formattedResultData, groupBy: result.groupBy });
  } catch (error) {
    res.json({ error: `Error getting clients count ${error}` });
  }
});

router.get(`/analytics/classes`, async (req: Request, res: Response) => {
  const { from, to } = req.query;
  try {
    const dateTo = new Date(to as string);
    const dateFrom = new Date(from as string);

    const result = await analyticsService.getClassesCountByDate(
      dateFrom,
      dateTo,
      "DATE"
    );

    const formattedResultData = Object.entries(result.data).map((entry) => {
      return { date: entry[0], count: entry[1] };
    });

    res.json({ data: formattedResultData, groupBy: result.groupBy });
  } catch (error) {
    res.json({ error: `Error getting classes count ${error}` });
  }
});

export default router;
