
import { Request, Response } from "express";
import { GetCondorExchanges, GetCondorExchange, InsertCondorExchange, UpdateCondorExchange, DeleteCondorExchange, } from "../services/condor_exchange";
import { handlerHttp } from "../utils/error.handler";
import { logger } from "../services/logger";

// controllers

/** http://localhost:3002/exchange */
const getCondorExchanges = async (req: Request, res: Response) => {

    try {

        const skip = Number.parseInt(req.query.skip?.toString() || "0") || 0;
        const limit = Number.parseInt(req.query.limit?.toString() || "999") || 999;

        logger.info(`Get exchanges skip ${skip} limit ${limit}`);
        const responseCondorExchanges = await GetCondorExchanges(skip, limit);
        if (responseCondorExchanges) {
            setTimeout(() => {
                res.send({ results: responseCondorExchanges, info: { seed: "", skip: skip, limit: limit, results: responseCondorExchanges.length, version: "0.1" } });
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

/** http://localhost:3002/exchange/63aa37ebd94c08c748fdd748 */
const getCondorExchange = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const responseCondorExchange = await GetCondorExchange(id);
        if (responseCondorExchange) {
            setTimeout(() => {
                res.send({ results: [responseCondorExchange], info: { seed: "", results: 1, version: "0.1" } });    
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

const postCondorExchange = async (req: Request, res: Response) => {
    try {
        const responseCondorExchange = await InsertCondorExchange(req.body);
        if (responseCondorExchange) {
            res.send(responseCondorExchange);
        }
        else {
            res.status(500);
            res.send('NOT INSERTED');
        }
    } catch (error) {
        handlerHttp(res, 'ERROR_POST_ITEM', error);
    }
}

const updateCondorExchange = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const responseCondorExchange = await UpdateCondorExchange(id, req.body);
        if (responseCondorExchange) {
            res.send(responseCondorExchange);
        }
        else {
            res.status(500);
            res.send('NOT FOUND');
        }
    } catch (error) {
        handlerHttp(res, 'ERROR_UPDATE_ITEM', error);
    }
}

const deleteCondorExchange = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const responseCondorExchange = await DeleteCondorExchange(id);
        if (responseCondorExchange) {
            res.send(responseCondorExchange);
        }
        else {
            res.status(500);
            res.send('NOT FOUND');
        }
    } catch (error) {
        handlerHttp(res, 'ERROR_DELETE_ITEM ' + error);
    }
}

export { getCondorExchange, getCondorExchanges, updateCondorExchange, postCondorExchange, deleteCondorExchange };
