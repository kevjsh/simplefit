import { Request, Response, NextFunction } from "express";
import log4js from 'log4js';

export const logger = log4js.getLogger("Server");
logger.level = "debug";

export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl == '/')
        return next();
    logger.debug(`Calling ${req.method} ${req.originalUrl}`);

    next();
};