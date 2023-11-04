// import { Prisma, PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";
import ValidationError from "./errors/validationError";
import prisma from "./lib/db";
import router from "./routes";
// const prisma = new PrismaClient();
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

app.use(express.json());
app.use(router);

app.use((err, req, res, next) => {
  res.status(err.status || 500).send(err);
});

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`)
);
