import { NextFunction, Request, Response } from "express";
import { logger } from "../services/logger";

// middleware

const logMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers ;
    logger.info(`LOG: ${header["user-agent"]}`);
    next();
} ;

export { logMiddleware };