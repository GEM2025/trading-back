import { CondorExchange } from "../interfaces/condor_exchange.interface";
import CondorExchangeModel from "../models/condor_exchange";
import ccxt, { Dictionary, Exchange, Market } from 'ccxt';
import { logger } from "./logger";

// services

// ------------------------------------------------------------------------------------
const InsertCondorExchange = async (exchange: CondorExchange) => {
    const responseInsert = await CondorExchangeModel.create(exchange);
    return responseInsert;
};

// ------------------------------------------------------------------------------------
/** http://localhost:3002/exchange */
const GetCondorExchanges = async (skip: number, limit: number) => {
    const responseInsert = await CondorExchangeModel.find({}).skip(skip).limit(limit);
    return responseInsert;
};

// ------------------------------------------------------------------------------------
/** http://localhost:3002/exchange/63aa37ebd94c08c748fdd748 */
const GetCondorExchange = async (id: string) => {
    const responseInsert = await CondorExchangeModel.findOne({ _id: id });
    return responseInsert;
};

// ------------------------------------------------------------------------------------
const UpdateCondorExchange = async (id: string, exchange: CondorExchange) => {
    const responseInsert = await CondorExchangeModel.findOneAndUpdate({ _id: id }, exchange, { new: true, });
    return responseInsert;
};

// ------------------------------------------------------------------------------------
const DeleteCondorExchange = async (id: string) => {
    const responseInsert = await CondorExchangeModel.findOneAndDelete({ _id: id });
    return responseInsert;
};

// ------------------------------------------------------------------------------------
// cst templetea las respuestas de diccionarios, no podemos pasar strings
const GetExchange = (exchangeId: string): ccxt.Exchange => {
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
        default:
            return new ccxt['binanceus'];
            break;

    }
}

// ------------------------------------------------------------------------------------
const InitializeCondorExchange = async (ccxtVersion: string, exchangeId: string) => {
    const exchange = GetExchange(exchangeId);
    exchange.rateLimit = 10000;
    const markets = exchange.loadMarkets();
    markets.then((results: Dictionary<Market>) => {
        logger.info(`CCXT version ${ccxtVersion} Exchange ${exchange.name} keys ${Object.keys(results).length}`);
        for (const [symbol] of Object.entries(results)) {            
            const orderBook = exchange.fetchOrderBook(symbol).then((value: ccxt.OrderBook) => {
                logger.info(`symbol ${symbol} bbo ${value.bids[0][0]}/${value.asks[0][0]}`);
            });
        }
    });
}

// ------------------------------------------------------------------------------------
const InitializeCondorExchanges = () => {

    // CCXT stuff    
    const ccxtVersion = ccxt.version;

    InitializeCondorExchange(ccxtVersion, "bitso");
    InitializeCondorExchange(ccxtVersion, "gemini");
    InitializeCondorExchange(ccxtVersion, "kucoin");
    InitializeCondorExchange(ccxtVersion, "coinbasepro");
    InitializeCondorExchange(ccxtVersion, "bittrex");
    InitializeCondorExchange(ccxtVersion, "kraken");
    InitializeCondorExchange(ccxtVersion, "binanceus");

}

// ------------------------------------------------------------------------------------
export { InsertCondorExchange, GetCondorExchanges, GetCondorExchange, UpdateCondorExchange, DeleteCondorExchange, InitializeCondorExchanges };
