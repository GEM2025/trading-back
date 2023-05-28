import UserModel from "../models/user";
import { IUser } from "../interfaces/user.interface";
import { BCCryptHandlerUtils } from "../utils/bccrypt.handler";
import { JWTHandleUtils } from "../utils/jwt.handle";
import { LoggerService } from "./logger";

// services

export namespace AuthService {
    
    // ---------------------------------
    /** http://localhost:3002/Currency */
    export const getUsers = async (info: any) => {

        const responseInsert = await UserModel.find({}).skip(info.skip).limit(info.limit);
        info.total = await UserModel.find({}).countDocuments();
        info.results = responseInsert.length;
        return responseInsert;
    };

    export const registerNewUser = async (authUser: IUser) => {
        const checkIfExists = await UserModel.findOne({ email: authUser.email });
        if (checkIfExists) {
            LoggerService.logger.warn(`User already exists - ${authUser.email}`);
            return "USER_ALREADY_EXISTS";
        }

        authUser.password = await BCCryptHandlerUtils.encrypt(authUser.password);
        const registerNewUser = await UserModel.create(authUser);
        return registerNewUser;
    };

    export const loginUser = async (authUser: IUser) => {
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
        
        if (!user.enabled) {
            LoggerService.logger.warn(`User disabled - ${authUser.email}`);
            return "USER_DISABLED";
        }

        // correct user & password
        LoggerService.logger.info(`User logged on - ${authUser.email}`);

        const token = JWTHandleUtils.generateToken(user.id);
        const response = { id: user.id, email: user.email, name: user.name, role: user.role, token: token };
        return response;
    };

    export const resetPassword  = async (authUser: IUser) => {
        
        authUser.password = await BCCryptHandlerUtils.encrypt(authUser.password);

        const checkIfExists = await UserModel.findOneAndUpdate(
            { email: authUser.email },
            { $set: authUser },
            { new: false, upsert: false });
            
        if (!checkIfExists) {
            LoggerService.logger.warn(`User doest not exist - ${authUser.email}`);
            return "USER_DOES_NOT_EXIST";
        }

        return "PASSWORD_RESET_SUCCESSFUL";        
    };

}
