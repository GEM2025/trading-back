import { Interfaces } from "../interfaces/app.interfaces";

export namespace GlobalsServices {

    // ------------------------------------------------------------------------------------
    // exchangeid vs symbolname vs app.symbol
    export const ExchangesSymbolsDict = new Map<string, Map<string, Interfaces.Symbol>>();

    // ------------------------------------------------------------------------------------
    // symbolname vs exchangeid vs app.symbol
    export const SymbolsExchangesDict = new Map<string, Map<string, Interfaces.Symbol>>();

    // ------------------------------------------------------------------------------------
    // symbolname vs app.symbol
    export const SymbolsDict = new Map<string,Array<Interfaces.Symbol>>();
    
    // ------------------------------------------------------------------------------------
    // base vs app.symbol
    export const BaseDict = new Map<string,Array<Interfaces.Symbol>>();

    // ------------------------------------------------------------------------------------
    // term vs app.symbol
    export const TermDict = new Map<string,Array<Interfaces.Symbol>>();

    // ------------------------------------------------------------------------------------
    // app.symbol
    export const SymbolsSet = new Set<Interfaces.Symbol>();


    // ------------------------------------------------------------------------------------
    export const InsertSymbol = (symbol: Interfaces.Symbol) => {

        // exchange vs symbols dict
        let symbols_exchange = GlobalsServices.ExchangesSymbolsDict.get(symbol.exchange);
        if (!symbols_exchange) {
            symbols_exchange = new Map<string, Interfaces.Symbol>;
            GlobalsServices.ExchangesSymbolsDict.set(symbol.exchange, symbols_exchange);
        }
        symbols_exchange.set(symbol.name, symbol);

        // symbol vs exchanges dict
        let exchanges_symbol = GlobalsServices.SymbolsExchangesDict.get(symbol.name);
        if (!exchanges_symbol) {
            exchanges_symbol = new Map<string, Interfaces.Symbol>;
            GlobalsServices.SymbolsExchangesDict.set(symbol.name, exchanges_symbol);
        }
        exchanges_symbol.set(symbol.name, symbol);

        // symbolname vs symbol dict
        let symbols = GlobalsServices.SymbolsDict.get(symbol.name);
        if (!symbols) {
            symbols = new Array<Interfaces.Symbol>;
            GlobalsServices.SymbolsDict.set(symbol.name, symbols);
        }
        symbols.push(symbol);

        // base vs symbol dict
        let bases = GlobalsServices.BaseDict.get(symbol.pair.base);
        if (!bases) {
            bases = new Array<Interfaces.Symbol>;
            GlobalsServices.BaseDict.set(symbol.pair.base, symbols);
        }
        bases.push(symbol);

        // term vs symbol dict
        let terms = GlobalsServices.TermDict.get(symbol.pair.term);
        if (!terms) {
            terms = new Array<Interfaces.Symbol>;
            GlobalsServices.TermDict.set(symbol.pair.term, terms);
        }
        terms.push(symbol);

        // symbol set
        GlobalsServices.SymbolsSet.add(symbol);

    }
    



}