import { Auth } from "./auth.interface";

// interfaces/planos - modelos de pura propiedad

export namespace UserInterface {

    export interface User extends Auth {
        name: string;
        role: string;
        token: string;
        enabled: boolean;
    }

}