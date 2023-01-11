import { Condor } from "../interfaces/exchange.interface";
import ExchangeModel from "../models/exchange";
import ccxt, { Dictionary, Exchange, Market } from 'ccxt';
import { logger } from "./logger";
import { Queue } from "../utils/queue";

// services 

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
            logger.info(`OrderBook Fetching ${this.exchange.name} keys ${limit}/${this.symbolsQueue.length()}`);

            for (this.openRequests = 0; this.openRequests < limit; this.openRequests++) {
                const symbol = this.symbolsQueue.dequeue();
                if (symbol) {
                    const orderBook = this.exchange.fetchOrderBook(symbol)
                        .then((value: ccxt.OrderBook) => {
                            const bid = value.bids.length > 0 && value.bids[0].length > 0 ? value.bids[0][0] : 0;
                            const ask = value.asks.length > 0 && value.asks[0].length > 0 ? value.asks[0][0] : 0;
                            logger.debug(`Exchange ${this.exchange.name} symbol ${symbol} bbo ${bid}/${ask}`);
                        })
                        .catch((reason) => {
                            logger.debug(`Exchange ${this.exchange.name} symbol ${symbol} reason ${reason}`);
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

// ------------------------------------------------------------------------------------
export { InsertExchange, GetExchanges, GetExchange, UpdateExchange, DeleteExchange, InitializeExchanges };

