// interfaces/planos - modelos de pura propiedad
export namespace CondorInterface {

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
    
    // export class Node {
    //     symbol: CondorInterface.Symbol;
    //     children: Array<CondorInterface.Node>;

    //     constructor(symbol: CondorInterface.Symbol) {
    //         this.symbol = symbol;
    //         this.children = [];
    //     }
    // };
    // ------------------------------------------------------------------------------------

}
