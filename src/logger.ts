import winston from "winston";

export class Logger {
  private createLogger(level: string, appName: string, filename: string): winston.Logger {
    const timestampFormat = "YYYY-MM-DD HH:mm:ss:SSS";
    const loggerFormat = winston.format.printf(({ timestamp, level, message }) => {
      return `[${appName}][${timestamp}][${level.toUpperCase()}] ${message}`;
    });

    return winston.createLogger({
      level: level,
      format: winston.format.combine(winston.format.timestamp({ format: timestampFormat }), loggerFormat),
      transports: [new winston.transports.Console(), new winston.transports.File({ filename })],
    });
  }

  private infoLogger: winston.Logger;
  private warningLogger: winston.Logger;
  private errorLogger: winston.Logger;

  constructor(appName: string) {
    this.infoLogger = this.createLogger("info", appName, "./logs/info.log");
    this.warningLogger = this.createLogger("warn", appName, "./logs/warning.log");
    this.errorLogger = this.createLogger("error", appName, "./logs/error.log");
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
