export const sendSuccess = (message: string, data: any = null) => ({
  success: true,
  message,
  data,
});

export const sendError = (message: string, error: any = null) => ({
  success: false,
  message,
  error,
});
