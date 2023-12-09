import { Router, Request, Response } from "express";
import usersRepository from "../repositories/usersRepository";

const router = Router();

router.get("/me", async (req: Request, res: Response) => {
  try {
    const user = await usersRepository.get(req.user?.id);
    res.json(user);
  } catch (err) {
    res.status(500);
  }
});

export default router;
