import UserModel from "../models/user";
import { UserInterface } from "../interfaces/user.interface";
import { BCCryptHandlerUtils } from "../utils/bccrypt.handler";
import { JWTHandleUtils } from "../utils/jwt.handle";
import { LoggerService } from "./logger";

// services

export namespace AuthService {

    export const registerNewUser = async (authUser: UserInterface.User) => {
        const checkIfExists = await UserModel.findOne({ email: authUser.email });
        if (checkIfExists) {
            LoggerService.logger.warn(`User already exists - ${authUser.email}`);
            return "USER_ALREADY_EXISTS";
        }

        authUser.password = await BCCryptHandlerUtils.encrypt(authUser.password);
        const registerNewUser = await UserModel.create(authUser);
        return registerNewUser;
    };

    export const loginUser = async (authUser: UserInterface.User) => {
        const user = await UserModel.findOne({ email: authUser.email });
        if (!user) {
            LoggerService.logger.warn(`User not found - ${authUser.email}`);
            return "USER_NOT_FOUND";
        }
        
        const isCorrect = await BCCryptHandlerUtils.verify(authUser.password, user.password);
        if (!isCorrect) {
            LoggerService.logger.warn(`Password incorrect - ${authUser.email}`);
            return "PASSWORD_INCORRECT";
        }

        // correct user & password
        LoggerService.logger.info(`User logged on - ${authUser.email}`);

        const token = JWTHandleUtils.generateToken(user.id);
        const response = { id: user.id, email: user.email, name: user.name, description: user.description, token: token };
        return response;
    };

}
