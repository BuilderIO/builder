/**
 * Safe conversion to error type. Intended to be used in catch blocks where the
 *  value is not guaranteed to be an error.
 *
 *  @example
 *  try {
 *    throw new Error('Something went wrong')
 *  }
 *  catch (err: unknown) {
 *    const error: Error = toError(err)
 *  }
 */
export function toError(err: unknown): Error {
  if (err instanceof Error) return err;
  return new Error(String(err));
}
