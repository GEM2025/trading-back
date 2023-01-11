import SymbolModel from "../models/symbol";

// services

/** 
 * http://localhost:3002/item
 * Solo aquellos clientes con sesión activa JWT
 * */

const getOrders = async () => {
    const responseInsert = await SymbolModel.find({});
    return responseInsert;
};


export { getOrders };