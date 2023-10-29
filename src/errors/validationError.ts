import ApiError from "./apiError";

export default class ValidationError extends ApiError {
  status: number;
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);

    Error.captureStackTrace(this, this.constructor);

    this.message = message || "Something went wrong. Please try again.";
  }
}
