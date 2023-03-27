import { Request, Response } from "express";
import { AuthService } from "../services/auth";
import { ErrorHandlerUtils } from "../utils/error.handler";
import { LoggerService } from "../services/logger";

export namespace AuthController {


       // ------------------------------------------------------------------------------------------
    /** http://localhost:3002/auth */
    export const getUsers = async (req: Request, res: Response) => {

        try {

            const skip = Number.parseInt(req.query.skip?.toString() || "0") || 0;
            const limit = Number.parseInt(req.query.limit?.toString() || "999") || 999;
            let info = { seed: "", skip: skip, limit: limit, total: undefined, results: undefined, version: "0.1" };

            LoggerService.logger.info(`Get Users skip ${skip} limit ${limit}`);
            const responseUsers = await AuthService.getUsers(info);
            if (responseUsers) {
                setTimeout(() => {
                    res.send({ results: responseUsers, info: info });
                }, 300);
            }
            else {
                LoggerService.logger.error(`User Controller - no records found ${req.body}`);
                res.status(500);
                res.send('NO RECORDS FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`User Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_GET_ITEMS', error);
        }
    }


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

    export const resetPasswordController = async (req: Request, res: Response) => {
        try {
            const responseUser = await AuthService.resetPassword(req.body);
            if (responseUser) {
                res.send(responseUser);
            }
            else {
                LoggerService.logger.error(`resetPasswordController - user not found ${req.body}`);
                res.status(500);
                res.send('USER NOT FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(error);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_RESETING_PASSWORD', error);
        }

    };

}
