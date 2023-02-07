// interfaces/planos - modelos de pura propiedad
export namespace Interfaces {

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
        pair: {base: string, term: string}; // base, term
        bid: {px: number, qty: number}; // px, qty
        ask: {px: number, qty: number}; // px, qty
    } 

    export interface Market {
        hashkey: string; // this way we can avoid duplicates
        items: Array<string>;
    }
}
