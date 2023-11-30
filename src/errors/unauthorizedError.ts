import ApiError from "./apiError";

export default class UnauthorizedError extends ApiError {
  status: number;
  constructor(message: string) {
    super(message, "UNAUTHORIZED_ERROR", 401);

    Error.captureStackTrace(this, this.constructor);

    this.message = message || "Something went wrong. Please try again.";
  }
}
