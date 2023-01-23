import { Request, Response } from "express";
import { AuthService } from "../services/auth";
import { ErrorHandlerUtils } from "../utils/error.handler";
import { LoggerService } from "../services/logger";

export namespace AuthController {

    export const registerController = async (req: Request, res: Response) => {
        try {
            const responseUser = await AuthService.registerNewUser(req.body);
            if (responseUser) {
                res.send(responseUser);
            }
            else {
                LoggerService.logger.error(`registerController - no registering poossible ${req.body}`);
                res.status(500);
                res.send('NO REGISTERING POSSIBLE');
            }
        } catch (error) {
            LoggerService.logger.error(error);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_REGISTERING_USER', error);
        }
    };


    export const loginController = async (req: Request, res: Response) => {
        try {
            const responseUser = await AuthService.loginUser(req.body);
            if (responseUser) {
                res.send(responseUser);
            }
            else {
                LoggerService.logger.error(`registerController - user not found ${req.body}`);
                res.status(500);
                res.send('USER NOT FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(error);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_LOGINING_USER', error);
        }

    };

}
