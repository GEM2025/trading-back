import ccxt, { Dictionary, Market } from 'ccxt';
import ExchangeModel from "../models/exchange";

import { Interfaces } from "../interfaces/app.interfaces";
import { ExchangeApplicationModel } from "../models/exchange_application";
import { LoggerService } from "./logger";
import { SymbolService } from "./symbol";
import { GlobalsServices } from './globals';

// services 

export namespace ExchangeService {

    // ------------------------------------------------------------------------------------
    // exchangeId vs ExchangeApplication (main object)
    const ExchangeApplicationDict: Record<string, ExchangeApplicationModel.ExchangeApplication> = {};


    // ------------------------------------------------------------------------------------
    export const InsertExchange = async (exchange: Interfaces.Exchange) => {

        // const responseInsert = await ExchangeModel.create(exchange);

        // insert or update
        const { name } = exchange;
        const updateData = exchange;
        const responseInsert = await ExchangeModel.findOneAndUpdate({ name: name }, updateData, { new: true, upsert: true });
        return responseInsert;
    };

    // ------------------------------------------------------------------------------------
    /** http://localhost:3002/exchange */
    export const GetExchanges = async (skip: number, limit: number) => {
        const responseInsert = await ExchangeModel.find({}).skip(skip).limit(limit);
        return responseInsert;
    };

    // ------------------------------------------------------------------------------------
    /** http://localhost:3002/exchange/63aa37ebd94c08c748fdd748 */
    export const GetExchange = async (id: string) => {
        const responseInsert = await ExchangeModel.findOne({ _id: id });
        return responseInsert;
    };

    // ------------------------------------------------------------------------------------
    export const UpdateExchange = async (id: string, exchange: Interfaces.Exchange) => {
        const responseInsert = await ExchangeModel.findOneAndUpdate({ _id: id }, exchange, { new: true, });
        return responseInsert;
    };

    // ------------------------------------------------------------------------------------
    export const DeleteExchange = async (id: string) => {
        const responseInsert = await ExchangeModel.findOneAndDelete({ _id: id });
        return responseInsert;
    };

    // ------------------------------------------------------------------------------------
    // cst templetea las respuestas de diccionarios, no podemos pasar strings
    const GetCcxtExchange = (exchangeId: string): ccxt.Exchange | null => {
        switch (exchangeId) {
            case "bitso":
                return new ccxt['bitso'];
                break;
            case "gemini":
                return new ccxt['gemini'];
                break;
            case "kucoin":
                return new ccxt['kucoin'];
                break;
            case "coinbasepro":
                return new ccxt['coinbasepro'];
                break;
            case "bittrex":
                return new ccxt['bittrex'];
                break;
            case "kraken":
                return new ccxt['kraken'];
                break;
            case "binanceus":
                return new ccxt['binanceus'];
                break;
            default:
                return null;
                break;

        }
    }

    // ------------------------------------------------------------------------------------
    const fetchOrderBook = async (app: ExchangeApplicationModel.ExchangeApplication) => {
        
        const limit = Math.min(app.exchange.rateLimit, app.symbolsQueue.length());
        if (limit) {
            LoggerService.logger.info(`OrderBook Fetching ${app.exchange.name} keys ${limit} from ${app.symbolsQueue.length()}`);

            for (app.openRequests = 0; app.openRequests < limit; app.openRequests++) {
                const symbol = app.symbolsQueue.dequeue();
                if (symbol) {
                    const limit = app.exchange.name === "KuCoin" ? 20 : 1; //only get the top of book
                    const orderBook = app.exchange.fetchOrderBook(symbol, limit)
                        .then((value: ccxt.OrderBook) => {

                            const [base, term] = symbol.split('/');
                            const [bid_px, bid_qty] = value.bids.length > 0 && value.bids[0].length > 0 ? [value.bids[0][0], value.bids[0][1]] : [0, 0];
                            const [ask_px, ask_qty] = value.asks.length > 0 && value.asks[0].length > 0 ? [value.asks[0][0], value.asks[0][1]] : [0, 0];

                            const upsertSymbol: Interfaces.Symbol = {
                                name: symbol,
                                exchange: app.exchange.name,
                                pair: { base, term },
                                bid: { px: bid_px, qty: bid_qty },
                                ask: { px: ask_px, qty: ask_qty },
                            };

                            // store it on global memory containers
                            GlobalsServices.InsertSymbol(upsertSymbol);

                            // store it on MongoDB
                            SymbolService.InsertSymbol(upsertSymbol);

                            LoggerService.logger.debug(`Exchange ${app.exchange.name} symbol ${symbol} bbo ${bid_px}/${ask_px}`);
                        })
                        .catch(reason => {
                            LoggerService.logger.warn(`Exchange ${app.exchange.name} symbol ${symbol} reason ${reason}`);
                        })
                        .finally(() => {
                            app.openRequests--;
                            if (!app.openRequests) {
                                // recurse the next-package request
                                LoggerService.logger.debug(`Exchange ${app.exchange.name} requests finalized`);
                                fetchOrderBook(app);
                            }
                        });
                }
            }
        }
        else {
            LoggerService.logger.info(`OrderBook Complete ${app.exchange.name}`);
        }
    }


