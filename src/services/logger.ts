import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export namespace LoggerService {

  export const logger = createLogger({
    format: format.combine(
      format.timestamp({
        format: 'MMMDD HH:mm:ss'
      }),
      format.simple(),
      format.colorize(),
      format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
      new transports.Console(),
      new DailyRotateFile({
        filename: 'condor-backend-%DATE%.log',
        dirname: 'logs',
        maxSize: '20m',
        maxFiles: '14d'
      })
    ]
  });

}

