import { NextFunction, Request, Response } from "express";
import { LoggerService } from "../services/logger";

export namespace LogMiddleware {

    export const log = (req: Request, res: Response, next: NextFunction) => {
        const header = req.headers;
        LoggerService.logger.info(`LOG: ${header["user-agent"]}`);
        next();
    };

}