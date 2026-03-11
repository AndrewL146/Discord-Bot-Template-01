const levels = ["trace", "debug", "info", "warn", "error", "fatal"];

export function createLogger(level = "info") {
  const min = levels.indexOf(level) >= 0 ? levels.indexOf(level) : 2;

  return Object.fromEntries(
    levels.map((name, index) => [
      name,
      (...args) => {
        if (index < min) return;
        const stamp = new Date().toISOString();
        // eslint-disable-next-line no-console
        console.log(`[${stamp}] [${name.toUpperCase()}]`, ...args);
      },
    ]),
  );
}
