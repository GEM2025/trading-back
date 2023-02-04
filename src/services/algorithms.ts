
import { LoggerService } from "./logger";
import { GlobalsServices } from "./globals";
import { Interfaces } from "../interfaces/app.interfaces";
import MarketModel from "../models/market";

export namespace AlgorithmsService {

    // -----------------------------------------------------------------------------------
    export class KeyValuePair<K, V> {
        constructor(public key: K, public value: V) { }
    }

    // -----------------------------------------------------------------------------------
    // here the duets or triplets are stored in a Set
    export const Markets = new Map<string, Array<KeyValuePair<string, Interfaces.Symbol>>>();


    // -----------------------------------------------------------------------------------
    export const InsertMarket = async (market: Array<KeyValuePair<string, Interfaces.Symbol>>) => {

        const key = market.map(i => `${i.key} ${i.value.exchange} ${i.value.name}`).sort().join(',');

        if (!Markets.has(key)) {

            Markets.set(key, market);

            // store it on MongoDB
            const updateData: Interfaces.Market = { name: key, items: market.map( i => `${i.key} ${i.value.exchange} ${i.value.name}`) };
            await MarketModel.findOneAndUpdate({ name: key }, updateData, { new: true, upsert: true });
        }
    }


    // Markets Initialization ------------------------------------------------------------
    // 1. L L L  
    // 2. L L S  
    // 3. L S L  
    // 4. L S S
    // 5. S L L
    // 6. S L S  
    // 7. S S L  
    // 8. S S S  
    export const InitializeMarkets = (first: Interfaces.Symbol) => {

        // 1. Lookup for pairs with base as the term of the first
        for (const second of GlobalsServices.BaseDict.get(first.pair.term) || []) {

            if (first.pair.base === second.pair.term) {

                // 1.1 Find long-long duets
                InsertMarket([{ key: "Long", value: first }, { key: "Long", value: second }]);

            }
            else {

                // 1.2 Find long-long-long (and implicitly short-short-short) triplets
                for (const third of GlobalsServices.SymbolsDict.get(second.pair.term + '/' + first.pair.base) || []) {

                    InsertMarket([{ key: "Long", value: first }, { key: "Long", value: second }, { key: "Long", value: third }]);
                    InsertMarket([{ key: "Short", value: first }, { key: "Short", value: second }, { key: "Short", value: third }]);
                }

                // 1.3 Find long-long-short (and implicitly short-short-long) triplets
                for (const third of GlobalsServices.SymbolsDict.get(first.pair.base + '/' + second.pair.term) || []) {

                    InsertMarket([{ key: "Long", value: first }, { key: "Long", value: second }, { key: "Short", value: third }]);
                    InsertMarket([{ key: "Short", value: first }, { key: "Short", value: second }, { key: "Long", value: third }]);
                }
            }
        }

        // 2. Lookup for pairs with term as also the term of the first
        for (const second of GlobalsServices.TermDict.get(first.pair.term) || []) {

            if (first.pair.base === second.pair.base) {

                // 2.1 Find long-short duets
                InsertMarket([{ key: "Long", value: first }, { key: "Short", value: second }]);

            }
            else {

                // 2.2 Find long-short-long (and implicitly short-long-short) triplets
                for (const third of GlobalsServices.SymbolsDict.get(second.pair.base + '/' + first.pair.base) || []) {

                    InsertMarket([{ key: "Long", value: first }, { key: "Short", value: second }, { key: "Long", value: third }]);
                    InsertMarket([{ key: "Short", value: first }, { key: "Long", value: second }, { key: "Short", value: third }]);
                }

                // 2.3 Find long-short-short (and implicitly short-long-long) triplets
                for (const third of GlobalsServices.SymbolsDict.get(first.pair.base + '/' + second.pair.base) || []) {

                    InsertMarket([{ key: "Long", value: first }, { key: "Short", value: second }, { key: "Short", value: third }]);
                    InsertMarket([{ key: "Short", value: first }, { key: "Long", value: second }, { key: "Long", value: third }]);
                }
            }
        }

    }


    // -----------------------------------------------------------------------------------
    export const InitializeAlgorithms = async () => {

        LoggerService.logger.info("Initializing Algorithms");
        LoggerService.logger.info(`Algorithms - ExchangesDict ${GlobalsServices.ExchangesSymbolsDict.size}`);
        LoggerService.logger.info(`Algorithms - SymbolsDict ${GlobalsServices.SymbolsExchangesDict.size}`);
        LoggerService.logger.info(`Algorithms - SymbolsDict ${GlobalsServices.SymbolsDict.size}`);
        LoggerService.logger.info(`Algorithms - BaseDict ${GlobalsServices.BaseDict.size}`);
        LoggerService.logger.info(`Algorithms - TermDict ${GlobalsServices.TermDict.size}`);
        LoggerService.logger.info(`Algorithms - SymbolsSet ${GlobalsServices.SymbolsSet.size}`);

        const exchanges = Array.from(GlobalsServices.ExchangesSymbolsDict.keys());

        // 1. opposite names within the same exchange - just notify out of curiosity
        for (const [exchange, symbols] of GlobalsServices.ExchangesSymbolsDict) {
            for (const [name, condor_symbol] of symbols) {
                const opposite_name = `${condor_symbol.pair.term}/${condor_symbol.pair.base}`;
                const opposite_symbol = symbols.get(opposite_name);
                if (opposite_symbol) {
                    LoggerService.logger.info(`Inverse name within exchange - ${exchange} - ${name} ${condor_symbol.bid.px}/${condor_symbol.ask.px} vs ${opposite_name}  ${opposite_symbol.bid.px}/${opposite_symbol.ask.px}`);
                }
            }
        }

        // 2. pass through each symbol to construct the market
        const size = GlobalsServices.SymbolsSet.size;
        let count = 0, prev = 0;
        for (const symbol of GlobalsServices.SymbolsSet) {

            let current = ++count / size;
            if (Math.round(100 * current) - prev > 10) {
                prev = Math.round(100 * current);
                LoggerService.logger.info(`Status ${prev}%`);
            }

            AlgorithmsService.InitializeMarkets(symbol);
        }

        // 3. provide a recount
        var sizes: Array<number> = [0, 0, 0, 0];
        for (let [key, value] of AlgorithmsService.Markets) {
            sizes[value.length]++;
        }
        LoggerService.logger.info(`Markets ${Markets.size} Duets ${sizes[2]} Triplets ${sizes[3]} Errors ${sizes[0] + sizes[1]}`);

        // 4. store markets
    }
}






