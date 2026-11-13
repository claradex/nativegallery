import { NotFoundException, type HttpException } from '@nestjs/common';

/** Largest value of the signed INT id columns. */
export const maxId = 2147483647;

/** A positive id from a digit string, or 0 when the value is not one. */
export function parseId(value: unknown) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return 0;
  const id = Number(value);
  return id <= maxId ? id : 0;
}

/** Like {@link parseId}, but rejects invalid ids with `error` (404 by default). */
export function requireId(value: unknown, error: new () => HttpException = NotFoundException) {
  const id = parseId(value);
  if (!id) throw new error();
  return id;
}
