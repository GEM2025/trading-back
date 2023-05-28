
export interface ISymbol {
    name: string;
    exchange: string;
    pair: { base: string, term: string }; // base, term
    bid: { px: number, qty: number }; // px, qty
    ask: { px: number, qty: number }; // px, qty
    enabled: boolean;
}

