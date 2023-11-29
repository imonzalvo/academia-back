// import { Prisma, PrismaClient } from "@prisma/client";
import express, { Express } from "express";
import router from "./routes";
import passport from "passport";
import auth from "./routes/auth";
import jwtPassport from "./lib/passport";
import { UserAcademy } from "@prisma/client";

const app: Express = express();
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
    "X-Requested-With,content-type"
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

const authMiddleware = (req, res, next) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err, user: UserAcademy, info) => {
      console.log("err", err, user, info);
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
};

app.use(authMiddleware);
app.use(router);

app.use((err, req, res, next) => {
  res.status(err.status || 500).send(err);
});

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
DB: ${process.env.DATABASE_URL}
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`)
);
