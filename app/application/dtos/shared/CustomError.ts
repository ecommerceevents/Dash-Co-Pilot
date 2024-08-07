export class CustomError {
  public message: string;
  public details?: Record<string, any>;
  public constructor(message: string, details?: Record<string, any>) {
    this.message = message;
    this.details = details;
  }
}
