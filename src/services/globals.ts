import { Interfaces } from "../interfaces/app.interfaces";
import { ExchangeApplicationModel } from "../models/exchange_application";
import { LoggerService } from "./logger";
import { SymbolService } from "./symbol";

export namespace GlobalsServices {

    // -----------------------------------------------------------------------------------
    export class KeyValuePair<K, V> {
        constructor(public key: K, public value: V) { }
    }

    // -----------------------------------------------------------------------------------
    // here the duets or triplets are stored in a Set
    // markey_key vs array of side & symbols
    export const Markets = new Map<string, Array<KeyValuePair<string, Interfaces.Symbol>>>();

    // -----------------------------------------------------------------------------------
    // symbol_name name vs array of market_keys
    export const MarketsIndexPerSymbol = new Map<string, Set<string>>();

    // -----------------------------------------------------------------------------------
    // here the duets or triplets are stored in a Set
    // markey_key vs theoretical raw trade opportunity (positive or negative)
    export const opportunities = new Map<string, number>();

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
        CalculateSymbolOpportunities(symbol);

    }

    // ------------------------------------------------------------------------------------
    export const CalculateSymbolOpportunities = (symbol: Interfaces.Symbol) => {
        const MarketsPerSymbol = MarketsIndexPerSymbol.get(symbol.name)
        if (MarketsPerSymbol) {
            for (const market_key of MarketsPerSymbol) {
                const market = Markets.get(market_key);
                if (market) {
                    // lets assume the spread is based on buying/selling one unit of the first leg
                    const position: Record<string, number> = {};

                    LoggerService.logger.info(`${market_key}`);

                    var text: string = "";

                    for (const kvp of market) {

                        if (kvp.key === "Long") {

                            var existing_base = position[kvp.value.pair.base];
                            if (existing_base < 0) {

                                // if you have something, get rid of it
                                position[kvp.value.pair.base] = 0;

                                const existing_term = position[kvp.value.pair.term];
                                if (existing_term) {
                                    position[kvp.value.pair.term] += existing_base * kvp.value.ask.px;
                                }
                                else {
                                    position[kvp.value.pair.term] = existing_base * kvp.value.ask.px;
                                }

                            }
                            else if (!existing_base) {

                                // if you don't have anything, you're buying the unit                                
                                position[kvp.value.pair.base] = 1;

                                // but maybe you have some position of the base, hedge it
                                const existing_term = position[kvp.value.pair.term];
                                if (existing_term) {
                                    position[kvp.value.pair.term] -= 1 * kvp.value.ask.px;
                                }
                                else {
                                    position[kvp.value.pair.term] = -1 * kvp.value.ask.px;
                                }

                            }
                            else {
                                LoggerService.logger.error(`Pre-existing long position of ${kvp.value.pair.base} - ${market_key}`);
                            }

                            text += `${kvp.key} ${kvp.value.exchange} ${kvp.value.name} at ask ${kvp.value.ask.px} `;


                        } else if (kvp.key === "Short") {

                            // LoggerService.logger.info(`Sell ${kvp.value.exchange} ${kvp.value.name} at buy ${kvp.value.bid}`);

                            var existing_base = position[kvp.value.pair.base];
                            if (existing_base > 0) {

                                // if you have something, get rid of it
                                position[kvp.value.pair.base] = 0;

                                const existing_term = position[kvp.value.pair.term];
                                if (existing_term) {
                                    position[kvp.value.pair.term] += existing_base * kvp.value.bid.px;
                                }
                                else {
                                    position[kvp.value.pair.term] = existing_base * kvp.value.bid.px;
                                }
                            }
                            else if (!existing_base) {

                                position[kvp.value.pair.base] = -1;

                                const existing_term = position[kvp.value.pair.term];
                                if (existing_term) {
                                    position[kvp.value.pair.term] += 1 * kvp.value.bid.px;
                                }
                                else {
                                    position[kvp.value.pair.term] = +1 * kvp.value.bid.px;
                                }
                            }
                            else {
                                LoggerService.logger.error(`Pre-existing short position of ${kvp.value.pair.base} - ${market_key}`);
                            }


                            text += `${kvp.key} ${kvp.value.exchange} ${kvp.value.name} at bid ${kvp.value.bid.px} `;

                        }
                    }

                    for (const [currency, profit] of Object.entries(position)) {
                        if (profit) {
                            LoggerService.logger.info(`${text} profits ${profit} ${currency}`);
                            opportunities.set(market_key, profit);
                        }
                    }

                }
                else {
                    LoggerService.logger.info(`Market exists on index but not on main container - ${market_key}`);
                }
            }
        }
    }

} // namespace GlobalsServices