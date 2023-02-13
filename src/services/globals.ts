import { Interfaces } from "../interfaces/app.interfaces";
import { ExchangeApplicationModel } from "../models/exchange_application";

export namespace GlobalsServices {

    // -----------------------------------------------------------------------------------
    export class KeyValuePair<K, V> {
        constructor(public key: K, public value: V) { }
    }

    // -----------------------------------------------------------------------------------
    // here the duets or triplets are stored in a Set
    // markey_key vs array of side & symbols
    export const Markets = new Map<string, Array<KeyValuePair<string, Interfaces.Symbol>>>();

    export const TextualizeMarket = (array: Array<KeyValuePair<string, Interfaces.Symbol>>): string => {
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
    // exchangeid vs symbolname vs Symbol
    export const ExchangesSymbolsDict = new Map<string, Map<string, Interfaces.Symbol>>();
 
    // // ------------------------------------------------------------------------------------
    // // symbolname vs Symbol
    export const SymbolsDict = (): Map<string, Set<Interfaces.Symbol>> => {
        const result = new Map<string, Set<Interfaces.Symbol>>();
        for (const [, symbols] of ExchangesSymbolsDict) {
            for (const [symbol_name, symbol] of symbols) {
                var r = result.get(symbol_name) || new Set<Interfaces.Symbol>();
                result.set(symbol_name, r);
                r.add(symbol);
            }
        }
        return result;
    }

    // // ------------------------------------------------------------------------------------
    // // base vs Symbol
    export const BaseSet = (base: string): Set<Interfaces.Symbol> => {
        const result = new Set<Interfaces.Symbol>();
        for (const [, symbols] of ExchangesSymbolsDict) {
            for (const [, symbol] of symbols) {
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
        for (const [, symbols] of ExchangesSymbolsDict) {
            for (const [, symbol] of symbols) {
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
        for (const [exchange_id, symbols] of ExchangesSymbolsDict) {
            for (const [symbol_name, symbol] of symbols) {
                result.add(symbol);
            }
        }
        return result;
    }


    // ------------------------------------------------------------------------------------
    export const UpsertSymbol = (symbol: Interfaces.Symbol) => {

        // exchange vs symbols dict
        let symbols_exchange = GlobalsServices.ExchangesSymbolsDict.get(symbol.exchange);
        if (!symbols_exchange) {
            symbols_exchange = new Map<string, Interfaces.Symbol>;
            GlobalsServices.ExchangesSymbolsDict.set(symbol.exchange, symbols_exchange);
        }
        symbols_exchange.set(symbol.name, symbol);
        
    }

    export const ClearSymbols = () => {
        GlobalsServices.ExchangesSymbolsDict.clear();
    }

    // ------------------------------------------------------------------------------------
    export const InsertTestSymbol = (base: string, term: string, mid: number, spread: number) => {

        UpsertSymbol({
            name: base + '/' + term,
            exchange: "TEST_EXCHANGE",
            pair: { base: base, term: term }, // base, term
            bid: { px: mid - spread, qty: 1 }, // px, qty
            ask: { px: mid + spread, qty: 1 }, // px, qty
        });
    }

} // namespace GlobalsServices