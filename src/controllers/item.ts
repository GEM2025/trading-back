
import { Request, Response } from "express";
import { getCars, getCar, insertCar, updateCar, deleteCar, } from "../services/item";
import { handlerHttp } from "../utils/error.handler";
import { logger } from "../services/logger";

// controllers

/** http://localhost:3002/item */
const getItems = async (req: Request, res: Response) => {

    try {

        const skip = Number.parseInt(req.query.skip?.toString() || "0") || 0;
        const limit = Number.parseInt(req.query.limit?.toString() || "999") || 999;

        logger.info(`Get items skip ${skip} limit ${limit}`);
        const responseItems = await getCars(skip, limit);
        if (responseItems) {
            setTimeout(() => {
                res.send({ results: responseItems, info: { seed: "", skip: skip, limit: limit, results: responseItems.length, version: "0.1" } });
            }, 300);
        }
        else {
            res.status(500);
            res.send('NO RECORDS FOUND');
        }
    } catch (error) {
        handlerHttp(res, 'ERROR_GET_ITEMS', error);
    }
}

/** http://localhost:3002/item/63aa37ebd94c08c748fdd748 */
const getItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const responseItem = await getCar(id);
        if (responseItem) {
            setTimeout(() => {
                res.send({ results: [responseItem], info: { seed: "", results: 1, version: "0.1" } });    
            }, 300);
        }
        else {
            res.status(500);
            res.send('NOT FOUND');
        }
    } catch (error) {
        handlerHttp(res, 'ERROR_GET_ITEM', error);
    }
}

const postItem = async (req: Request, res: Response) => {
    try {
        const responseItem = await insertCar(req.body);
        if (responseItem) {
            res.send(responseItem);
        }
        else {
            res.status(500);
            res.send('NOT INSERTED');
        }
    } catch (error) {
        handlerHttp(res, 'ERROR_POST_ITEM', error);
    }
}

const updateItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const responseItem = await updateCar(id, req.body);
        if (responseItem) {
            res.send(responseItem);
        }
        else {
            res.status(500);
            res.send('NOT FOUND');
        }
    } catch (error) {
        handlerHttp(res, 'ERROR_UPDATE_ITEM', error);
    }
}

const deleteItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const responseItem = await deleteCar(id);
        if (responseItem) {
            res.send(responseItem);
        }
        else {
            res.status(500);
            res.send('NOT FOUND');
        }
    } catch (error) {
        handlerHttp(res, 'ERROR_DELETE_ITEM ' + error);
    }
}

export { getItem, getItems, updateItem, postItem, deleteItem };
