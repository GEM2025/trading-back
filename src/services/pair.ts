import { Symbol } from "../interfaces/symbol.interface";
import SymbolModel from "../models/symbol";

// services

const insertCar = async (item: Symbol) => {
    const responseInsert = await SymbolModel.create(item);
    return responseInsert;
};

/** http://localhost:3002/item */
const getCars = async (skip: number, limit: number) => {
    const responseInsert = await SymbolModel.find({}).skip(skip).limit(limit);
    return responseInsert;
};

/** http://localhost:3002/item/63aa37ebd94c08c748fdd748 */
const getCar = async (id: string) => {
    const responseInsert = await SymbolModel.findOne({ _id: id });
    return responseInsert;
};

const updateCar = async (id: string, item: Symbol) => {
    const responseInsert = await SymbolModel.findOneAndUpdate({ _id: id }, item, { new: true, });
    return responseInsert;
};

const deleteCar = async (id: string) => {
    const responseInsert = await SymbolModel.findOneAndDelete({ _id: id });
    return responseInsert;
};

export { insertCar, getCars, getCar, updateCar, deleteCar };