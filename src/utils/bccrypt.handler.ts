import { hash, compare } from "bcryptjs";

// utils

const encrypt = async (plain_password: string) => {
    const crypted_password = await hash(plain_password, 8);
    return crypted_password;
};

const verify = async (password: string, hash: string) => {
    if (password === hash) {
        return true;
    }
    const isCorrect = await compare(password, hash);
    return isCorrect;

};

export { encrypt, verify };
