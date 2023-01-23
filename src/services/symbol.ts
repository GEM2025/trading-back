import { CondorInterface } from "../interfaces/condor.interfaces";
import SymbolModel from "../models/symbol";

export namespace SymbolService {

    export const InsertSymbol = async (symbol: CondorInterface.Symbol) => {

        // const responseInsert = await SymbolModel.create(symbol);

        // insert or update
        const { name, exchange } = symbol;
        const updateData = symbol;
        const responseInsert = await SymbolModel.findOneAndUpdate({ name: name, exchange: exchange }, updateData, { new: true, upsert: true });
        return responseInsert;
    };

    /** http://localhost:3002/symbol */
    export const GetSymbols = async (info: any) => {

        const responseInsert = await SymbolModel.find({}).skip(info.skip).limit(info.limit);
        info.total = await SymbolModel.find({}).countDocuments();
        info.results = responseInsert.length;
        return responseInsert;
    };

    /** http://localhost:3002/symbol/63aa37ebd94c08c748fdd748 */
    export const GetSymbol = async (id: string) => {
        const responseInsert = await SymbolModel.findOne({ _id: id });
        return responseInsert;
    };

    export const UpdateSymbol = async (id: string, symbol: CondorInterface.Symbol) => {
        const responseInsert = await SymbolModel.findOneAndUpdate({ _id: id }, symbol, { new: true, });
        return responseInsert;
    };

    export const DeleteSymbol = async (id: string) => {
        const responseInsert = await SymbolModel.findOneAndDelete({ _id: id });
        return responseInsert;
    };

}

