import { NextFunction, Request, Response } from "express";

// middleware

const logMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers ;
    console.log(`LOG: ${header["user-agent"]}`);
    next();
} ;

export { logMiddleware };