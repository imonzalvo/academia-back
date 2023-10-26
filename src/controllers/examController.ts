// import { Request, Response } from "express";

// interface IPaymentDto {
//     date: Date,
//     payed: Boolean,
//     comment: String,
//     result: IResultDto
// }

// interface IResultDto {
//     circuit: Boolean,
//     street: Boolean
// }

// export const createExam = async (req: Request, res: Response) => {
//   const { id: clientId } = req.params;
//   const { date, payed, comment, result } = req.body;

//   const response = await prisma.payment.create({
//     data: {
//       amount,
//       date,
//       comment,
//       client: { connect: { id: clientId } },
//     },
//   });

//   res.json(response);
// };
