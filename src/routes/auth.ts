import { Router, Request, Response } from "express";
import utils from "../lib/utils";
import usersRepository from "../repositories/usersRepository";
const router = Router();

router.post(`/sign_in`, async (req, res) => {
  const { username, password } = req.body;

  if (username == "delparque" && password == "delparque") {
    res.json({ username });
  } else {
    res.sendStatus(401);
  }
});

// Validate an existing user and issue a JWT
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await usersRepository.findByUsername(username);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, msg: "could not find user" });
    }

    const isValid = utils.validPassword(
      req.body.password,
      user.hash,
      user.salt
    );

    if (isValid) {
      const tokenObject = utils.issueJWT(user);

      res.status(200).json({
        success: true,
        token: tokenObject.token,
        expiresIn: tokenObject.expires,
      });
    } else {
      res
        .status(401)
        .json({ success: false, msg: "you entered the wrong password" });
    }
  } catch (err) {
    next(err);
  }
});

router.post(`/sign_up`, async (req, res, next) => {
  const { name, username, password } = req.body;

  const saltHash = utils.genPassword(password);

  const salt = saltHash.salt;
  const hash = saltHash.hash;

  const newUser = {
    name: name,
    username: username,
    hash: hash,
    salt: salt,
    role: "ADMIN",
  };

  try {
    const createdUser = await usersRepository.create(newUser);
    res.json({ success: true, user: createdUser });
  } catch (err) {
    res.json({ success: false, msg: err });
  }
});

export default router;
