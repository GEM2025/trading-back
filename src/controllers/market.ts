import { Request, Response } from "express";
import { ErrorHandlerUtils } from "../utils/error.handler";
import { MarketService } from "../services/market";
import { LoggerService } from "../services/logger";

export namespace MarketController {
        
    // ------------------------------------------------------------------------------------------
    /** http://localhost:3002/market */
    export const getMarkets = async (req: Request, res: Response) => {

        try {

            const skip = Number.parseInt(req.query.skip?.toString() || "0") || 0;
            const limit = Number.parseInt(req.query.limit?.toString() || "999") || 999;
            let info = { seed: "", skip: skip, limit: limit, total: undefined, results: undefined, version: "0.1" };

            LoggerService.logger.info(`Get markets skip ${skip} limit ${limit}`);
            const responseMarkets = await MarketService.GetMarkets(info);
            if (responseMarkets) {
                setTimeout(() => {
                    res.send({ results: responseMarkets, info: info });
                }, 300);
            }
            else {
                LoggerService.logger.error(`Market Controller - no records found ${req.body}`);
                res.status(500);
                res.send('NO RECORDS FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Market Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_GET_ITEMS', error);
        }
    }

    // ------------------------------------------------------------------------------------------
    /** http://localhost:3002/market/63aa37ebd94c08c748fdd748 */
    export const getMarket = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const responseMarket = await MarketService.GetMarket(id);
            if (responseMarket) {
                setTimeout(() => {
                    res.send({ results: [responseMarket], info: { seed: "", results: 1, version: "0.1" } });
                }, 300);
            }
            else {
                LoggerService.logger.error(`Market Controller - market not found ${req.body}`);
                res.status(500);
                res.send('NOT FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Market Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_GET_ITEM', error);
        }
    }

    // ------------------------------------------------------------------------------------------
    export const postMarket = async (req: Request, res: Response) => {
        try {
            const responseMarket = await MarketService.UpsertMarket(req.body);
            if (responseMarket) {
                res.send(responseMarket);
            }
            else {
                LoggerService.logger.error(`Market Controller - market not inserted ${req.body}`);
                res.status(500);
                res.send('NOT INSERTED');
            }
        } catch (error) {
            LoggerService.logger.error(`Market Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_POST_ITEM', error);
        }
    }

    // ------------------------------------------------------------------------------------------
    export const updateMarket = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const responseMarket = await MarketService.UpdateMarket(id, req.body);
            if (responseMarket) {
                res.send(responseMarket);
            }
            else {
                LoggerService.logger.error(`Market Controller - market not updated ${req.body}`);
                res.status(500);
                res.send('NOT FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Market Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_UPDATE_ITEM', error);
        }
    }

    // ------------------------------------------------------------------------------------------
    export const deleteMarket = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const responseMarket = await MarketService.DeleteMarket(id);
            if (responseMarket) {
                res.send(responseMarket);
            }
            else {
                LoggerService.logger.error(`Market Controller - market not deleted ${req.body}`);
                res.status(500);
                res.send('NOT FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Market Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_DELETE_ITEM ' + error);
        }
    }
}
