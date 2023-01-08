import { Car } from "../interfaces/car.interface";
import ItemModel from "../models/item";

// services

const insertCar = async (item: Car) => {
    const responseInsert = await ItemModel.create(item);
    return responseInsert;
};

/** http://localhost:3002/item */
const getCars = async (skip: number, limit: number) => {
    const responseInsert = await ItemModel.find({}).skip(skip).limit(limit);
    return responseInsert;
};

/** http://localhost:3002/item/63aa37ebd94c08c748fdd748 */
const getCar = async (id: string) => {
    const responseInsert = await ItemModel.findOne({ _id: id });
    return responseInsert;
};

const updateCar = async (id: string, item: Car) => {
    const responseInsert = await ItemModel.findOneAndUpdate({ _id: id }, item, { new: true, });
    return responseInsert;
};

const deleteCar = async (id: string) => {
    const responseInsert = await ItemModel.findOneAndDelete({ _id: id });
    return responseInsert;
};

export { insertCar, getCars, getCar, updateCar, deleteCar };