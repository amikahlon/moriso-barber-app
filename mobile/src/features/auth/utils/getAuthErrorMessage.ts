const DEFAULT_LOGIN_ERROR = "לא ניתן להתחבר כרגע. נסה שוב.";
const DEFAULT_REGISTER_ERROR = "לא ניתן ליצור חשבון כרגע. נסה שוב.";

type AuthAction = "login" | "register";

const defaultMessages: Record<AuthAction, string> = {
  login: DEFAULT_LOGIN_ERROR,
  register: DEFAULT_REGISTER_ERROR,
};

const INVALID_LOGIN_MESSAGE = "האימייל או הסיסמה שהוזנו אינם נכונים.";
const REGISTER_EMAIL_EXISTS_MESSAGE =
  "האימייל הזה כבר קיים במערכת. אפשר להתחבר או להשתמש באימייל אחר.";
const REGISTER_INVALID_DETAILS_MESSAGE =
  "חלק מהפרטים שהוזנו אינם תקינים. בדוק את השדות ונסה שוב.";
const REGISTER_WEAK_PASSWORD_MESSAGE =
  "הסיסמה לא עומדת בדרישות. יש לבחור סיסמה חזקה יותר.";

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

const isUnauthorizedError = (message?: string | null) => {
  const normalized = message?.toLowerCase() ?? "";

  return (
    normalized.includes("unauthorized") ||
    normalized.includes("invalid credentials") ||
    normalized.includes("invalid login")
  );
};

const includesAny = (message: string | null | undefined, parts: string[]) => {
  const normalized = message?.toLowerCase() ?? "";
  return parts.some((part) => normalized.includes(part));
};

export const getAuthErrorMessage = (error: unknown, action: AuthAction) => {
  const maybeError = error as {
    message?: unknown;
    response?: { status?: number; data?: { message?: unknown; error?: unknown } };
  };
  const responseMessage = normalizeMessage(maybeError?.response?.data?.message);
  const responseError = normalizeMessage(maybeError?.response?.data?.error);
  const errorMessage = normalizeMessage(maybeError?.message);

  if (
    action === "login" &&
    (maybeError?.response?.status === 401 ||
      isUnauthorizedError(responseMessage) ||
      isUnauthorizedError(responseError) ||
      isUnauthorizedError(errorMessage))
  ) {
    return INVALID_LOGIN_MESSAGE;
  }

  if (action === "register") {
    if (
      maybeError?.response?.status === 409 ||
      includesAny(responseMessage, ["המייל כבר קיים", "email already", "already registered", "already exists"]) ||
      includesAny(responseError, ["email already", "already registered", "already exists"]) ||
      includesAny(errorMessage, ["email already", "already registered", "already exists"])
    ) {
      return REGISTER_EMAIL_EXISTS_MESSAGE;
    }

    if (
      includesAny(responseMessage, ["password", "weak", "סיסמה"]) ||
      includesAny(responseError, ["password", "weak"]) ||
      includesAny(errorMessage, ["password", "weak"])
    ) {
      return REGISTER_WEAK_PASSWORD_MESSAGE;
    }

    if (maybeError?.response?.status === 400) {
      return REGISTER_INVALID_DETAILS_MESSAGE;
    }
  }

  return defaultMessages[action];
};
