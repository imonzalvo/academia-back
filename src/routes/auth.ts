import { Router, Request, Response } from "express";

const router = Router();

router.post(`/sign_in`, async (req, res) => {
  const { username, password } = req.body;

  if (username == "delparque" && password == "delparque") {
    res.json({ username });
  } else {
    res.sendStatus(401);
  }
});

export default router;
