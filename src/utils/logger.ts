import config = require('config');
import winston = require('winston');

import { ILoggerConfig } from './configs';

class Logger {
    public logger;

    constructor() {
        this.logger = winston.createLogger({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.align(),
                winston.format.printf((info) => {
                    const {
                        timestamp, level, message, ...args
                    } = info;

                    const ts = timestamp.slice(0, 19).replace('T', ' ');
                    return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
                })
            ),
            transports: [
                new winston.transports.Console({ level: config.get<ILoggerConfig>('logger').level })
            ]
        });

        const self = this;
        this.logger.stream = {
            write: (message, encoding) => {
                self.logger.info(message);
            }
        };
    }
}
export default new Logger().logger;
