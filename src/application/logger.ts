import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";



//Custom Format for Logging
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
  winston.format.printf(({ level, message, timestamp, ...metadata}) => {
      return `[${timestamp}] [${level}]: ${message} {${Object.keys(metadata).length ? JSON.stringify(metadata) : ''} }`;
  })
);

//Custom Format for Daily Rotate File
const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

const logger = winston.createLogger({
    level: 'info',
    format: consoleFormat,
    transports: [
        new winston.transports.Console({
            format: consoleFormat,
            level: 'debug'
        }),

        new DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '15m',
            maxFiles: '7d',
            format: fileFormat,
            level: 'info'
        }),

        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: fileFormat
        })
    ]
});

export default logger;