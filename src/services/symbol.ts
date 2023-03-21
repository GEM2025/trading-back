import ccxt from 'ccxt';
import { Interfaces } from "../interfaces/app.interfaces";
import { ExchangeApplicationModel } from "../models/exchange_application";
import SymbolModel from "../models/symbol";
import { LoggerService } from "./logger";
import { GlobalsServices } from './globals';
import { ExchangeService } from './exchange';

export namespace SymbolService {

    // ---------------------------------
    export const UpsertSymbol = async (symbol: Interfaces.Symbol) => {

        // insert or update
        try {
            const { name, exchange } = symbol;
            const updateData = symbol;
            const responseInsert = await SymbolModel.findOneAndUpdate({ name: name, exchange: exchange }, updateData, { new: true, upsert: true });
            return responseInsert;
        } catch (error) {
            LoggerService.logger.error(`UpsertSymbol ${symbol.name} ${error}`);
        }
        return null;
    };

    // ---------------------------------
    /** http://localhost:3002/symbol */
    export const GetSymbols = async (info: any) => {

        const responseInsert = await SymbolModel.find({}).skip(info.skip).limit(info.limit);
        info.total = await SymbolModel.find({}).countDocuments();
        info.results = responseInsert.length;
        return responseInsert;
    };

    // ---------------------------------
    /** http://localhost:3002/symbol/63aa37ebd94c08c748fdd748 */
    export const GetSymbol = async (id: string) => {
        const responseInsert = await SymbolModel.findOne({ _id: id });
        return responseInsert;
    };


    // ---------------------------------
    export const UpdateSymbol = async (id: string, symbol: Interfaces.Symbol) => {
        const responseInsert = await SymbolModel.findOneAndUpdate({ _id: id }, symbol, { new: true, });
        return responseInsert;
    };

    // ---------------------------------
    export const DeleteSymbolById = async (id: string) => {
        const responseInsert = await SymbolModel.findOneAndDelete({ _id: id });
        return responseInsert;
    };

    // ---------------------------------
    export const DeleteSymbolByExchangeAndName = async (exchange: string, name: string) => {
        const responseInsert = await SymbolModel.findOneAndDelete({ name: name, exchange: exchange });
        return responseInsert;
    };

    // ---------------------------------
    const InsertOrderBook = (exchange: ccxt.Exchange, symbol: string, book: ccxt.OrderBook) => {

        const [base, term] = symbol.split('/');
        const [bid_px, bid_qty] = book.bids.length > 0 && book.bids[0].length > 0 ? [book.bids[0][0], book.bids[0][1]] : [0, 0];
        const [ask_px, ask_qty] = book.asks.length > 0 && book.asks[0].length > 0 ? [book.asks[0][0], book.asks[0][1]] : [0, 0];

        const upsertSymbol: Interfaces.Symbol = {
            name: symbol,
            exchange: exchange.name,
            pair: { base, term },
            bid: { px: bid_px, qty: bid_qty },
            ask: { px: ask_px, qty: ask_qty },
            enabled: false,
        };

        // store it on MongoDB
        SymbolService.UpsertSymbol(upsertSymbol);

        // store it on global memory containers
        GlobalsServices.UpsertSymbol(upsertSymbol);

    }


    // ------------------------------------------------------------------------------------
    const fetchOrderBook = async (app: ExchangeApplicationModel.ExchangeApplication) => {

        var openRequests = Math.min(app.exchange.rateLimit, app.PendingRequestsQueue.length());
        if (openRequests) {

            for (var i = 0; i < openRequests; i++) {
                const market = app.PendingRequestsQueue.dequeue();
                if (market) {
                    const limit = app.exchange.name === "KuCoin" ? 20 : 1; // only get the top of book but kucoin that seems to provide only 20 or 100
                    const orderBook = app.exchange.fetchOrderBook(market.symbol, limit)
                        .then((book: ccxt.OrderBook) => InsertOrderBook(app.exchange, market.symbol, book))
                        .catch(reason =>
                            LoggerService.logger.warn(`fetchOrderBook - Exchange ${app.exchange.name} symbol ${market.symbol} reason ${reason}`)
                        )
                        .finally(() => --openRequests || fetchOrderBook(app)); // request another tray every time we finish up one
                }
            }
        }
        else {
            LoggerService.logger.info(`fetchOrderBook - Finalizing requesting order book from ${app.exchange.name} with ${Object.keys(app.exchange.markets).length} symbols`);
        }
    }

    // ------------------------------------------------------------------------------------
    export const RefreshCCXTSymbolsFromExchanges = async () => {

        for (const [exchange_name, app] of GlobalsServices.ExchangeApplicationDict) {

            // create new application                
            if (app.db_exchange.enabled) {
                app.markets = await app.exchange.loadMarkets();

                // store the symbols in a "pending requests" queue in order to fetch the book asycronously
                Object.values(app.markets).forEach(market => app.PendingRequestsQueue.enqueue(market));
                LoggerService.logger.info(`RefreshSymbolsFromCCXT - Exchange ${app.exchange.name} symbols ${Object.keys(app.exchange.markets).length}`);

                // upate exchange data                
                app.db_exchange.name = app.exchange.name;
                app.db_exchange.description = app.exchange.name;
                app.db_exchange.markets = Object.keys(app.exchange.markets);
                ExchangeService.UpdateExchange(app.exchange.id, app.db_exchange);

                await fetchOrderBook(app);
            }
            else {

                // exchange disabled ? In order to avoid calculations proceed deleting its symbols (and therefore its markets) 
                const symbols_dict = GlobalsServices.ExchangesSymbolsDict.get(exchange_name);
                if (symbols_dict) {
                    for (const symbol_name of symbols_dict.keys()) {

                        // 1. delete symbol based on exchange and name
                        SymbolService.DeleteSymbolByExchangeAndName(exchange_name, symbol_name);

                        // 2. delete markets based on exchange and symbol
                        const markets = GlobalsServices.MarketsIndexPerSymbol.get(symbol_name);
                        if (markets) {
                            for (const market_id of markets.values()) {
                                const markets = GlobalsServices.Markets.get(market_id);
                                if (markets) {
                                    for (const market of markets) {
                                        // @@ borrar el mercado y en caso de que el registro se quede sin elementos, borrarlo también del índice
                                    }
                                }
                            }
                        }
                    }
                    GlobalsServices.ExchangesSymbolsDict.delete(exchange_name);
                }
            }
        }
    }

    // ------------------------------------------------------------------------------------
    export const InitializeSymbolsFromDB = async () => {
        // 1. First load whatever available on the database as a start
        // 2. Make what listens from CCXT Observable, in order to update whatever on the main dictionary
        // 3. Also subscribe for any symbol that arrives, either database or CCXT in order to create the Market (duet or triplet)
        // 4. And later, for any change in price of any of the Markets (duet or triplet) evaluate the arbitrage opportunity
        LoggerService.logger.info(`InitializeSymbolsFromDB - Initializing Symbols from DB`);
        const response = await SymbolService.GetSymbols({ seed: "", skip: 0, limit: 9999, total: undefined, results: undefined, version: "0.1" });
        if (response && response.length > 0) {
            response.forEach((symbol: Interfaces.Symbol) => GlobalsServices.UpsertSymbol(symbol));
            LoggerService.logger.info(`InitializeSymbolsFromDB - ExchangesSymbolsDict ${GlobalsServices.ExchangesSymbolsDict.size}`);
        }
        else {
            LoggerService.logger.warn(`InitializeSymbolsFromDB - Zero symbols`);
        }
    }

}
