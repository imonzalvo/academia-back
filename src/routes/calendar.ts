import { Router, Request, Response } from "express";
import calendarService from "../services/calendarService";

const router = Router();

router.get(`/calendar`, async (req: Request, res: Response) => {
    const { from, to, employeeName } = req.query;
    try {
      let dateRange = undefined;
      if (!!from && !!to) {
        dateRange = {
          from: new Date(from as string),
          to: new Date(to as string),
        };
      }
  
      const academyId = req.user?.academyId;
  
      const result = await calendarService.getEvents(academyId, dateRange, employeeName);
  
      res.json(result);
    } catch (error) {
      res.json({ error: `Error getting theory exams count ${error}` });
    }
  });