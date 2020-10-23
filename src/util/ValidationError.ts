export type ValidationErrorCode = "NoValue" | "InvalidFileFormat";

export default class ValidationError extends Error {
  public readonly code: ValidationErrorCode;

  constructor (code: ValidationErrorCode, ...params: ConstructorParameters<typeof Error>) {
    super(...params);

    // Only available in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }

    this.name = "ValidationError";
    this.code = code;
  }
}
