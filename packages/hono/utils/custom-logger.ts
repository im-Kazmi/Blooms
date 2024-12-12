import chalk from "chalk";
import { logger } from "hono/logger";

export const customLogger = logger((message, ...rest) => {
  console.log(chalk.yellow(message), ...rest.map((item) => chalk.green(item)));
});
