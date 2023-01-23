import { Auth } from "./auth.interface";

// interfaces/planos - modelos de pura propiedad

export namespace UserInterface {

    export interface User extends Auth {
        name: string;
        description: string;
        token: string;
    }

}