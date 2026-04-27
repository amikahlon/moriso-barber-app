const DEFAULT_LOGIN_ERROR = "לא ניתן להתחבר כרגע. נסה שוב.";
const DEFAULT_REGISTER_ERROR = "לא ניתן ליצור חשבון כרגע. נסה שוב.";

type AuthAction = "login" | "register";

const defaultMessages: Record<AuthAction, string> = {
  login: DEFAULT_LOGIN_ERROR,
  register: DEFAULT_REGISTER_ERROR,
};

const normalizeMessage = (message: unknown): string | null => {
  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (Array.isArray(message)) {
    const parts = message
      .map((part) => normalizeMessage(part))
      .filter((part): part is string => !!part);

    return parts.length > 0 ? parts.join("\n") : null;
  }

  if (message && typeof message === "object") {
    const parts = Object.values(message)
      .map((part) => normalizeMessage(part))
      .filter((part): part is string => !!part);

    return parts.length > 0 ? parts.join("\n") : null;
  }

  return null;
};

export const getAuthErrorMessage = (error: unknown, action: AuthAction) => {
  const maybeError = error as {
    message?: unknown;
    response?: { data?: { message?: unknown; error?: unknown } };
  };

  return (
    normalizeMessage(maybeError?.response?.data?.message) ??
    normalizeMessage(maybeError?.response?.data?.error) ??
    normalizeMessage(maybeError?.message) ??
    defaultMessages[action]
  );
};
