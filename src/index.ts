import { Prisma, PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";
import ValidationError from "./errors/validationError";

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
      practicalExams: {
        include: {
          result: true,
        },
        orderBy: {
          date: "desc",
        },
      },
      theoryExams: true,
    },
  });

  const pendingPracticalExam = client.practicalExams.filter((exam) => {
    return new Date(exam.date) > new Date() && exam.status == "PENDING";
  })[0];

  const response = { ...client, pendingPracticalExam };
  res.json(response);
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
  async (req: Request, res: Response, next) => {
    const { id } = req.params;
    console.log("params", id, req.body);

    const { date, paid, comment, notified, result, time } = req.body;
    try {
      const parsedDate = new Date(date);
      const now = new Date();
      if (parsedDate.getTime() <= now.getTime()) {
        throw new ValidationError("La fecha no puede ser anterior a hoy");
      }

      const futureExams = await prisma.practicalExam.findFirst({
        where: {
          clientId: id,
          status: "PENDING",
          date: {
            gte: new Date(),
          },
        },
      });

      if (!!futureExams) {
        throw new ValidationError("Ya hay un examen practico agendado");
      }

      const response = await prisma.practicalExam.create({
        data: {
          paid,
          date,
          comment,
          notified,
          time,
          status: "PENDING",
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
    } catch (e) {
      return next(e);
    }
  }
);

app.put("/practical_exams/:id", async (req: Request, res: Response) => {
  const { id: examId } = req.params;
  const { date, paid, comment, notified, result, time, status } = req.body;

  let basicData = {
    paid,
    date,
    comment,
    notified,
    time,
    status,
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
});

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

app.use((err, req, res, next) => {
  console.log("hola??", err);
  res.status(err.status || 500).send(err);
});

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`)
);
