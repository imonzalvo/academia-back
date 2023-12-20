import e, { Router, Request, Response } from "express";
import calendarService from "../services/calendarService";
import { addHours } from "date-fns";

const router = Router();

router.get(`/calendar/instructors/:id`, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { from, to } = req.query;

  const instructorId = id as string;

  try {
    let dateRange = undefined;
    if (!!from && !!to) {
      dateRange = {
        from: new Date(from as string),
        to: new Date(to as string),
      };
    }

    const events = await calendarService.getEvents(instructorId, dateRange);

    const formattedClasses = formatClasses(events.classes);
    // const formattedExams = formatExams(events.exams);

    res.json({ events: formattedClasses });
  } catch (error) {
    res.json({ error: `Error getting classes for date ${error}` });
  }
});

const formatClasses = (classes) => {
  return classes.map((c) => {
    const endDate = addHours(c.date, 1);
    return { ...c, endDate, type: "CLASS" };
  });
};

const formatExams = (exams) => {
  return exams.map((e) => {
    const endDate = addHours(e.date, 1);
    return { ...e, endDate, type: "EXAM" };
  });
};

export default router;
