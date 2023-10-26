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
    const { name, lastName, email, ci, phone, address, notes, secondaryPhone } =
      req.body;
    const result = await prisma.client.create({
      data: {
        name,
        lastName,
        email,
        ci,
        phone,
        address,
        notes,
        secondaryPhone,
      },
    });
    res.json(result);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.put(`/clients/:id`, async (req: Request, res: Response) => {
  try {
    const { name, lastName, email, ci, phone, address, notes, secondaryPhone } =
      req.body;
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
        secondaryPhone,
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

  const client = await prisma.client.findFirst({
    where: { id },
    include: {
      payments: true,
      practicalExams: true,
      theryExams: true,
    },
  });
  res.json(client);
});

app.post("/clients/:id/payments", async (req, res) => {
  const { id: clientId } = req.params;
  const { amount, date, comment } = req.body;

  const result = await prisma.payment.create({
    data: {
      amount,
      date,
      comment,
      client: { connect: { id: clientId } },
    },
  });

  res.json(result);
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

app.put("/payments/:id", async (req, res) => {
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

app.delete("/payments/:id", async (req, res) => {
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

// Exams

app.post(
  "/clients/:id/practical_exams",
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { date, paid, comment, notified, result } = req.body;
    console.log("params", id);

    const response = await prisma.practicalExam.create({
      data: {
        paid,
        date,
        comment,
        notified,
        result: {
          create: {
            street: result.street,
            circuit: result.circuit,
          },
        },
        client: { connect: { id: id } },
      },
      include: {
        result: true,
      },
    });

    res.json(response);
  }
);

app.put(
  "/clients/:clientId/practical_exams/:id",
  async (req: Request, res: Response) => {
    const { id: examId } = req.params;
    const { date, paid, comment, notified, result } = req.body;

    let basicData = {
      paid,
      date,
      comment,
      notified,
    };
    let updatedData;

    if (!result) {
      updatedData = { ...basicData };
    } else {
      updatedData = {
        ...basicData,
        result: {
          create: {
            street: result.street,
            circuit: result.circuit,
          },
        },
      };
    }

    const response = await prisma.practicalExam.update({
      where: { id: examId },
      data: updatedData,
      include: {
        result: true,
      },
    });

    res.json(response);
  }
);

app.delete("/practical_exams/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prisma.practicalExam.delete({
      where: { id },
    });

    res.json(result);
  } catch (error) {
    res.json({ error: `Error creating payment` });
  }
});

// Exams

app.post("/clients/:id/theory_exams", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, comment, notified, result } = req.body;

  const response = await prisma.theoryExam.create({
    data: {
      date,
      comment,
      notified,
      result,
      client: { connect: { id: id } },
    },
  });

  res.json(response);
});

app.put(
  "/clients/:clientId/theory_exams/:id",
  async (req: Request, res: Response) => {
    const { id: examId } = req.params;
    const { date, comment, notified, result } = req.body;

    const response = await prisma.theoryExam.update({
      where: { id: examId },
      data: { date, comment, notified, result },
    });

    res.json(response);
  }
);

app.delete("/theory_exams/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prisma.theoryExam.delete({
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
