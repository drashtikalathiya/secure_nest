export const sendSuccess = <T>(message: string, data: T | null = null) => ({
  success: true,
  message,
  data,
});

export const sendError = <T>(message: string, error: T | null = null) => ({
  success: false,
  message,
  error,
});