    // ------------------------------------------------------------------------------------    
    const LoadExchangeFromCCXT = async (exchangeId: string) => {
        const exchange = GetCcxtExchange(exchangeId);
        if (exchange) {

            ExchangeApplicationDict[exchangeId] = new ExchangeApplicationModel.ExchangeApplication(exchange);

            const markets = exchange.loadMarkets();
            markets.then((results: Dictionary<Market>) => {
                const app = ExchangeApplicationDict[exchangeId];
                app.markets = results;

                for (const [symbol] of Object.entries(app.markets))
                    app.symbolsQueue.enqueue(symbol);

                LoggerService.logger.debug(`Exchange ${exchange.name} keys ${app.symbolsQueue.length()}`);
                fetchOrderBook(app);

            });
        }
        else {
            LoggerService.logger.error(`Exchange ${exchangeId} invalid`);
        }
    }

    // ------------------------------------------------------------------------------------
    const InitializeExchangesFromCCXT = async () => {

        // CCXT stuff    
        const ccxtVersion = ccxt.version;
        LoggerService.logger.info(`Initializing CCXT Exchanges - version ${ccxtVersion}`);

        await GetExchanges(0, 99)
            .then((values) => {
                values.forEach(exchange => {
                    LoadExchangeFromCCXT(exchange.name);
                });
            })
            .catch((error) => {
                LoggerService.logger.error(`GetExchanges error ${error}`);
            });

    }

    // ------------------------------------------------------------------------------------
    const InitializeExchangesFromDB = async () => {
        LoggerService.logger.info(`Initializing Markets from DB`);

        let info = { seed: "", skip: 0, limit: 9999, total: undefined, results: undefined, version: "0.1" };
        // let nodes: Array<CondorInterface.Node> = [];

        await SymbolService.GetSymbols(info)
            .then((response) => {
                response.forEach((symbol: Interfaces.Symbol) => {
                    GlobalsServices.InsertSymbol(symbol);
                });
                LoggerService.logger.info(`Exchanges - ExchangesDict ${GlobalsServices.ExchangesSymbolsDict.size}`);
            })
            .catch((error) => {
                LoggerService.logger.error(`Markets - GetExchanges error ${error}`);
            })
            .finally(() => {
                for (const [key, value] of GlobalsServices.ExchangesSymbolsDict.entries()) {
                    LoggerService.logger.info(`Markets - Generating Node Info for Exchange ${key} ${value.size}`)
                }
            });
    }

    // ------------------------------------------------------------------------------------
    export const InitializeExchanges = async () => {
        // 1. First load whatever available on the database as a start
        // 2. Make what listens from CCXT Observable, in order to update whatever on the main dictionary
        // 3. Also subscribe for any symbol that arrives, either database or CCXT in order to create the Market (duet or triplet)
        // 4. And later, for any change in price of any of the Markets (duet or triplet) evaluate the arbitrage opportunity
        await InitializeExchangesFromDB().finally(() => {
            LoggerService.logger.info("InitializeExchanges DB initialization ready");
            InitializeExchangesFromCCXT().then(() => {
                LoggerService.logger.info("InitializeExchanges CCXT initialization ready");
            });
        });
    }

}