import { Router } from "express";

import clients from "./clients";
import payments from "./payments";
import practicalExams from "./practicalExams";
import theoryExams from "./theoryExams";
import classes from "./classes";

const router = Router();

router.use("/", clients);
router.use("/", payments);
router.use("/", practicalExams);
router.use("/", theoryExams);
router.use("/", classes);

export default router;
