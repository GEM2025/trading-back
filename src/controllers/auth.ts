import { Request, Response } from "express";
import { loginUser, registerNewUser } from "../services/auth";
import { handlerHttp } from "../utils/error.handler";
import { logger } from "../services/logger";

// controllers

const registerController = async (req: Request, res: Response) => {
    try {
        const responseUser = await registerNewUser(req.body);
        if (responseUser) {
            res.send(responseUser);
        }
        else {
            logger.error(`registerController - no registering poossible ${req.body}`);
            res.status(500);
            res.send('NO REGISTERING POSSIBLE');
        }
    } catch (error) {
        logger.error(error);
        handlerHttp(res, 'ERROR_REGISTERING_USER', error);
    }
};


const loginController = async (req: Request, res: Response) => {
    try {
        const responseUser = await loginUser(req.body);
        if (responseUser) {
            res.send(responseUser);
        }
        else {
            logger.error(`registerController - user not found ${req.body}`);
            res.status(500);
            res.send('USER NOT FOUND');
        }
    } catch (error) {
        logger.error(error);
        handlerHttp(res, 'ERROR_LOGINING_USER', error);
    }

};

export { registerController, loginController };
