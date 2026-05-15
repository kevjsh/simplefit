import { Request, Response, NextFunction } from "express";
const jwt = require('jsonwebtoken');
import { SECRET_JWT_KEY, SECRET_REFRESH_JWT_KEY } from "../config/keys";
import { Session } from "../interfaces/session.interface";
import { logger } from "../helpers/logger.helper";

export function validateToken(req: Request, res: Response, next: NextFunction) {

    if (req.originalUrl == '/') {
        return next();
    }

    const token = req.header('Authorization') || "";

    if (token == "") {
        logger.warn(`JWT Validation - No token provided for URL: ${req.originalUrl}`);
        return res.status(401).json({
            message: "User doesn't provide a token."
        });
    }

    try {
        const { NID, Name, Email } = jwt.verify(token, SECRET_JWT_KEY);

        const session: Session = {
            NID,
            Name,
            Email
        }

        req.session = session;

        next();

    } catch (error) {
        logger.error(`JWT Validation - Token verification failed for URL: ${req.originalUrl}. Error: ${error}`);
        return res.status(401).json({
            message: "Provided token is not correct."
        });
    }
}

export function validateRefreshToken(req: Request, res: Response, next: NextFunction) {

    const { refreshToken } = req.signedCookies;

    if (refreshToken == "") {
        logger.warn(`JWT Refresh Token Validation - No refresh token provided for URL: ${req.originalUrl}`);
        return res.status(401).json({
            message: "User doesn't provide a refresh token."
        });
    }

    try {
        const { Email } = jwt.verify(refreshToken, SECRET_REFRESH_JWT_KEY);

        const session: any = {
            email: Email
        }

        req.session = session;

        next();

    } catch (error) {
        logger.error(`JWT Refresh Token Validation - Token verification failed for URL: ${req.originalUrl}. Error: ${error}`);
        return res.status(401).json({
            message: "Provided refresh token is not correct."
        });
    }
}
