type UnauthorizedHandler = () => Promise<void> | void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null) => {
  unauthorizedHandler = handler;
};

export const triggerUnauthorizedHandler = async () => {
  if (!unauthorizedHandler) {
    return;
  }

  await unauthorizedHandler();
};
