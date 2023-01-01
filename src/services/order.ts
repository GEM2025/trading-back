import ItemModel from "../models/item";

// services

/** 
 * http://localhost:3002/item
 * Solo aquellos clientes con sesión activa JWT
 * */

const getOrders = async () => {
    const responseInsert = await ItemModel.find({});
    return responseInsert;
};


export { getOrders };