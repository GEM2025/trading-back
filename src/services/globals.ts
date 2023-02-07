import { Interfaces } from "../interfaces/app.interfaces";
import { ExchangeApplicationModel } from "../models/exchange_application";
import { OpportunitiesServices } from "./opportunities";

export namespace GlobalsServices {

    // -----------------------------------------------------------------------------------
    export class KeyValuePair<K, V> {
        constructor(public key: K, public value: V) { }
    }

    // -----------------------------------------------------------------------------------
    // here the duets or triplets are stored in a Set
    // markey_key vs array of side & symbols
    export const Markets = new Map<string, Array<KeyValuePair<string, Interfaces.Symbol>>>();

    export const TextualizeMarket= (array: Array<KeyValuePair<string, Interfaces.Symbol>>): string => {
        var result: string = "";
        for (const sen of array) {
            result += `${sen.key} ${sen.value.exchange} ${sen.value.name},`;
        }
        return result.slice(0, -1); // chunk
    }

    // -----------------------------------------------------------------------------------
    // symbol_name name vs array of market_keys
    export const MarketsIndexPerSymbol = new Map<string, Set<string>>();

    // ------------------------------------------------------------------------------------
    // exchangeId vs ExchangeApplication (main object)
    export const ExchangeApplicationDict = new Map<string, ExchangeApplicationModel.ExchangeApplication>();

    // ------------------------------------------------------------------------------------
    // exchangeid vs symbolname vs app.symbol
    export const ExchangesSymbolsDict = new Map<string, Map<string, Interfaces.Symbol>>();

    // ------------------------------------------------------------------------------------
    // symbolname vs exchangeid vs app.symbol
    export const SymbolsExchangesDict = new Map<string, Map<string, Interfaces.Symbol>>();

    // // ------------------------------------------------------------------------------------
    // // symbolname vs app.symbol 
    export const SymbolsDict = (): Map<string, Set<Interfaces.Symbol>> => {
        const result = new Map<string, Set<Interfaces.Symbol>>();
        for (const [symbol_name, exchange_map] of SymbolsExchangesDict) {
            var r = result.get(symbol_name) || new Set<Interfaces.Symbol>();
            result.set(symbol_name, r);
            for (const [, symbol] of exchange_map)
                r.add(symbol);
        }
        return result;
    }

    // // ------------------------------------------------------------------------------------
    // // base vs app.symbol 
    export const BaseSet = (base: string): Set<Interfaces.Symbol> => {
        const result = new Set<Interfaces.Symbol>();
        for (const [, exchange_map] of SymbolsExchangesDict) {
            for (const [, symbol] of exchange_map) {
                symbol.pair.base === base && result.add(symbol);
            }
        }
        return result;
    }

    // // ------------------------------------------------------------------------------------
    // // term vs app.symbol 
    // export const TermDict = new Map<string, Set<Interfaces.Symbol>>();
    export const TermSet = (term: string): Set<Interfaces.Symbol> => {
        const result = new Set<Interfaces.Symbol>();
        for (const [, exchange_map] of SymbolsExchangesDict) {
            for (const [, symbol] of exchange_map) {
                symbol.pair.term === term && result.add(symbol);
            }
        }
        return result;
    }

    // // ------------------------------------------------------------------------------------
    // // app.symbol 
    // export const SymbolsSet = new Set<Interfaces.Symbol>();
    export const SymbolsSet = (): Set<Interfaces.Symbol> => {
        const result = new Set<Interfaces.Symbol>();
        for (const [symbol_name, exchange_map] of SymbolsExchangesDict) {
            for (const [exchange_id, symbol] of exchange_map)
                result.add(symbol);
        }
        return result;
    }


    // ------------------------------------------------------------------------------------
    export const UpsertSymbol = (symbol: Interfaces.Symbol) => {

        // exchange vs symbols dict
        {
            let symbols_exchange = GlobalsServices.ExchangesSymbolsDict.get(symbol.exchange);
            if (!symbols_exchange) {
                symbols_exchange = new Map<string, Interfaces.Symbol>;
                GlobalsServices.ExchangesSymbolsDict.set(symbol.exchange, symbols_exchange);
            }
            symbols_exchange.set(symbol.name, symbol);
        }

        // symbol vs exchanges dict
        {
            let exchanges_symbol = GlobalsServices.SymbolsExchangesDict.get(symbol.name);
            if (!exchanges_symbol) {
                exchanges_symbol = new Map<string, Interfaces.Symbol>;
                GlobalsServices.SymbolsExchangesDict.set(symbol.name, exchanges_symbol);
            }
            exchanges_symbol.set(symbol.name, symbol);
        }

        // if we already have markets indexes, try to find the arbitrage spread
        OpportunitiesServices.Calculate(symbol);

    }

} // namespace GlobalsServices