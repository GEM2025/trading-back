
import { Request, Response } from "express";
import { GetExchanges, GetExchange, InsertExchange, UpdateExchange, DeleteExchange, } from "../services/exchange";
import { handlerHttp } from "../utils/error.handler";
import { logger } from "../services/logger";

// controllers

/** http://localhost:3002/exchange */
const getExchanges = async (req: Request, res: Response) => {

    try {

        const skip = Number.parseInt(req.query.skip?.toString() || "0") || 0;
        const limit = Number.parseInt(req.query.limit?.toString() || "999") || 999;

        logger.info(`Get exchanges skip ${skip} limit ${limit}`);
        const responseExchanges = await GetExchanges(skip, limit);
        if (responseExchanges) {
            setTimeout(() => {
                res.send({ results: responseExchanges, info: { seed: "", skip: skip, limit: limit, results: responseExchanges.length, version: "0.1" } });
            }, 300);
        }
        else {
            logger.error(`Exchange Controller - no records found ${req.body}`);
            res.status(500);
            res.send('NO RECORDS FOUND');
        }
    } catch (error) {
        logger.error(`Exchange Controller - ${error}`);
        handlerHttp(res, 'ERROR_GET_ITEMS', error);
    }
}

/** http://localhost:3002/exchange/63aa37ebd94c08c748fdd748 */
const getExchange = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const responseExchange = await GetExchange(id);
        if (responseExchange) {
            setTimeout(() => {
                res.send({ results: [responseExchange], info: { seed: "", results: 1, version: "0.1" } });    
            }, 300);
        }
        else {
            logger.error(`Exchange Controller - record not found ${req.body}`);
            res.status(500);
            res.send('NOT FOUND');
        }
    } catch (error) {
        logger.error(`Exchange Controller - ${error}`);
        handlerHttp(res, 'ERROR_GET_ITEM', error);
    }
}

const postExchange = async (req: Request, res: Response) => {
    try {
        const responseExchange = await InsertExchange(req.body);
        if (responseExchange) {
            res.send(responseExchange);
        }
        else {
            logger.error(`Exchange Controller - record not inserted ${req.body}`);
            res.status(500);
            res.send('NOT INSERTED');
        }
    } catch (error) {
        logger.error(`Exchange Controller - ${error}`);
        handlerHttp(res, 'ERROR_POST_ITEM', error);
    }
}

const updateExchange = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const responseExchange = await UpdateExchange(id, req.body);
        if (responseExchange) {
            res.send(responseExchange);
        }
        else {
            logger.error(`Exchange Controller - record not update ${req.body}`);
            res.status(500);
            res.send('NOT FOUND');
        }
    } catch (error) {
        logger.error(`Exchange Controller - ${error}`);
        handlerHttp(res, 'ERROR_UPDATE_ITEM', error);
    }
}

const deleteExchange = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const responseExchange = await DeleteExchange(id);
        if (responseExchange) {
            res.send(responseExchange);
        }
        else {
            logger.error(`Exchange Controller - record not deleted ${req.body}`);
            res.status(500);
            res.send('NOT FOUND');
        }
    } catch (error) {
        logger.error(`Exchange Controller - ${error}`);
        handlerHttp(res, 'ERROR_DELETE_ITEM ' + error);
    }
}

export { getExchange, getExchanges, updateExchange, postExchange, deleteExchange };
