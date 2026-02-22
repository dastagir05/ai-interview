const isDev = process.env.NODE_ENV === "development";

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  error: (...args: unknown[]) => {
    if (isDev) console.error(...args);
    // Send to error tracking service in production
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
};
