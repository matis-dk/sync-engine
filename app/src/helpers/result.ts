export type Result<Err, Ok> = ResultSuccess<Ok> | ResultError<Err>;

export type ResultSuccess<Output> = {
  success: true;
  data: Output;
};

export type ResultError<Input> = {
  success: false;
  error: Input;
};

export const resultSuccess = <T>(data: T) => ({ success: true, data }) as const;
export const resultError = <T>(error: T) =>
  ({ success: false, error }) as const;

export const resultErrorSlim = <T extends string>(code: T, meta?: unknown) =>
  resultError({
    code,
    meta,
    stack: {},
  });

export type PromiseR<L, R> = Promise<Result<L, R>>;

export type ExtractCode<T extends (...args: any) => any> = Extract<
  Awaited<ReturnType<T>>,
  { success: false }
>["error"]["code"];

export type ExtractSuccess<T extends (...args: any) => any> = Extract<
  Awaited<ReturnType<T>>,
  { success: true }
>["data"];
