import ccxt, { Dictionary, Market } from 'ccxt';
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
        const { name, exchange } = symbol;
        const updateData = symbol;
        const responseInsert = await SymbolModel.findOneAndUpdate({ name: name, exchange: exchange }, updateData, { new: true, upsert: true });
        return responseInsert;
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
    export const DeleteSymbol = async (id: string) => {
        const responseInsert = await SymbolModel.findOneAndDelete({ _id: id });
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

        // store it on MongoDB
        // CurrencyService.UpsertSymbol(upsertSymbol);

        // store it on global memory containers
        // GlobalsServices.UpsertCurrency(upsertSymbol);

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
                        .catch(reason => LoggerService.logger.warn(`Exchange ${app.exchange.name} symbol ${market.symbol} reason ${reason}`))
                        .finally(() => --openRequests || fetchOrderBook(app)); // request another tray every time we finish up one
                }
            }
        }
        else {
            LoggerService.logger.info(`Finalizing requesting order book from ${app.exchange.name} with ${Object.keys(app.exchange.markets).length} symbols`);
        }
    }


    // ------------------------------------------------------------------------------------
    export const RefreshSymbolsFromCCXT = async () => {

        // CCXT stuff    
        const ccxtVersion = ccxt.version;
        LoggerService.logger.info(`Initializing Symbols from CCXT Exchanges - version ${ccxtVersion}`);
        
        const db_exchanges = await ExchangeService.GetExchanges(0, 99);
        for (const db_exchange of db_exchanges) {
            const exchange = ExchangeService.GetCcxtExchange(db_exchange.name);
            if (exchange) {
                
                // create new application
                const app = new ExchangeApplicationModel.ExchangeApplication(exchange);
                GlobalsServices.ExchangeApplicationDict.set(db_exchange.name, app);
                app.markets = await exchange.loadMarkets();

                // store the symbols in a "pending requests" queue in order to fetch the book asycronously
                Object.values(app.markets).forEach(market => app.PendingRequestsQueue.enqueue(market));
                LoggerService.logger.info(`Exchange ${app.exchange.name} symbols ${Object.keys(app.exchange.markets).length}`);

                // upate exchange data                
                db_exchange.name = app.exchange.name;                
                db_exchange.description = app.exchange.name;
                db_exchange.markets = Object.keys(app.exchange.markets);
                ExchangeService.UpdateExchange( db_exchange.id, db_exchange );

                await fetchOrderBook(app);

            }
            else {
                LoggerService.logger.error(`Exchange ${db_exchange.name} invalid`);
            }
        };
    }

    // ------------------------------------------------------------------------------------
    export const InitializeSymbolsFromDB = async () => {
        // 1. First load whatever available on the database as a start
        // 2. Make what listens from CCXT Observable, in order to update whatever on the main dictionary
        // 3. Also subscribe for any symbol that arrives, either database or CCXT in order to create the Market (duet or triplet)
        // 4. And later, for any change in price of any of the Markets (duet or triplet) evaluate the arbitrage opportunity
        LoggerService.logger.info(`Initializing Symbols from DB`);
        const response = await SymbolService.GetSymbols({ seed: "", skip: 0, limit: 9999, total: undefined, results: undefined, version: "0.1" });
        response.forEach((symbol: Interfaces.Symbol) => GlobalsServices.UpsertSymbol(symbol));
        LoggerService.logger.info(`Symbols - ExchangesSymbolsDict ${GlobalsServices.ExchangesSymbolsDict.size}`);
    }

}
