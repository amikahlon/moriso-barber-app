const INVALID_REFRESH_TOKEN_MESSAGES = [
  "Invalid Refresh Token",
  "Refresh Token Not Found",
];

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message ?? "");
  }

  return String(error ?? "");
};

export const isInvalidRefreshTokenError = (error: unknown) => {
  const message = getErrorMessage(error);

  return INVALID_REFRESH_TOKEN_MESSAGES.some((part) =>
    message.includes(part),
  );
};

export const getAuthErrorMessageForLog = (error: unknown) =>
  getErrorMessage(error) || "Unknown auth error";
