export type ActionResState<TOk, TError> =
  | {
      is_success: false;
      error?: TError;
      message: string;
    }
  | {
      is_success: true;
      data: TOk;
    };

export function createErrorResponse<TError>(
  message: string,
  error?: TError,
): ActionResState<never, TError> {
  return {
    is_success: false,
    message,
    error,
  };
}

export function createSuccessResponse<TOk>(
  data: TOk,
): ActionResState<TOk, never> {
  return {
    is_success: true,
    data,
  };
}
