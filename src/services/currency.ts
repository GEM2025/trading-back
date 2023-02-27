import { Interfaces } from "../interfaces/app.interfaces";
import CurrencyModel from "../models/currency";
import { GlobalsServices } from './globals';


export namespace CurrencyService {

    // ---------------------------------
    export const UpsertCurrency = async (Currency: Interfaces.Currency) => {

        // insert or update
        const { name } = Currency;
        const updateData = Currency;
        const responseInsert = await CurrencyModel.findOneAndUpdate({ name: name }, updateData, { new: true, upsert: true });
        return responseInsert;
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
    export const UpdateCurrency = async (id: string, Currency: Interfaces.Currency) => {
        const responseInsert = await CurrencyModel.findOneAndUpdate({ _id: id }, Currency, { new: true, });
        return responseInsert;
    };

    // ---------------------------------
    export const DeleteCurrency = async (id: string) => {
        const responseInsert = await CurrencyModel.findOneAndDelete({ _id: id });
        return responseInsert;
    };

    // ---------------------------------
    export const UpsertSymbol = (symbol: Interfaces.Symbol) => {

        const base: Interfaces.Currency = {
            name: symbol.pair.base,
            enabled: false,
        };        
        
        CurrencyService.UpsertCurrency(base); // store it on MongoDB
        GlobalsServices.UpsertCurrency(base); // store it on global memory containers
        
        const term: Interfaces.Currency = {
            name: symbol.pair.term,
            enabled: false,
        };
        CurrencyService.UpsertCurrency(term); // store it on MongoDB
        GlobalsServices.UpsertCurrency(term); // store it on global memory containers

    }

}

