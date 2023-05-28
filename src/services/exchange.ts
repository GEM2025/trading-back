import * as ccxt from 'ccxt';
import ExchangeModel from "../models/exchange";
import { ExchangeApplicationModel } from "../models/exchange_application";
import { LoggerService } from './logger';
import { GlobalsServices } from './globals';
import { IExchange } from '../interfaces/exchange.interfaces';

// services 

export namespace ExchangeService {


    // ------------------------------------------------------------------------------------
    export const InsertExchange = async (exchange: IExchange) => {

        // const responseInsert = await ExchangeModel.create(exchange);

        // insert or update
        try {
            const { name } = exchange;
            const updateData = exchange;
            const responseInsert = await ExchangeModel.findOneAndUpdate({ name: name }, updateData, { new: true, upsert: true });
            return responseInsert;
        } catch (error) {
            LoggerService.logger.error(`ExchangeService::InsertExchange ${exchange.name} ${error}`);
        }
        return null;
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
    export const UpdateExchange = async (id: string, exchange: IExchange) => {
        try {
            const responseInsert = await ExchangeModel.findOneAndUpdate({ _id: id }, exchange, { new: true, });
            return responseInsert;
        } catch (error) {
            LoggerService.logger.error(`ExchangeService::UpdateExchange ${id} ${error}`);
        }
        return null;
    };

    // ------------------------------------------------------------------------------------
    export const DeleteExchange = async (id: string) => {
        try {
            const responseInsert = await ExchangeModel.findOneAndDelete({ _id: id });
            return responseInsert;
        } catch (error) {
            LoggerService.logger.error(`ExchangeService::DeleteExchange ${id} ${error}`);
        }
        return null;
    };

    // ------------------------------------------------------------------------------------
    export const DeleteExchangebyName = async (name: string) => {
        const responseInsert = await ExchangeModel.findOneAndDelete({ name: name });
        return responseInsert;
    };

    // ------------------------------------------------------------------------------------
    // cst templetea las respuestas de diccionarios, no podemos pasar strings
    export const GetCcxtExchange = (exchangeId: string): ccxt.Exchange => {
        switch (exchangeId.toLowerCase()) {
            case "bitso":
                return new ccxt['bitso'] as ccxt.Exchange;

            case "gemini":
                return new ccxt['gemini'] as ccxt.Exchange;

            case "kucoin":
                return new ccxt['kucoin'] as ccxt.Exchange;

            case "coinbasepro":
                return new ccxt['coinbasepro'] as ccxt.Exchange;

            case "bittrex":
                return new ccxt['bittrex'] as ccxt.Exchange;

            case "kraken":
                return new ccxt['kraken'] as ccxt.Exchange;

            case "binanceus":
                return new ccxt['binanceus'] as ccxt.Exchange;

            default:
                return new ccxt.Exchange;

        }
    }

    // ------------------------------------------------------------------------------------
    export const RefreshCCXTExchanges = async () => {

        let num_exchanges = 0 ;
        const db_exchanges = await ExchangeService.GetExchanges(0, 9999);
        for (const db_exchange of db_exchanges) {

            const exchange = ExchangeService.GetCcxtExchange(db_exchange.name);
            if (exchange) {                
                // create new application
                const app = new ExchangeApplicationModel.ExchangeApplication(db_exchange.id, db_exchange, exchange);
                GlobalsServices.ExchangeApplicationDict.set(db_exchange.name, app);
                num_exchanges++;
            }
        }
        return num_exchanges;
    }

    // ------------------------------------------------------------------------------------
    export const InitializeExchangesFromDB = async () => {
        
        LoggerService.logger.info(`ExchangeService::InitializeExchangesFromDB - Initializing Exchanges from DB`);
        const response = await ExchangeService.GetExchanges(0, 999);
        if (response?.length > 0) {
            response.forEach((exchange: IExchange) => GlobalsServices.UpsertExchange(exchange));
            LoggerService.logger.info(`ExchangeService::InitializeExchangesFromDB - ExchangesExchangesDict ${GlobalsServices.ExchangesDict.size}`);
        }
        else {
            LoggerService.logger.warn(`ExchangeService::InitializeExchangesFromDB - Zero symbols`);
        }
    }
}