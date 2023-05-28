import { ISymbol } from "../interfaces/symbol.interfaces";
import SymbolModel from "../models/symbol";

export namespace PairService {

    export const insertCar = async (item: ISymbol) => {
        const responseInsert = await SymbolModel.create(item);
        return responseInsert;
    };

    /** http://localhost:3002/item */
    export const getCars = async (skip: number, limit: number) => {
        const responseInsert = await SymbolModel.find({}).skip(skip).limit(limit);
        return responseInsert;
    };

    /** http://localhost:3002/item/63aa37ebd94c08c748fdd748 */
    export const getCar = async (id: string) => {
        const responseInsert = await SymbolModel.findOne({ _id: id });
        return responseInsert;
    };

    export const updateCar = async (id: string, item: ISymbol) => {
        const responseInsert = await SymbolModel.findOneAndUpdate({ _id: id }, item, { new: true, });
        return responseInsert;
    };

    export const deleteCar = async (id: string) => {
        const responseInsert = await SymbolModel.findOneAndDelete({ _id: id });
        return responseInsert;
    };

}
