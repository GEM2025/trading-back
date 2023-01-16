
import { Condor } from "../interfaces/condor.interfaces";

import ExchangeModel from "../models/exchange";
import ccxt, { Dictionary, Market } from 'ccxt';
import { logger } from "./logger";
import { Queue } from "../utils/queue";
import { GetSymbols, InsertSymbol } from "./symbol";

// services 

let exchangesDict = new Map<string, Map<string, Condor.Symbol>>();

// ------------------------------------------------------------------------------------
const InsertExchange = async (exchange: Condor.Exchange) => {

    // const responseInsert = await ExchangeModel.create(exchange);

    // insert or update
    const { name } = exchange;
    const updateData = exchange;
    const responseInsert = await ExchangeModel.findOneAndUpdate({ name: name }, updateData, { new: true, upsert: true });
    return responseInsert;


};

// ------------------------------------------------------------------------------------
/** http://localhost:3002/exchange */
const GetExchanges = async (skip: number, limit: number) => {
    const responseInsert = await ExchangeModel.find({}).skip(skip).limit(limit);
    return responseInsert;
};

// ------------------------------------------------------------------------------------
/** http://localhost:3002/exchange/63aa37ebd94c08c748fdd748 */
const GetExchange = async (id: string) => {
    const responseInsert = await ExchangeModel.findOne({ _id: id });
    return responseInsert;
};

// ------------------------------------------------------------------------------------
const UpdateExchange = async (id: string, exchange: Condor.Exchange) => {
    const responseInsert = await ExchangeModel.findOneAndUpdate({ _id: id }, exchange, { new: true, });
    return responseInsert;
};

// ------------------------------------------------------------------------------------
const DeleteExchange = async (id: string) => {
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

class ExchangeApplication {
    exchange!: ccxt.Exchange;
    symbolsQueue: Queue<string>;
    markets?: ccxt.Dictionary<ccxt.Market>;
    openRequests: number = 0;

    constructor(exchange: ccxt.Exchange) {
        this.exchange = exchange;
        this.symbolsQueue = new Queue<string>;
    }

    fetchOrderBook = async () => {

        const limit = Math.min(this.exchange.rateLimit, this.symbolsQueue.length());
        if (limit) {
            logger.debug(`OrderBook Fetching ${this.exchange.name} keys ${limit}/${this.symbolsQueue.length()}`);

            for (this.openRequests = 0; this.openRequests < limit; this.openRequests++) {
                const symbol = this.symbolsQueue.dequeue();
                if (symbol) {
                    const limit = this.exchange.name === "KuCoin" ? 20 : 1; //only get the top of book
                    const orderBook = this.exchange.fetchOrderBook(symbol, limit)
                        .then((value: ccxt.OrderBook) => {

                            const [base, term] = symbol.split('/');
                            const [bid_px, bid_size] = value.bids.length > 0 && value.bids[0].length > 0 ? [value.bids[0][0], value.bids[0][1]] : [0, 0];
                            const [ask_px, ask_size] = value.asks.length > 0 && value.asks[0].length > 0 ? [value.asks[0][0], value.asks[0][1]] : [0, 0];

                            const upsertSymbol: Condor.Symbol = {
                                name: symbol,
                                exchange: this.exchange.name,
                                pair: [base, term],
                                bid: [bid_px, bid_size],
                                ask: [ask_px, ask_size],
                            };

                            InsertMarkets(upsertSymbol);

                            InsertSymbol(upsertSymbol);

                            logger.debug(`Exchange ${this.exchange.name} symbol ${symbol} bbo ${bid_px}/${ask_px}`);
                        })
                        .catch((reason) => {
                            logger.warn(`Exchange ${this.exchange.name} symbol ${symbol} reason ${reason}`);
                        })
                        .finally(() => {
                            this.openRequests--;
                            if (!this.openRequests) {
                                // recurse the next-package request
                                logger.debug(`Exchange ${this.exchange.name} requests finalized`);
                                this.fetchOrderBook();
                            }
                        });
                }
            }
        }
        else {
            logger.info(`OrderBook Complete ${this.exchange.name}`);
        }
    }
};

const ExchangeApplicationDict: Record<string, ExchangeApplication> = {};

// ------------------------------------------------------------------------------------
// 1. First load whatever available on the database as a start
// 2. Make what listens from CCXT Observable, in order to update whatever on the main dictionary
// 3. Also subscribe for any symbol that arrives, either database or CCXT in order to create the Market (duet or triplet)
// 4. And later, for any change in price of any of the Markets (duet or triplet) evaluate the arbitrage opportunity
const InitializeExchange = async (ccxtVersion: string, exchangeId: string) => {
    const exchange = GetCcxtExchange(exchangeId);
    if (exchange) {

        ExchangeApplicationDict[exchangeId] = new ExchangeApplication(exchange);

        const markets = exchange.loadMarkets();
        markets.then((results: Dictionary<Market>) => {
            const app = ExchangeApplicationDict[exchangeId];
            app.markets = results;

            for (const [symbol] of Object.entries(app.markets))
                app.symbolsQueue.enqueue(symbol);

            logger.info(`Exchange ${exchange.name} keys ${app.symbolsQueue.length()}`);
            app.fetchOrderBook();

        });
    }
    else {
        logger.error(`Exchange ${exchangeId} invalid`);
    }
}

// ------------------------------------------------------------------------------------
const InitializeExchanges = () => {

    // CCXT stuff    
    const ccxtVersion = ccxt.version;
    logger.info(`CCXT version ${ccxtVersion}`);

    GetExchanges(0, 99)
        .then((values) => {
            values.forEach(exchange => {
                InitializeExchange(ccxtVersion, exchange.name);
            });
        })
        .catch((error) => {
            logger.error(`GetExchanges error ${error}`);
        });

}

class Node {
    symbol: Condor.Symbol;
    children: Array<Node>;

    constructor(symbol: Condor.Symbol) {
        this.symbol = symbol;
        this.children = [];
    }
};

// ------------------------------------------------------------------------------------
const InsertMarkets = (symbol: Condor.Symbol) => {
    if (!exchangesDict.has(symbol.exchange)) {
        exchangesDict.set(symbol.exchange, new Map<string, Condor.Symbol>);
    }
    exchangesDict.get(symbol.exchange)?.set(symbol.name,symbol);
}


// ------------------------------------------------------------------------------------
const InitializeMarketsFromDb = () => {
    logger.info(`Initializing Markets`);

    let info = { seed: "", skip: 0, limit: 9999, total: undefined, results: undefined, version: "0.1" };
    let nodes: Array<Node> = [];

    GetSymbols(info)
        .then((response) => {
            response.forEach((symbol: Condor.Symbol) => {
                InsertMarkets(symbol);                
            });
        })
        .catch((error) => {
            logger.error(`Markets - GetExchanges error ${error}`);
        })
        .finally(() => {
            for (const [key, value] of exchangesDict.entries()) {
                logger.info(`Markets - Generating Node Info for Exchange ${key} ${value.size}`)
            }
        });

}

// ------------------------------------------------------------------------------------
export { InsertExchange, GetExchanges, GetExchange, UpdateExchange, DeleteExchange, InitializeExchanges, InitializeMarketsFromDb };

