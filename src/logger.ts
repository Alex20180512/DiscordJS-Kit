import winston from "winston";

export class Logger {
  private createLogger(level: string, appName: string, filename?: string): winston.Logger {
    const transports: winston.transport[] = [new winston.transports.Console()];
    if (filename) {
      transports.push(new winston.transports.File({ filename }));
    }

    const timestampFormat = "YYYY-MM-DD HH:mm:ss:SSS";
    const loggerFormat = winston.format.printf(({ timestamp, level, message }) => {
      if (filename) {
        return `[${timestamp}][${appName}][${level.toUpperCase()}] ${message}`;
      } else {
        return `[${appName}][${level.toUpperCase()}] ${message}`;
      }
    });

    return winston.createLogger({
      level: level,
      format: winston.format.combine(winston.format.timestamp({ format: timestampFormat }), loggerFormat),
      transports: transports,
    });
  }

  private infoLogger: winston.Logger;
  private warningLogger: winston.Logger;
  private errorLogger: winston.Logger;

  constructor(appName: string, logToFile: boolean = true) {
    this.infoLogger = this.createLogger("info", appName, logToFile ? "./logs/info.log" : undefined);
    this.warningLogger = this.createLogger("warn", appName, logToFile ? "./logs/warning.log" : undefined);
    this.errorLogger = this.createLogger("error", appName, logToFile ? "./logs/error.log" : undefined);
  }

  public loggerInfo(msg: string) {
    this.infoLogger.info(msg);
  }

  public loggerWarning(msg: string) {
    this.warningLogger.warn(msg);
  }

  public loggerError(msg: string | unknown) {
    this.errorLogger.error(msg);
  }
}
