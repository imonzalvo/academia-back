import { Prisma, PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";

const prisma = new PrismaClient();
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

app.post(`/signup`, async (req, res) => {
  const { name, email, posts } = req.body;

  const postData = posts?.map((post: Prisma.PostCreateInput) => {
    return { title: post?.title, content: post?.content };
  });

  const result = await prisma.user.create({
    data: {
      name,
      email,
      posts: {
        create: postData,
      },
    },
  });
  res.json(result);
});

app.post(`/clients`, async (req: Request, res: Response) => {
  try {
    const { name, lastName, email, ci, phone, address, notes } = req.body;
    const result = await prisma.client.create({
      data: {
        name,
        lastName,
        email,
        ci,
        phone,
        address,
        notes,
      },
    });
    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.put(`/clients/:id`, async (req: Request, res: Response) => {
  try {
    const { name, lastName, email, ci, phone, address, notes } = req.body;
    const { id } = req.params;

    const result = await prisma.client.update({
      where: { id },
      data: {
        name,
        lastName,
        email,
        ci,
        phone,
        address,
        notes,
      },
    });
    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.delete(`/clients/:id`, async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await prisma.client.delete({ where: { id } });
  res.json(result);
});

app.get(`/clients`, async (req: Request, res: Response) => {
  const clients = await prisma.client.findMany();
  const result = { clients };
  res.json(result);
});

app.get(`/clients/:id`, async (req: Request, res: Response) => {
  const { id } = req.params;

  const clients = await prisma.client.findFirst({
    where: { id },
  });
  const result = { clients };
  res.json(result);
});

app.post("/clients/:id/payments", async (req, res) => {
  const { id: clientId } = req.params;
  const { amount, date, comment } = req.body;

  try {
    const result = await prisma.payment.create({
      data: {
        amount,
        date,
        comment,
        client: { connect: { id: clientId } },
      },
    });

    res.json(result);
  } catch (error) {
    res.json({ error: `Error creating payment ${error}` });
  }
});

app.get("/clients/:id/payments", async (req, res) => {
  const { id: clientId } = req.params;

  try {
    const result = await prisma.payment.findMany({
      where: { clientId },
    });

    res.json(result);
  } catch (error) {
    res.json({ error: `Error getting payments ${error}` });
  }
});

app.put("/clients/:clientId/payments/:id", async (req, res) => {
  const { id } = req.params;
  const { amount, date, comment } = req.body;

  try {
    const result = await prisma.payment.update({
      where: { id },
      data: {
        amount,
        date,
        comment,
      },
    });

    res.json(result);
  } catch (error) {
    res.json({ error: `Error creating payment ${error}` });
  }
});

app.delete("/clients/:clientId/payments/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prisma.payment.delete({
      where: { id },
    });

    res.json(result);
  } catch (error) {
    res.json({ error: `Error creating payment` });
  }
});

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`)
);
