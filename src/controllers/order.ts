import { Response } from "express";
import { handlerHttp } from "../utils/error.handler";
import { RequestExt } from "../interfaces/requestext.interface";
import { logger } from "../services/logger";

// controllers

/** 
 * http://localhost:3002/item 
 * Auth Bearer
 * */
const getItems = async (req: RequestExt, res: Response) => {
    try {
        res.send(
            {
                user: req.user,
                data: 'JWT_AUTH_USERS_ONLY',
            });
    } catch (error) {
        logger.error(error);
        handlerHttp(res, 'ERROR_GET_ITEMS', error);
    }
}

export { getItems };
