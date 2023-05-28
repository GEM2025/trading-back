import { ICurrency } from "../interfaces/currency.interfaces";
import { ISymbol } from "../interfaces/symbol.interfaces";
import CurrencyModel from "../models/currency";
import { GlobalsServices } from './globals';
import { LoggerService } from "./logger";

export namespace CurrencyService {

    // ---------------------------------
    export const UpsertCurrency = async (Currency: ICurrency) => {

        try {
            // insert only if document not found        
            const responseInsert = await CurrencyModel.findOneAndUpdate(
                { name: Currency.name },
                { $setOnInsert: Currency },
                { new: true, upsert: true });
            return responseInsert;
        } catch (error) {
            LoggerService.logger.error(`UpdateCurrency ${Currency.name} ${error}`);
        }
        return null ;
    };

    // ---------------------------------
    /** http://localhost:3002/Currency */
    export const GetCurrencies = async (info: any) => {

        const responseInsert = await CurrencyModel.find({}).skip(info.skip).limit(info.limit);
        info.total = await CurrencyModel.find({}).countDocuments();
        info.results = responseInsert.length;
        return responseInsert;
    };

    // ---------------------------------
    /** http://localhost:3002/Currency/63aa37ebd94c08c748fdd748 */
    export const GetCurrency = async (id: string) => {
        const responseInsert = await CurrencyModel.findOne({ _id: id });
        return responseInsert;
    };

    // ---------------------------------
    export const UpdateCurrency = async (id: string, Currency: ICurrency) => {
        const responseInsert = await CurrencyModel.findOneAndUpdate({ _id: id }, Currency, { upsert: true, new: true, });
        return responseInsert;
    };

    // ---------------------------------
    export const DeleteCurrency = async (id: string) => {
        const responseInsert = await CurrencyModel.findOneAndDelete({ _id: id });
        return responseInsert;
    };

    // ---------------------------------
    export const UpsertCurrencyFromSymbol = async (symbol: ISymbol) => {

        const base: ICurrency = {
            name: symbol.pair.base,
            enabled: false,
        };

        await CurrencyService.UpsertCurrency(base); // store it on MongoDB
        GlobalsServices.UpsertCurrency(base); // store it on global memory containers

        const term: ICurrency = {
            name: symbol.pair.term,
            enabled: true,
        };
        const c = await CurrencyService.UpsertCurrency(term); // store it on MongoDB
        GlobalsServices.UpsertCurrency(term); // store it on global memory containers

        // temporarily, update the currencies descibred in term (as they are less) to enabled
        c && CurrencyService.UpdateCurrency(c.id, term);
    }

}
