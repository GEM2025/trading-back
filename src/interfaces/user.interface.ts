import { IAuth } from "./auth.interface";

// interfaces/planos - modelos de pura propiedad

export interface IUser extends IAuth {
    name: string;
    role: string;
    token: string;
    enabled: boolean;
}

