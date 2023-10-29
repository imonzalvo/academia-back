import ApiError from "./apiError";

export default class NotFoundError extends ApiError {
  status: number;
  constructor(message: string) {
    super(message, "NOT_FOUND", 404);

    Error.captureStackTrace(this, this.constructor);

    this.message = message || "Something went wrong. Please try again.";
  }
}
