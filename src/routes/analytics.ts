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

// This endpoint will return statistic about the way clients know about the academy
router.get(`/analytics/known_by`, async (req: Request, res: Response) => {
  const { from, to } = req.query;
  try {
    let dateRange = undefined;
    if (!!from && !!to) {
      dateRange = {
        from: new Date(from as string),
        to: new Date(to as string),
      };
    }

    const academyId = req.user?.academyId;

    const result = await analyticsService.getKnownByStats(academyId, dateRange);

    res.json(result);
  } catch (error) {
    res.json({ error: `Error getting theory exams count ${error}` });
  }
});

// This endpoint will return general statistics about clients
router.get(
  `/analytics/clients_general`,
  async (req: Request, res: Response) => {
    try {
      const academyId = req.user?.academyId;

      const result = await analyticsService.getClientsGeneralStats(academyId);

      res.json(result);
    } catch (error) {
      res.json({ error: `Error getting theory exams count ${error}` });
    }
  }
);

export default router;
