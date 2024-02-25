import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    format: format.combine(
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS'}),
        format.printf(({level, message, timestamp}) =>
            `${timestamp} ${level.toUpperCase()} --- ${message}`)
    ),
    transports: [new transports.Console()]
});

export default logger;
