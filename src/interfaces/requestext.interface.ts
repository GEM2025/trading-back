import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

// interfaces/planos - modelos de pura propiedad

export interface RequestExt extends Request {
    user?: JwtPayload | { id: string };
}