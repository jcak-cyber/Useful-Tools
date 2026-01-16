/**
 * 日志工具
 * 生产环境自动禁用 console 输出
 */

const isDevelopment = import.meta.env.DEV;

class Logger {
  private output(level: "log" | "warn" | "error", ...args: any[]) {
    if (isDevelopment) {
      console[level](...args);
    }
  }

  log(...args: any[]) {
    this.output("log", ...args);
  }

  warn(...args: any[]) {
    this.output("warn", ...args);
  }

  error(...args: any[]) {
    // 错误日志在生产环境也输出
    console.error(...args);
  }
}

export const logger = new Logger();
