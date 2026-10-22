// An error that carries an HTTP status, e.g. throw new HttpError(404, "Listing not found").
// The error middleware turns it into { message } with that status.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
