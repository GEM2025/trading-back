import SymbolModel from "../models/symbol";

// Services 

export namespace OrderService {

    /** 
     * http://localhost:3002/item
     * Solo aquellos clientes con sesión activa JWT
     * */

    export const getOrders = async () => {
        const responseInsert = await SymbolModel.find({});
        return responseInsert;
    };


}
