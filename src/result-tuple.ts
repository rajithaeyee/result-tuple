import { ResultTuple } from "./types";

export function wrapFunction<T, Args extends any[]>(
  fn: (...args: Args) => T
): (...args: Args) => ResultTuple<T> {
  return (...args: Args): ResultTuple<T> => {
    try {
      const result = fn(...args);
      return [result, null];
    } catch (err) {
      return [null, err instanceof Error ? err : new Error(String(err))];
    }
  };
}

export function wrapAsyncFunction<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>
): (...args: Args) => Promise<ResultTuple<T>> {
  return async (...args: Args): Promise<ResultTuple<T>> => {
    try {
      const result = await fn(...args);
      return [result, null];
    } catch (err) {
      return [null, err instanceof Error ? err : new Error(String(err))];
    }
  };
}

export function ok<T>(value: T): [T, null] {
  return [value, null];
}

export function fail<T>(error: Error | string): [null, Error] {
  const err = typeof error === 'string' ? new Error(error) : error;
  return [null, err];
}

export function attempt<T>(fn: () => T): ResultTuple<T> {
  try {
    return [fn(), null];
  } catch (err) {
    return [null, err instanceof Error ? err : new Error(String(err))];
  }
}

export async function attemptAsync<T>(fn: () => Promise<T>): Promise<ResultTuple<T>> {
  try {
    return [await fn(), null];
  } catch (err) {
    return [null, err instanceof Error ? err : new Error(String(err))];
  }
}