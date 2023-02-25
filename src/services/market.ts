
import { LoggerService } from "./logger";
import { GlobalsServices } from "./globals";
import { Interfaces } from "../interfaces/app.interfaces";
import MarketModel from "../models/market";
import { createHash } from "node:crypto";

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
    const DeleteKeyMarket = (key: string): boolean => {

        return GlobalsServices.Markets.has(key) && GlobalsServices.MarketsIndexPerSymbol.delete(key);
    }

    export const SymbolBases: Array<string> = ["USD"];

    // -----------------------------------------------------------------------------------
    export const CycleMarketForBaseAccomodation = (market: Array<GlobalsServices.KeyValuePair<string, Interfaces.Symbol>>): boolean => {

        // if the first term is our base, we can move forwared, otherwise, cycle the array until it is - that way, the profit will always be measured in a valid symbol base
        let success = false;
        for (const base of SymbolBases) {

            // in order to avoid an infinite loop, cycle the market up to its lenght times
            for (let i = 0; i < market.length && !success; i++) {

                if (market.at(0)?.value.pair.term === base && market.at(0)?.key === "Long") {
                    success = true;
                }
                else {
                    const first = market.shift();
                    first && market.push(first);
                }

            }

            if (!success) {
                for (let i = 0; i < market.length && !success; i++) {

                    if (market.at(0)?.value.pair.base === base && market.at(0)?.key === "Short") {
                        success = true;
                    }
                    else {
                        const first = market.shift();
                        first && market.push(first);
                    }

                }


            }

            if (success) break;
        }

        return success;

    }

    // -----------------------------------------------------------------------------------
    export const InsertMarket = async (market: Array<GlobalsServices.KeyValuePair<string, Interfaces.Symbol>>) => {

        // we need to create a key that considers the sorted names (in order to vaoid duplicates)
        const textkey = market.map(i => `${i.key} ${i.value.exchange} ${i.value.name}`).sort().join(',');

        // but also its prefer to hash it in order not to fall victim of the naming, and better go to the array in order
        const hashkey = createHash("md5").update(textkey).digest("hex");

        // we need to be able to filter out names without certain symbols as a base (for example, USD, EUR, MXN which are FIAT currencies we may be able to deposit to trade)
        const currencies = new Set<string>();
        market.map(i => i.value.pair.base).concat(market.map(i => i.value.pair.term)).forEach(i => currencies.add(i));

        // for triplets, we need a base currency to trade in
        if (!SymbolBases.length || SymbolBases.some(i => currencies.has(i))) {

            // we need to sort in a way that the first name has the base currency of the selection,     
            if (CycleMarketForBaseAccomodation(market)) {

                LoggerService.logger.debug(`Market - ${GlobalsServices.TextualizeMarket(market)}`);
                
                // store it on MongoDB
                if (InsertKeyMarket(hashkey, market)) {
                    const updateData: Interfaces.Market = { hashkey: hashkey, items: market.map(i => `${i.key} ${i.value.exchange} ${i.value.name}`) };
                    await MarketModel.findOneAndUpdate({ hashkey: hashkey }, updateData, { new: true, upsert: true });
                }
            }
            else {
                LoggerService.logger.info(`Ignoring - ${GlobalsServices.TextualizeMarket(market)}`);
            }
        }
        else {
            LoggerService.logger.debug(`No base currency in this market - ${GlobalsServices.TextualizeMarket(market)}`);
            DeleteKeyMarket(hashkey);
            await MarketModel.findOneAndDelete({ hashkey: hashkey });
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
            market.length && InsertKeyMarket(dbmarket.hashkey, market) || LoggerService.logger.error(`Markets empty error ${dbmarket.hashkey}`);

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






