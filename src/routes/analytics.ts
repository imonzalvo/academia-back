import { Router, Request, Response } from "express";
import analyticsService from "../services/analyticsService";

const router = Router();

router.get(`/analytics/new_clients`, async (req: Request, res: Response) => {
  const { from, to } = req.query;
  try {
    const dateTo = new Date(to as string);
    const dateFrom = new Date(from as string);

    const academyId = req.user?.academyId;

    const result = await analyticsService.getNewClientsCountByDate(
      academyId,
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

    const academyId = req.user?.academyId;

    const result = await analyticsService.getClassesCountByDate(
      academyId,
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

router.get(
  `/analytics/practical_exams`,
  async (req: Request, res: Response) => {
    const { from, to } = req.query;
    try {
      const dateTo = new Date(to as string);
      const dateFrom = new Date(from as string);

      const academyId = req.user?.academyId;

      const result = await analyticsService.getPracticalExamsCountByDate(
        academyId,
        dateFrom,
        dateTo,
        "DATE"
      );

      const formattedResultData = Object.entries(result.data).map((entry) => {
        return { date: entry[0], count: entry[1] };
      });

      res.json({ data: formattedResultData, groupBy: result.groupBy });
    } catch (error) {
      res.json({ error: `Error getting practical exams count ${error}` });
    }
  }
);

router.get(`/analytics/theory_exams`, async (req: Request, res: Response) => {
  const { from, to } = req.query;
  try {
    const dateTo = new Date(to as string);
    const dateFrom = new Date(from as string);

    const academyId = req.user?.academyId;

    const result = await analyticsService.getTheoryExamsCountByDate(
      academyId,
      dateFrom,
      dateTo,
      "DATE"
    );

    const formattedResultData = Object.entries(result.data).map((entry) => {
      return { date: entry[0], count: entry[1] };
    });

    res.json({ data: formattedResultData, groupBy: result.groupBy });
  } catch (error) {
    res.json({ error: `Error getting theory exams count ${error}` });
  }
});

export default router;
