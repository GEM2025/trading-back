import { } from "jsonwebtoken";
import { } from "../middleware/file";

import { JWTHandleUtils } from "../utils/jwt.handle";
import { LoggerService } from "../services/logger";
import { NextFunction, Response } from "express";
import { RequestExtInterface } from "../interfaces/requestext.interface";

export namespace SessionMiddleware {

    export const checkJwt = (req: RequestExtInterface.RequestExt, res: Response, next: NextFunction) => {
        try {
            const jwtByUser = req.headers.authorization || "";
            const jwt = jwtByUser.split(" ").pop(); // 11111
            const isValidToken = JWTHandleUtils.verifyToken(`${jwt}`) as { id: string };
            if (!isValidToken) {
                res.status(401);
                res.send("NO_TIENES_UN_JWT_VALIDO");
            } else {
                req.user = isValidToken;
                next();
            }
        } catch (e) {
            LoggerService.logger.error({ e });
            res.status(400);
            res.send("SESSION_NO_VALIDAD");
        }
    };

} 
