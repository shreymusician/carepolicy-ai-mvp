export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ILogger {
  debug(message: string, meta?: Record<string, unknown>, traceId?: string): void;
  info(message: string, meta?: Record<string, unknown>, traceId?: string): void;
  warn(message: string, meta?: Record<string, unknown>, traceId?: string): void;
  error(message: string, error?: Error | unknown, traceId?: string): void;
}

export class ConsoleLogger implements ILogger {
  private minLevel: LogLevel;
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  constructor(minLevel: LogLevel = 'info') {
    this.minLevel = minLevel;
  }

  debug(message: string, meta?: Record<string, unknown>, traceId?: string): void {
    if (this.levels['debug'] >= this.levels[this.minLevel]) {
      this.log('debug', message, meta, traceId);
    }
  }

  info(message: string, meta?: Record<string, unknown>, traceId?: string): void {
    if (this.levels['info'] >= this.levels[this.minLevel]) {
      this.log('info', message, meta, traceId);
    }
  }

  warn(message: string, meta?: Record<string, unknown>, traceId?: string): void {
    if (this.levels['warn'] >= this.levels[this.minLevel]) {
      this.log('warn', message, meta, traceId);
    }
  }

  error(message: string, error?: Error | unknown, traceId?: string): void {
    if (this.levels['error'] >= this.levels[this.minLevel]) {
      const errorData = error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { error: String(error) };

      this.log('error', message, { ...errorData }, traceId);
    }
  }

  private log(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
    traceId?: string
  ): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      traceId: traceId || 'N/A',
      ...(meta && Object.keys(meta).length > 0 && { meta })
    };

    // Color-code console output in development
    const colors: Record<LogLevel, string> = {
      debug: '\x1b[36m',    // Cyan
      info: '\x1b[32m',     // Green
      warn: '\x1b[33m',     // Yellow
      error: '\x1b[31m'     // Red
    };
    const reset = '\x1b[0m';

    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      const color = colors[level];
      console.log(`${color}[${level.toUpperCase()}]${reset}`, JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }
}

// Global logger instance
let logger: ILogger = new ConsoleLogger('info');

export function getLogger(): ILogger {
  return logger;
}

export function setLogger(newLogger: ILogger): void {
  logger = newLogger;
}

export default logger;
