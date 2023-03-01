
import { Request, Response } from "express";
import { ErrorHandlerUtils } from "../utils/error.handler";
import { CurrencyService } from "../services/currency";
import { LoggerService } from "../services/logger";

export namespace CurrencyController {

    // ------------------------------------------------------------------------------------------
    /** http://localhost:3002/currency */
    export const getCurrencies = async (req: Request, res: Response) => {

        try {

            const skip = Number.parseInt(req.query.skip?.toString() || "0") || 0;
            const limit = Number.parseInt(req.query.limit?.toString() || "999") || 999;
            let info = { seed: "", skip: skip, limit: limit, total: undefined, results: undefined, version: "0.1" };

            LoggerService.logger.info(`Get currencies skip ${skip} limit ${limit}`);
            const responseCurrencies = await CurrencyService.GetCurrencies(info);
            if (responseCurrencies) {
                setTimeout(() => {
                    res.send({ results: responseCurrencies, info: info });
                }, 300);
            }
            else {
                LoggerService.logger.error(`Currency Controller - no records found ${req.body}`);
                res.status(500);
                res.send('NO RECORDS FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Currency Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_GET_ITEMS', error);
        }
    }

    // ------------------------------------------------------------------------------------------
    /** http://localhost:3002/currency/63aa37ebd94c08c748fdd748 */
    export const getCurrency = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const responseCurrency = await CurrencyService.GetCurrency(id);
            if (responseCurrency) {
                setTimeout(() => {
                    res.send({ results: [responseCurrency], info: { seed: "", results: 1, version: "0.1" } });
                }, 300);
            }
            else {
                LoggerService.logger.error(`Currency Controller - currency not found ${req.body}`);
                res.status(500);
                res.send('NOT FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Currency Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_GET_ITEM', error);
        }
    }

    // ------------------------------------------------------------------------------------------
    export const postCurrency = async (req: Request, res: Response) => {
        try {
            const responseCurrency = await CurrencyService.UpsertCurrency(req.body);
            if (responseCurrency) {
                res.send(responseCurrency);
            }
            else {
                LoggerService.logger.error(`Currency Controller - currency not inserted ${req.body}`);
                res.status(500);
                res.send('NOT INSERTED');
            }
        } catch (error) {
            LoggerService.logger.error(`Currency Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_POST_ITEM', error);
        }
    }

    // ------------------------------------------------------------------------------------------
    export const updateCurrency = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const responseCurrency = await CurrencyService.UpdateCurrency(id, req.body);
            if (responseCurrency) {
                res.send(responseCurrency);
            }
            else {
                LoggerService.logger.error(`Currency Controller - currency not updated ${req.body}`);
                res.status(500);
                res.send('NOT FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Currency Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_UPDATE_ITEM', error);
        }
    }

    // ------------------------------------------------------------------------------------------
    export const deleteCurrency = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const responseCurrency = await CurrencyService.DeleteCurrency(id);
            if (responseCurrency) {
                res.send(responseCurrency);
            }
            else {
                LoggerService.logger.error(`Currency Controller - currency not deleted ${req.body}`);
                res.status(500);
                res.send('NOT FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Currency Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_DELETE_ITEM ' + error);
        }
    }
}
