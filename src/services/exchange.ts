import ccxt from 'ccxt';
import ExchangeModel from "../models/exchange";
import { Interfaces } from "../interfaces/app.interfaces";
import { ExchangeApplicationModel } from "../models/exchange_application";
import { LoggerService } from './logger';
import { GlobalsServices } from './globals';

// services 

export namespace ExchangeService {
   

    // ------------------------------------------------------------------------------------
    export const InsertExchange = async (exchange: Interfaces.Exchange) => {

        // const responseInsert = await ExchangeModel.create(exchange);

        // insert or update
        try {
            const { name } = exchange;
            const updateData = exchange;
            const responseInsert = await ExchangeModel.findOneAndUpdate({ name: name }, updateData, { new: true, upsert: true });
            return responseInsert;
        } catch (error) {
            LoggerService.logger.error(`InsertExchange ${exchange.name} ${error}`);
        }
        return null ;
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
        try {
            const responseInsert = await ExchangeModel.findOneAndUpdate({ _id: id }, exchange, { new: true, });
            return responseInsert;            
        } catch (error) {
            LoggerService.logger.error(`UpdateExchange ${id} ${error}`);                        
        }
        return null ;
    };

    // ------------------------------------------------------------------------------------
    export const DeleteExchange = async (id: string) => {
        try {
            const responseInsert = await ExchangeModel.findOneAndDelete({ _id: id });
            return responseInsert;            
        } catch (error) {
            LoggerService.logger.error(`DeleteExchange ${id} ${error}`);            
        }
        return null ;
    };

    // ------------------------------------------------------------------------------------
    export const DeleteExchangebyName = async (name: string) => {
        const responseInsert = await ExchangeModel.findOneAndDelete({ name: name });
        return responseInsert;
    };

    // ------------------------------------------------------------------------------------
    // cst templetea las respuestas de diccionarios, no podemos pasar strings
    export const GetCcxtExchange = (exchangeId: string): ccxt.Exchange | null => {
        switch (exchangeId.toLowerCase()) {
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
    export const RefreshCCXTExchanges = async () => {

        const db_exchanges = await ExchangeService.GetExchanges(0, 9999);
        for (const db_exchange of db_exchanges) {

            const exchange = ExchangeService.GetCcxtExchange(db_exchange.name);
            if (exchange) {
                // create new application
                const app = new ExchangeApplicationModel.ExchangeApplication(db_exchange, exchange);
                GlobalsServices.ExchangeApplicationDict.set(db_exchange.name, app);
            }
        }
    }
}