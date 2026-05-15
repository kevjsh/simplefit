import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { logger } from "../helpers/logger.helper";

export function validation(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Error case
    const error = `Error processing the request for path: ${req.path} and method: ${req.method}. Body: ${JSON.stringify(req.body)}. Missing fields: ${JSON.stringify(errors)}`;
    logger.error(error);
    return res.status(400).send(error);
  }

  next();
}
