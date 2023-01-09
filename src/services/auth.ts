import { User } from "../interfaces/user.interface";
import UserModel from "../models/user";
import { encrypt, verify } from "../utils/bccrypt.handler";
import { generateToken } from "../utils/jwt.handle";
import { logger } from "./logger";

// services

const registerNewUser = async (authUser: User) => {
    const checkIfExists = await UserModel.findOne({ email: authUser.email });
    if (checkIfExists) {
        logger.warn(`User already exists - ${authUser.email}`);
        return "USER_ALREADY_EXISTS";
    }

    authUser.password = await encrypt(authUser.password);
    const registerNewUser = await UserModel.create(authUser);
    return registerNewUser;
};

const loginUser = async (authUser: User) => {
    const user = await UserModel.findOne({ email: authUser.email });
    if (!user) {
        logger.warn(`User not found - ${authUser.email}`);
        return "USER_NOT_FOUND";
    }
    
    const isCorrect = await verify(authUser.password, user.password);
    if (!isCorrect) {
        logger.warn(`Password incorrect - ${authUser.email}`);
        return "PASSWORD_INCORRECT";
    }

    // correct user & password
    logger.info(`User logged on - ${authUser.email}`);

    const token = generateToken(user.id);
    const response = { id: user.id, email: user.email, name: user.name, description: user.description, token: token };
    return response;
};

export { registerNewUser, loginUser };
