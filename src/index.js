"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "*");
    // Request methods you wish to allow
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    // Request headers you wish to allow
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", "*");
    // Pass to next layer of middleware
    next();
});
app.use(express_1.default.json());
app.post(`/signup`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, posts } = req.body;
    const postData = posts === null || posts === void 0 ? void 0 : posts.map((post) => {
        return { title: post === null || post === void 0 ? void 0 : post.title, content: post === null || post === void 0 ? void 0 : post.content };
    });
    const result = yield prisma.user.create({
        data: {
            name,
            email,
            posts: {
                create: postData,
            },
        },
    });
    res.json(result);
}));
app.post(`/clients`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, lastName, email, ci, phone, address, notes, secondaryPhone } = req.body;
        const result = yield prisma.client.create({
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
    }
    catch (e) {
        res.sendStatus(500);
    }
}));
app.put(`/clients/:id`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, lastName, email, ci, phone, address, notes, secondaryPhone } = req.body;
        const { id } = req.params;
        const result = yield prisma.client.update({
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
    }
    catch (e) {
        res.sendStatus(500);
    }
}));
app.delete(`/clients/:id`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield prisma.client.delete({ where: { id } });
    res.json(result);
}));
app.get(`/clients`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const clients = yield prisma.client.findMany();
    const result = { clients };
    res.json(result);
}));
app.get(`/clients/:id`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const client = yield prisma.client.findFirst({
        where: { id },
        include: {
            payments: true,
            practicalExams: true,
            theryExams: true,
        },
    });
    res.json(client);
}));
app.post("/clients/:id/payments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: clientId } = req.params;
    const { amount, date, comment } = req.body;
    const result = yield prisma.payment.create({
        data: {
            amount,
            date,
            comment,
            client: { connect: { id: clientId } },
        },
    });
    res.json(result);
}));
app.get("/clients/:id/payments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: clientId } = req.params;
    try {
        const result = yield prisma.payment.findMany({
            where: { clientId },
        });
        res.json(result);
    }
    catch (error) {
        res.json({ error: `Error getting payments ${error}` });
    }
}));
app.put("/payments/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { amount, date, comment } = req.body;
    try {
        const result = yield prisma.payment.update({
            where: { id },
            data: {
                amount,
                date,
                comment,
            },
        });
        res.json(result);
    }
    catch (error) {
        res.json({ error: `Error creating payment ${error}` });
    }
}));
app.delete("/payments/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield prisma.payment.delete({
            where: { id },
        });
        res.json(result);
    }
    catch (error) {
        res.json({ error: `Error creating payment` });
    }
}));
// Exams
app.post("/clients/:id/practical_exams", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { date, paid, comment, notified, result } = req.body;
    console.log("params", id);
    const response = yield prisma.practicalExam.create({
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
}));
app.put("/clients/:clientId/practical_exams/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        updatedData = Object.assign({}, basicData);
    }
    else {
        updatedData = Object.assign(Object.assign({}, basicData), { result: {
                create: {
                    street: result.street,
                    circuit: result.circuit,
                },
            } });
    }
    const response = yield prisma.practicalExam.update({
        where: { id: examId },
        data: updatedData,
        include: {
            result: true,
        },
    });
    res.json(response);
}));
app.delete("/practical_exams/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield prisma.practicalExam.delete({
            where: { id },
        });
        res.json(result);
    }
    catch (error) {
        res.json({ error: `Error creating payment` });
    }
}));
// Exams
app.post("/clients/:id/theory_exams", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { date, comment, notified, result } = req.body;
    const response = yield prisma.theoryExam.create({
        data: {
            date,
            comment,
            notified,
            result,
            client: { connect: { id: id } },
        },
    });
    res.json(response);
}));
app.put("/clients/:clientId/theory_exams/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: examId } = req.params;
    const { date, comment, notified, result } = req.body;
    const response = yield prisma.theoryExam.update({
        where: { id: examId },
        data: { date, comment, notified, result },
    });
    res.json(response);
}));
app.delete("/theory_exams/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield prisma.theoryExam.delete({
            where: { id },
        });
        res.json(result);
    }
    catch (error) {
        res.json({ error: `Error creating payment` });
    }
}));
const server = app.listen(3000, () => console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`));
