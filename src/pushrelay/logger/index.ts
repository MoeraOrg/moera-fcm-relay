import { createLogger, format, Logger, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as process from 'process';

let logger: Logger | null = null;

export function getLogger(): Logger {
    if (logger == null) {
        const trans = [
            new transports.Console(),
            new DailyRotateFile({
                filename: "relay-%DATE%.log",
                dirname: process.env.LOG_DIR,
                datePattern: "YYYY-MM-DD",
                zippedArchive: true,
                maxSize: "20m",
                maxFiles: "14d"
            })
        ];

        logger = createLogger({
            level: process.env.LOG_LEVEL,
            format: format.combine(
                format.timestamp({format: "YYYY-MM-DD HH:mm:ss.SSS"}),
                format.printf(({timestamp, level, module, message}) =>
                    `${timestamp} ${level.toUpperCase()} --- [${module ?? 'server'}]: ${message}`)
            ),
            transports: trans,
            exceptionHandlers: trans
        });
    }
    return logger;
}

export function deriveLogger(module: string): (() => Logger) {
    let logger: Logger | null = null;

    return () => {
        if (logger == null) {
            logger = getLogger().child({module});
        }
        return logger;
    }
}
