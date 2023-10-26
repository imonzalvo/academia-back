"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var express_1 = __importDefault(require("express"));
var prisma = new client_1.PrismaClient();
var app = (0, express_1.default)();
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
app.post("/signup", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, email, posts, postData, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, name = _a.name, email = _a.email, posts = _a.posts;
                postData = posts === null || posts === void 0 ? void 0 : posts.map(function (post) {
                    return { title: post === null || post === void 0 ? void 0 : post.title, content: post === null || post === void 0 ? void 0 : post.content };
                });
                return [4 /*yield*/, prisma.user.create({
                        data: {
                            name: name,
                            email: email,
                            posts: {
                                create: postData,
                            },
                        },
                    })];
            case 1:
                result = _b.sent();
                res.json(result);
                return [2 /*return*/];
        }
    });
}); });
app.post("/clients", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_1, lastName, email, ci, phone, address, notes, secondaryPhone, result, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_1 = _a.name, lastName = _a.lastName, email = _a.email, ci = _a.ci, phone = _a.phone, address = _a.address, notes = _a.notes, secondaryPhone = _a.secondaryPhone;
                return [4 /*yield*/, prisma.client.create({
                        data: {
                            name: name_1,
                            lastName: lastName,
                            email: email,
                            ci: ci,
                            phone: phone,
                            address: address,
                            notes: notes,
                            secondaryPhone: secondaryPhone,
                        },
                    })];
            case 1:
                result = _b.sent();
                res.json(result);
                return [3 /*break*/, 3];
            case 2:
                e_1 = _b.sent();
                res.sendStatus(500);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put("/clients/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_2, lastName, email, ci, phone, address, notes, secondaryPhone, id, result, e_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_2 = _a.name, lastName = _a.lastName, email = _a.email, ci = _a.ci, phone = _a.phone, address = _a.address, notes = _a.notes, secondaryPhone = _a.secondaryPhone;
                id = req.params.id;
                return [4 /*yield*/, prisma.client.update({
                        where: { id: id },
                        data: {
                            name: name_2,
                            lastName: lastName,
                            email: email,
                            ci: ci,
                            phone: phone,
                            address: address,
                            notes: notes,
                            secondaryPhone: secondaryPhone,
                        },
                    })];
            case 1:
                result = _b.sent();
                res.json(result);
                return [3 /*break*/, 3];
            case 2:
                e_2 = _b.sent();
                res.sendStatus(500);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.delete("/clients/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                return [4 /*yield*/, prisma.client.delete({ where: { id: id } })];
            case 1:
                result = _a.sent();
                res.json(result);
                return [2 /*return*/];
        }
    });
}); });
app.get("/clients", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var clients, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.client.findMany()];
            case 1:
                clients = _a.sent();
                result = { clients: clients };
                res.json(result);
                return [2 /*return*/];
        }
    });
}); });
app.get("/clients/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, client;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                return [4 /*yield*/, prisma.client.findFirst({
                        where: { id: id },
                        include: {
                            payments: true,
                            practicalExams: true,
                            theryExams: true,
                        },
                    })];
            case 1:
                client = _a.sent();
                res.json(client);
                return [2 /*return*/];
        }
    });
}); });
app.post("/clients/:id/payments", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var clientId, _a, amount, date, comment, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                clientId = req.params.id;
                _a = req.body, amount = _a.amount, date = _a.date, comment = _a.comment;
                return [4 /*yield*/, prisma.payment.create({
                        data: {
                            amount: amount,
                            date: date,
                            comment: comment,
                            client: { connect: { id: clientId } },
                        },
                    })];
            case 1:
                result = _b.sent();
                res.json(result);
                return [2 /*return*/];
        }
    });
}); });
app.get("/clients/:id/payments", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var clientId, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                clientId = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.payment.findMany({
                        where: { clientId: clientId },
                    })];
            case 2:
                result = _a.sent();
                res.json(result);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                res.json({ error: "Error getting payments ".concat(error_1) });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.put("/payments/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, amount, date, comment, result, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = req.params.id;
                _a = req.body, amount = _a.amount, date = _a.date, comment = _a.comment;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.payment.update({
                        where: { id: id },
                        data: {
                            amount: amount,
                            date: date,
                            comment: comment,
                        },
                    })];
            case 2:
                result = _b.sent();
                res.json(result);
                return [3 /*break*/, 4];
            case 3:
                error_2 = _b.sent();
                res.json({ error: "Error creating payment ".concat(error_2) });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.delete("/payments/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.payment.delete({
                        where: { id: id },
                    })];
            case 2:
                result = _a.sent();
                res.json(result);
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                res.json({ error: "Error creating payment" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Exams
app.post("/clients/:id/practical_exams", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, date, paid, comment, notified, result, response;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = req.params.id;
                _a = req.body, date = _a.date, paid = _a.paid, comment = _a.comment, notified = _a.notified, result = _a.result;
                console.log("params", id);
                return [4 /*yield*/, prisma.practicalExam.create({
                        data: {
                            paid: paid,
                            date: date,
                            comment: comment,
                            notified: notified,
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
                    })];
            case 1:
                response = _b.sent();
                res.json(response);
                return [2 /*return*/];
        }
    });
}); });
app.put("/clients/:clientId/practical_exams/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var examId, _a, date, paid, comment, notified, result, basicData, updatedData, response;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                examId = req.params.id;
                _a = req.body, date = _a.date, paid = _a.paid, comment = _a.comment, notified = _a.notified, result = _a.result;
                basicData = {
                    paid: paid,
                    date: date,
                    comment: comment,
                    notified: notified,
                };
                if (!result) {
                    updatedData = __assign({}, basicData);
                }
                else {
                    updatedData = __assign(__assign({}, basicData), { result: {
                            create: {
                                street: result.street,
                                circuit: result.circuit,
                            },
                        } });
                }
                return [4 /*yield*/, prisma.practicalExam.update({
                        where: { id: examId },
                        data: updatedData,
                        include: {
                            result: true,
                        },
                    })];
            case 1:
                response = _b.sent();
                res.json(response);
                return [2 /*return*/];
        }
    });
}); });
app.delete("/practical_exams/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.practicalExam.delete({
                        where: { id: id },
                    })];
            case 2:
                result = _a.sent();
                res.json(result);
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                res.json({ error: "Error creating payment" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Exams
app.post("/clients/:id/theory_exams", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, date, comment, notified, result, response;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = req.params.id;
                _a = req.body, date = _a.date, comment = _a.comment, notified = _a.notified, result = _a.result;
                return [4 /*yield*/, prisma.theoryExam.create({
                        data: {
                            date: date,
                            comment: comment,
                            notified: notified,
                            result: result,
                            client: { connect: { id: id } },
                        },
                    })];
            case 1:
                response = _b.sent();
                res.json(response);
                return [2 /*return*/];
        }
    });
}); });
app.put("/clients/:clientId/theory_exams/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var examId, _a, date, comment, notified, result, response;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                examId = req.params.id;
                _a = req.body, date = _a.date, comment = _a.comment, notified = _a.notified, result = _a.result;
                return [4 /*yield*/, prisma.theoryExam.update({
                        where: { id: examId },
                        data: { date: date, comment: comment, notified: notified, result: result },
                    })];
            case 1:
                response = _b.sent();
                res.json(response);
                return [2 /*return*/];
        }
    });
}); });
app.delete("/theory_exams/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.theoryExam.delete({
                        where: { id: id },
                    })];
            case 2:
                result = _a.sent();
                res.json(result);
                return [3 /*break*/, 4];
            case 3:
                error_5 = _a.sent();
                res.json({ error: "Error creating payment" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
var server = app.listen(3000, function () {
    return console.log("\n\uD83D\uDE80 Server ready at: http://localhost:3000\n\u2B50\uFE0F See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api");
});
