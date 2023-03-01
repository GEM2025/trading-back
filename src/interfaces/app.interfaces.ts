// interfaces/planos - modelos de pura propiedad
export namespace Interfaces {

    export interface Exchange {
        name: string;
        description: string;
        markets: Array<string>;
        key: string;
        secret: string;
        extra: string;
        enabled: boolean;
    }

    export interface Symbol {
        name: string;
        exchange: string;
        pair: {base: string, term: string}; // base, term
        bid: {px: number, qty: number}; // px, qty
        ask: {px: number, qty: number}; // px, qty
        enabled: boolean;
    } 

    export interface Currency {
        name: string;        
        enabled: boolean;
    } 

    export interface Market {
        hashkey: string; // this way we can avoid duplicates
        items: Array<string>;
        enabled: boolean;
    }
}
