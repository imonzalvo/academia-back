interface Error {
  status?: number;
  type?: string;
}

export default class ApiError extends Error {
  status: number;
  type: string;
  constructor(message: string, type: string, status: number) {
    super();

    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;

    this.status = status;
    this.message = message || "Something went wrong. Please try again.";
    this.type = type || "GENERIC_ERROR";
  }
}
