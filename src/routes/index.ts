import { Router } from "express";

import clients from "./clients";
import payments from "./payments";
import practicalExams from "./practicalExams";
import theoryExams from "./theoryExams";
import classes from "./classes";
import academies from "./academies";
import analytics from "./analytics";
import users from "./users";
import calendar from "./calendar";

const router = Router();

router.use("/", clients);
router.use("/", payments);
router.use("/", practicalExams);
router.use("/", theoryExams);
router.use("/", classes);
router.use("/", analytics);
router.use("/", academies);
router.use("/", users);
router.use("/", calendar);

export default router;
