// interfaces/planos - modelos de pura propiedad
export namespace Condor {

    export interface Exchange {
        name: string;
        description: string;
        key: string;
        secret: string;
        extra: string;
    }

    export interface Symbol {
        name: string;
        exchange: string;
        pair: [string, string]; // base, term
        bid: [number, number]; // px, qty
        ask: [number, number]; // px, qty
    };


}