import { Request, Response } from "express";
import { loginUser, registerNewUser } from "../services/auth";
import { handlerHttp } from "../utils/error.handler";

// controllers

const registerController = async (req: Request, res: Response) => {
    try {
        const responseUser = await registerNewUser(req.body);
        if (responseUser) {
            res.send(responseUser);
        }
        else {
            res.status(500);
            res.send('NO REGISTERING POSSIBLE');
        }
    } catch (error) {
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
            res.status(500);
            res.send('USER NOT FOUND');
        }
    } catch (error) {
        handlerHttp(res, 'ERROR_LOGINING_USER', error);
    }

};

export { registerController, loginController };
