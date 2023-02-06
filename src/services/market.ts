
import { LoggerService } from "./logger";
import { GlobalsServices } from "./globals";
import { Interfaces } from "../interfaces/app.interfaces";
import MarketModel from "../models/market";

export namespace MarketsService {

    /** http://localhost:3002/symbol */
    export const GetMarkets = async (info: any) => {

        const responseInsert = await MarketModel.find({}).skip(info.skip).limit(info.limit);
        info.total = await MarketModel.find({}).countDocuments();
        info.results = responseInsert.length;
        return responseInsert;
    };

    // -----------------------------------------------------------------------------------
    const InsertKeyMarket = (key: string, market: Array<GlobalsServices.KeyValuePair<string, Interfaces.Symbol>>): boolean => {

        // do not allow for duplicate markets
        if (GlobalsServices.Markets.has(key))
            return false; 

        // insert market indexes per symbol, through that we will quickly update arbitrage opportunities whenever a symbol price/volume changes
        for (const kvp of market) {
            var market_keys = GlobalsServices.MarketsIndexPerSymbol.get(kvp.value.name);
            if (!market_keys) {
                market_keys = new Set<string>;
                GlobalsServices.MarketsIndexPerSymbol.set(kvp.value.name, market_keys);
            }
            market_keys.add(key);
        }

        // store in memory the market
        GlobalsServices.Markets.set(key, market);
        return true;
    }


    // -----------------------------------------------------------------------------------
    export const InsertMarket = async (market: Array<GlobalsServices.KeyValuePair<string, Interfaces.Symbol>>) => {

        const key = market.map(i => `${i.key} ${i.value.exchange} ${i.value.name}`).sort().join(',');
        if (InsertKeyMarket(key, market)) {
            // store it on MongoDB
            const updateData: Interfaces.Market = { name: key, items: market.map(i => `${i.key} ${i.value.exchange} ${i.value.name}`) };
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
    const InitializeMarket = (first: Interfaces.Symbol) => {

        const SymbolsDict = GlobalsServices.SymbolsDict();

        // 1. Lookup for pairs with base as the term of the first
        for (const second of GlobalsServices.BaseSet(first.pair.term) || []) {

            if (first.pair.base === second.pair.term) {

                // 1.1 Find long-long duets
                InsertMarket([{ key: "Long", value: first }, { key: "Long", value: second }]);

            }
            else {

                // 1.2 Find long-long-long (and implicitly short-short-short) triplets
                for (const third of SymbolsDict.get(second.pair.term + '/' + first.pair.base) || []) {

                    InsertMarket([{ key: "Long", value: first }, { key: "Long", value: second }, { key: "Long", value: third }]);
                    InsertMarket([{ key: "Short", value: first }, { key: "Short", value: second }, { key: "Short", value: third }]);
                }

                // 1.3 Find long-long-short (and implicitly short-short-long) triplets
                for (const third of SymbolsDict.get(first.pair.base + '/' + second.pair.term) || []) {

                    InsertMarket([{ key: "Long", value: first }, { key: "Long", value: second }, { key: "Short", value: third }]);
                    InsertMarket([{ key: "Short", value: first }, { key: "Short", value: second }, { key: "Long", value: third }]);
                }
            }
        }

        // 2. Lookup for pairs with term as also the term of the first
        for (const second of GlobalsServices.TermSet(first.pair.term) || []) {

            if (first.pair.base === second.pair.base) {

                // 2.1 Find long-short duets
                InsertMarket([{ key: "Long", value: first }, { key: "Short", value: second }]);

            }
            else {

                // 2.2 Find long-short-long (and implicitly short-long-short) triplets
                for (const third of SymbolsDict.get(second.pair.base + '/' + first.pair.base) || []) {

                    InsertMarket([{ key: "Long", value: first }, { key: "Short", value: second }, { key: "Long", value: third }]);
                    InsertMarket([{ key: "Short", value: first }, { key: "Long", value: second }, { key: "Short", value: third }]);
                }

                // 2.3 Find long-short-short (and implicitly short-long-long) triplets
                for (const third of SymbolsDict.get(first.pair.base + '/' + second.pair.base) || []) {

                    InsertMarket([{ key: "Long", value: first }, { key: "Short", value: second }, { key: "Short", value: third }]);
                    InsertMarket([{ key: "Short", value: first }, { key: "Long", value: second }, { key: "Long", value: third }]);
                }
            }
        }

    }

    // -----------------------------------------------------------------------------------
    export const InitializeMarketsFromDB = async () => {

        LoggerService.logger.info(`Initializing Markets from DB`);

        // 1. initialize from DB
        let info = { seed: "", skip: 0, limit: 99999, total: undefined, results: undefined, version: "0.1" };
        const response = await MarketsService.GetMarkets(info);
        for (const dbmarket of response) {

            const market = new Array<GlobalsServices.KeyValuePair<string, Interfaces.Symbol>>();
            for (const sen of dbmarket.items) {
                const [side, exchange, name] = sen.split(' ');
                const exchange_id = GlobalsServices.ExchangesSymbolsDict.get(exchange);
                if (exchange_id) {
                    const symbol = exchange_id.get(name);
                    symbol && market.push({ key: side, value: symbol }) || LoggerService.logger.error(`Markets symbol not found ${exchange} ${name}`);
                }
                else {
                    LoggerService.logger.error(`Markets exchange not found ${exchange}`);
                }
            }
            market.length && InsertKeyMarket(dbmarket.name, market) || LoggerService.logger.error(`Markets empty error ${dbmarket.name}`);

        }
        LoggerService.logger.info(`Exchanges ExchangesDict ${GlobalsServices.ExchangesSymbolsDict.size}`);

    }


    // -----------------------------------------------------------------------------------
    export const InitializeMarkets = async () => {

        LoggerService.logger.info(`Initializing Markets`);

        const exchanges = Array.from(GlobalsServices.ExchangesSymbolsDict.keys());

        // 1. opposite names within the same exchange - just notify out of curiosity
        for (const [exchange, symbols] of GlobalsServices.ExchangesSymbolsDict) {
            for (const [name, condor_symbol] of symbols) {
                const opposite_name = `${condor_symbol.pair.term}/${condor_symbol.pair.base}`;
                const opposite_symbol = symbols.get(opposite_name);
                opposite_symbol && LoggerService.logger.info(`Inverse name within exchange - ${exchange} - ${name} ${condor_symbol.bid.px}/${condor_symbol.ask.px} vs ${opposite_name}  ${opposite_symbol.bid.px}/${opposite_symbol.ask.px}`);
            }
        }

        // 2. pass through each symbol to construct the market
        const SymbolsSet = GlobalsServices.SymbolsSet();
        const size = SymbolsSet.size;
        let count = 0, prev = 0;
        for (const symbol of SymbolsSet) {

            let current = ++count / size;
            if (Math.round(100 * current) - prev > 24) {
                prev = Math.round(100 * current);
                LoggerService.logger.info(`InitializeMarkets Status ${prev}%`);
            }

            InitializeMarket(symbol);
        }

    }
}






