import { sign, verify } from "jsonwebtoken";

// utils

const JWT_SECRET = process.env.JWT_SECRET || "arbitrary.secret.101";

const generateToken = (id: string) => {
    const jwt = sign({ id }, JWT_SECRET, { expiresIn: "1 day", }); // consistent with Anguyar cookie
    return jwt ;
};

const verifyToken = (token: string) => {
    const isOk = verify(token, JWT_SECRET);
    return isOk;
};

export { generateToken, verifyToken };
