import { CondorInterface } from "../interfaces/condor.interfaces";
import { ExchangeApplicationModel } from "../models/exchange_application";

export namespace GlobalsServices {

    // ------------------------------------------------------------------------------------
    // exchangeid vs symbolname vs condor.symbol
    export const ExchangesSymbolsDict = new Map<string, Map<string, CondorInterface.Symbol>>();

    // ------------------------------------------------------------------------------------
    // symbolname vs exchangeid vs condor.symbol
    export const SymbolsExchangesDict = new Map<string, Map<string, CondorInterface.Symbol>>();

    // ------------------------------------------------------------------------------------
    // symbolname vs condor.symbol
    export const SymbolsDict = new Map<string,Array<CondorInterface.Symbol>>();
    
    // ------------------------------------------------------------------------------------
    // base vs condor.symbol
    export const BaseDict = new Map<string,Array<CondorInterface.Symbol>>();

    // ------------------------------------------------------------------------------------
    // term vs condor.symbol
    export const TermDict = new Map<string,Array<CondorInterface.Symbol>>();

    // ------------------------------------------------------------------------------------
    // condor.symbol
    export const SymbolsSet = new Set<CondorInterface.Symbol>();


    // ------------------------------------------------------------------------------------
    export const InsertSymbol = (symbol: CondorInterface.Symbol) => {

        // exchange vs symbols dict
        let symbols_exchange = GlobalsServices.ExchangesSymbolsDict.get(symbol.exchange);
        if (!symbols_exchange) {
            symbols_exchange = new Map<string, CondorInterface.Symbol>;
            GlobalsServices.ExchangesSymbolsDict.set(symbol.exchange, symbols_exchange);
        }
        symbols_exchange.set(symbol.name, symbol);

        // symbol vs exchanges dict
        let exchanges_symbol = GlobalsServices.SymbolsExchangesDict.get(symbol.name);
        if (!exchanges_symbol) {
            exchanges_symbol = new Map<string, CondorInterface.Symbol>;
            GlobalsServices.SymbolsExchangesDict.set(symbol.name, exchanges_symbol);
        }
        exchanges_symbol.set(symbol.name, symbol);

        // symbolname vs symbol dict
        let symbols = GlobalsServices.SymbolsDict.get(symbol.name);
        if (!symbols) {
            symbols = new Array<CondorInterface.Symbol>;
            GlobalsServices.SymbolsDict.set(symbol.name, symbols);
        }
        symbols.push(symbol);

        // base vs symbol dict
        let bases = GlobalsServices.BaseDict.get(symbol.pair[0]);
        if (!bases) {
            bases = new Array<CondorInterface.Symbol>;
            GlobalsServices.BaseDict.set(symbol.pair[0], symbols);
        }
        bases.push(symbol);

        // term vs symbol dict
        let terms = GlobalsServices.TermDict.get(symbol.pair[1]);
        if (!terms) {
            terms = new Array<CondorInterface.Symbol>;
            GlobalsServices.TermDict.set(symbol.pair[1], terms);
        }
        terms.push(symbol);

        // symbol set
        GlobalsServices.SymbolsSet.add(symbol);

    }
    



}