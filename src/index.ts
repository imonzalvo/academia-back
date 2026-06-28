// import { Prisma, PrismaClient } from "@prisma/client";
import express, { Express } from "express";
import router from "./routes";
import passport from "passport";
import auth from "./routes/auth";
import jwtPassport from "./lib/passport";
import { UserAcademy } from "@prisma/client";
import { runNotificationJob } from "./jobs/notificationJob";

const app: Express = express();
app.use(function (req, res, next) {
  next();
});
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,authorization"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", "*");

  // Pass to next layer of middleware
  next();
});

jwtPassport(passport);
app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", auth);

// QStash trigger — outside JWT auth
app.post("/notifications/trigger", async (req, res) => {
  try {
    await runNotificationJob();
    res.json({ ok: true });
  } catch (e) {
    res.sendStatus(500);
  }
});

const authMiddleware = (req, res, next) => {
  if (req.method !== "OPTIONS") {
    passport.authenticate(
      "jwt",
      { session: false },
      (err, user: UserAcademy, info) => {
        if (err) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        if (!user) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = user;
        next();
      }
    )(req, res, next);
  } else {
    next();
  }
};

app.use(authMiddleware);
app.use(router);

app.use((err, req, res, next) => {
  res.status(err.status || 500).send(err);
});

const PORT = Number(process.env.PORT) || 3000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`
🚀 Server ready at: http://localhost:${PORT}
DB: ${process.env.DATABASE_URL}
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`);
  console.log("Notification job: using QStash (no local cron)");
});
