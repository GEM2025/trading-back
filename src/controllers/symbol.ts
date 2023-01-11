
import { Request, Response } from "express";
import { GetSymbols, GetSymbol, InsertSymbol, UpdateSymbol, DeleteSymbol, } from "../services/symbol";
import { handlerHttp } from "../utils/error.handler";
import { logger } from "../services/logger";

// controllers

/** http://localhost:3002/symbol */
const getSymbols = async (req: Request, res: Response) => {

    try {

        const skip = Number.parseInt(req.query.skip?.toString() || "0") || 0;
        const limit = Number.parseInt(req.query.limit?.toString() || "999") || 999;

        logger.info(`Get symbols skip ${skip} limit ${limit}`);
        const responseSymbols = await GetSymbols(skip, limit);
        if (responseSymbols) {
            setTimeout(() => {
                res.send({ results: responseSymbols, info: { seed: "", skip: skip, limit: limit, results: responseSymbols.length, version: "0.1" } });
            }, 300);
        }
        else {
            logger.error(`Symbol Controller - no records found ${req.body}`);
            res.status(500);
            res.send('NO RECORDS FOUND');
        }
    } catch (error) {
        logger.error(`Symbol Controller - ${error}`);
        handlerHttp(res, 'ERROR_GET_ITEMS', error);
    }
}

/** http://localhost:3002/symbol/63aa37ebd94c08c748fdd748 */
const getSymbol = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const responseSymbol = await GetSymbol(id);
        if (responseSymbol) {
            setTimeout(() => {
                res.send({ results: [responseSymbol], info: { seed: "", results: 1, version: "0.1" } });    
            }, 300);
        }
        else {
            logger.error(`Symbol Controller - symbol not found ${req.body}`);
            res.status(500);
            res.send('NOT FOUND');
        }
    } catch (error) {
        logger.error(`Symbol Controller - ${error}`);
        handlerHttp(res, 'ERROR_GET_ITEM', error);
    }
}

const postSymbol = async (req: Request, res: Response) => {
    try {
        const responseSymbol = await InsertSymbol(req.body);
        if (responseSymbol) {
            res.send(responseSymbol);
        }
        else {
            logger.error(`Symbol Controller - symbol not inserted ${req.body}`);
            res.status(500);
            res.send('NOT INSERTED');
        }
    } catch (error) {
        logger.error(`Symbol Controller - ${error}`);
        handlerHttp(res, 'ERROR_POST_ITEM', error);
    }
}

const updateSymbol = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const responseSymbol = await UpdateSymbol(id, req.body);
        if (responseSymbol) {
            res.send(responseSymbol);
        }
        else {
            logger.error(`Symbol Controller - symbol not updated ${req.body}`);
            res.status(500);
            res.send('NOT FOUND');
        }
    } catch (error) {
        logger.error(`Symbol Controller - ${error}`);
        handlerHttp(res, 'ERROR_UPDATE_ITEM', error);
    }
}

const deleteSymbol = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const responseSymbol = await DeleteSymbol(id);
        if (responseSymbol) {
            res.send(responseSymbol);
        }
        else {
            logger.error(`Symbol Controller - symbol not deleted ${req.body}`);
            res.status(500);
            res.send('NOT FOUND');
        }
    } catch (error) {
        logger.error(`Symbol Controller - ${error}`);
        handlerHttp(res, 'ERROR_DELETE_ITEM ' + error);
    }
}

export { getSymbol, getSymbols, updateSymbol, postSymbol, deleteSymbol };
