// interfaces/planos - modelos de pura propiedad
export namespace Condor {
    export interface Exchange {
        name: string;
        description: string;
        key: string;
        secret: string;
        extra: string;
    }
}