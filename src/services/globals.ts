import { ICurrency } from "../interfaces/currency.interfaces";
import { IExchange } from "../interfaces/exchange.interfaces";
import { ISymbol } from "../interfaces/symbol.interfaces";
import { ExchangeApplicationModel } from "../models/exchange_application";
import { CurrencyService } from "./currency";

export namespace GlobalsServices {

    // -----------------------------------------------------------------------------------
    export class KeyValuePair<K, V> {
        constructor(public key: K, public value: V) { }
    }

    // -----------------------------------------------------------------------------------
    // currency name vs enabled
    export const CurrenciesDict = new Map<string, ICurrency>();

    // -----------------------------------------------------------------------------------
    // here the duets or triplets are stored in a Set
    // markey_key vs array of side & symbols
    export const Markets = new Map<string, Array<KeyValuePair<string, ISymbol>>>();

    // -----------------------------------------------------------------------------------
    export const TextualizeMarket = (array: Array<KeyValuePair<string, ISymbol>>): string => {
        return array.map((sen: KeyValuePair<string, ISymbol>) => `${sen.key} ${sen.value.exchange} ${sen.value.name}`).join(',');
    }

    // -----------------------------------------------------------------------------------
    export const TextualizeDbMarket = (array: Array<string>): string => {
        return array.map((sen) => 
        {
            const [side, exchange_name, symbol_name] = sen.split(' ');
            return `${side} ${exchange_name} ${symbol_name}`;
        }).join(',');
    }

    // -----------------------------------------------------------------------------------
    // symbol_name name vs array of market_keys
    export const MarketsIndexPerSymbol = new Map<string, Set<string>>();

    // ------------------------------------------------------------------------------------
    // exchangeId vs ExchangeApplication (main object)
    export const ExchangeApplicationDict = new Map<string, ExchangeApplicationModel.ExchangeApplication>();

    // ------------------------------------------------------------------------------------
    // exchangeid vs symbolname vs Symbol
    export const ExchangesSymbolsDict = new Map<string, Map<string, ISymbol>>();

    // ------------------------------------------------------------------------------------
    // exchangeid vs Exchange
    export const ExchangesDict = new Map<string, IExchange>();

    // ------------------------------------------------------------------------------------
    // symbolname vs Symbols (can be same name in different exchanges)
    export const SymbolsDict = (): Map<string, Set<ISymbol>> => {
        const result = new Map<string, Set<ISymbol>>();
        for (const [, symbols] of ExchangesSymbolsDict) {
            for (const [symbol_name, symbol] of symbols) {
                var r = result.get(symbol_name) || new Set<ISymbol>();
                result.set(symbol_name, r);
                r.add(symbol);
            }
        }
        return result;
    }

    // ------------------------------------------------------------------------------------
    // base vs Symbol
    export const BaseSet = (base: string): Set<ISymbol> => {
        const result = new Set<ISymbol>();
        for (const [, symbols] of ExchangesSymbolsDict) {
            for (const [, symbol] of symbols) {
                symbol.pair.base === base && result.add(symbol);
            }
        }
        return result;
    }

    // ------------------------------------------------------------------------------------
    // term vs app.symbol     
    export const TermSet = (term: string): Set<ISymbol> => {
        const result = new Set<ISymbol>();
        for (const [, symbols] of ExchangesSymbolsDict) {
            for (const [, symbol] of symbols) {
                symbol.pair.term === term && result.add(symbol);
            }
        }
        return result;
    }

    // ------------------------------------------------------------------------------------    
    // individual symbol, independent from exchange
    export const SymbolsSet = (): Set<ISymbol> => {
        const result = new Set<ISymbol>();
        for (const [exchange_id, symbols] of ExchangesSymbolsDict) {
            for (const [symbol_name, symbol] of symbols) {
                result.add(symbol);
            }
        }
        return result;
    }

    // ------------------------------------------------------------------------------------
    export const UpsertCurrency = (currency: ICurrency) => {
        // Currency        
        GlobalsServices.CurrenciesDict.set(currency.name, currency);
    }


    // ------------------------------------------------------------------------------------
    export const UpsertSymbol = async (symbol: ISymbol) => {

        // exchange vs symbols dict

        let symbols_dict = GlobalsServices.ExchangesSymbolsDict.get(symbol.exchange);
        if (!symbols_dict) {
            symbols_dict = new Map<string, ISymbol>;
            GlobalsServices.ExchangesSymbolsDict.set(symbol.exchange, symbols_dict);
        }
        symbols_dict.set(symbol.name, symbol);

        await CurrencyService.UpsertCurrencyFromSymbol(symbol);        
    }

    // ------------------------------------------------------------------------------------
    export const UpsertExchange = (exchange: IExchange) => {

        // exchange vs exchanges dict        
        GlobalsServices.ExchangesDict.set(exchange.name, exchange);
    }

    // ------------------------------------------------------------------------------------    
    export const ClearSymbols = () => {

        for (const [, symbols] of GlobalsServices.ExchangesSymbolsDict)
            symbols.clear();
        GlobalsServices.ExchangesSymbolsDict.clear();

        for (const [, arr] of GlobalsServices.Markets)
            arr.length = 0;
        GlobalsServices.Markets.clear();

    }

    // ------------------------------------------------------------------------------------
    export const InsertTestSymbol = (base: string, term: string, mid: number, spread: number) => {

        const s: ISymbol = {
            name: base + '/' + term,
            exchange: "TEST_EXCHANGE",
            pair: { base: base, term: term }, // base, term
            bid: { px: mid - spread, qty: 1 }, // px, qty
            ask: { px: mid + spread, qty: 1 }, // px, qty
            enabled: true,
        }

        UpsertSymbol(s);
    }

} // namespace GlobalsServices
