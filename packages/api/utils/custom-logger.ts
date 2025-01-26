import chalk from "chalk";
import { logger as honoLogger } from "hono/logger";

export const customLogger = honoLogger((message, ...rest) => {
  console.log(chalk.yellow(message), ...rest.map((item) => chalk.green(item)));
});

type LogLevel = "info" | "warn" | "error" | "debug" | "success";

interface LogLevelConfig {
  label: string;
  color: (text: string) => string;
}

const levels: Record<LogLevel, LogLevelConfig> = {
  info: { label: "INFO", color: chalk.blue },
  warn: { label: "WARN", color: chalk.yellow },
  error: { label: "ERROR", color: chalk.red },
  debug: { label: "DEBUG", color: chalk.magenta },
  success: { label: "SUCCESS", color: chalk.green },
};

const log = (level: LogLevel, message: string, data?: unknown): void => {
  const levelInfo = levels[level];
  const timestamp = chalk.gray(`[${new Date().toISOString()}]`);
  const levelLabel = levelInfo.color(`[${levelInfo.label}]`);

  if (data) {
    console.log(`${timestamp} ${levelLabel} ${message}`, data);
  } else {
    console.log(`${timestamp} ${levelLabel} ${message}`);
  }
};

export const logger = {
  info: (message: string, data?: unknown) => log("info", message, data),
  warn: (message: string, data?: unknown) => log("warn", message, data),
  error: (message: string, data?: unknown) => log("error", message, data),
  debug: (message: string, data?: unknown) => log("debug", message, data),
  success: (message: string, data?: unknown) => log("success", message, data),
};
