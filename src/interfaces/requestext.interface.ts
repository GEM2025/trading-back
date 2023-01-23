import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export namespace RequestExtInterface {
    export interface RequestExt extends Request {
        user?: JwtPayload | { id: string };
    }

}