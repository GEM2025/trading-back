
import { Request, Response } from "express";
import { ExchangeService } from "../services/exchange";
import { ErrorHandlerUtils } from "../utils/error.handler";
import { LoggerService } from "../services/logger";

export namespace ExchangeController {

    // --------------------------------------------------------------------
    /** http://localhost:3002/exchange */
    export const getExchanges = async (req: Request, res: Response) => {

        try {

            const skip = Number.parseInt(req.query.skip?.toString() || "0") || 0;
            const limit = Number.parseInt(req.query.limit?.toString() || "999") || 999;

            LoggerService.logger.info(`Get exchanges skip ${skip} limit ${limit}`);
            const responseExchanges = await ExchangeService.GetExchanges(skip, limit);
            if (responseExchanges) {
                setTimeout(() => {
                    res.send({ results: responseExchanges, info: { seed: "", skip: skip, limit: limit, results: responseExchanges.length, version: "0.1" } });
                }, 300);
            }
            else {
                LoggerService.logger.error(`Exchange Controller - no records found ${req.body}`);
                res.status(500);
                res.send('NO RECORDS FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Exchange Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_GET_ITEMS', error);
        }
    }

    // --------------------------------------------------------------------
    /** http://localhost:3002/exchange/63aa37ebd94c08c748fdd748 */
    export const getExchange = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const responseExchange = await ExchangeService.GetExchange(id);
            if (responseExchange) {
                setTimeout(() => {
                    res.send({ results: [responseExchange], info: { seed: "", results: 1, version: "0.1" } });
                }, 300);
            }
            else {
                LoggerService.logger.error(`Exchange Controller - record not found ${req.body}`);
                res.status(500);
                res.send('NOT FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Exchange Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_GET_ITEM', error);
        }
    }

    // --------------------------------------------------------------------
    export const postExchange = async (req: Request, res: Response) => {
        try {
            const responseExchange = await ExchangeService.InsertExchange(req.body);
            if (responseExchange) {
                res.send(responseExchange);
            }
            else {
                LoggerService.logger.error(`Exchange Controller - record not inserted ${req.body}`);
                res.status(500);
                res.send('NOT INSERTED');
            }
        } catch (error) {
            LoggerService.logger.error(`Exchange Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_POST_ITEM', error);
        }
    }

    // --------------------------------------------------------------------
    export const updateExchange = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const responseExchange = await ExchangeService.UpdateExchange(id, req.body);
            if (responseExchange) {
                res.send(responseExchange);
            }
            else {
                LoggerService.logger.error(`Exchange Controller - record not update ${req.body}`);
                res.status(500);
                res.send('NOT FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Exchange Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_UPDATE_ITEM', error);
        }
    }

    // --------------------------------------------------------------------
    export const deleteExchange = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const responseExchange = await ExchangeService.DeleteExchange(id);
            if (responseExchange) {
                res.send(responseExchange);
            }
            else {
                LoggerService.logger.error(`Exchange Controller - record not deleted ${req.body}`);
                res.status(500);
                res.send('NOT FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Exchange Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_DELETE_ITEM ' + error);
        }
    }
}
