import { Response } from "express";
import { ErrorHandlerUtils } from "../utils/error.handler";
import { RequestExtInterface } from "../interfaces/requestext.interface";
import { LoggerService } from "../services/logger";

export namespace OrderController {

    /** 
     * http://localhost:3002/item 
     * Auth Bearer
     * */
    export const getItems = async (req: RequestExtInterface.RequestExt, res: Response) => {
        try {
            res.send(
                {
                    user: req.user,
                    data: 'JWT_AUTH_USERS_ONLY',
                });
        } catch (error) {
            LoggerService.logger.error(error);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_GET_ITEMS', error);
        }
    }

}
