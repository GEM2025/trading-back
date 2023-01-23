
import { Request, Response } from "express";
import { ErrorHandlerUtils } from "../utils/error.handler";
import { SymbolService } from "../services/symbol";
import { LoggerService } from "../services/logger";

export namespace SymbolController {

    // ------------------------------------------------------------------------------------------
    /** http://localhost:3002/symbol */
    export const getSymbols = async (req: Request, res: Response) => {

        try {

            const skip = Number.parseInt(req.query.skip?.toString() || "0") || 0;
            const limit = Number.parseInt(req.query.limit?.toString() || "999") || 999;
            let info = { seed: "", skip: skip, limit: limit, total: undefined, results: undefined, version: "0.1" };

            LoggerService.logger.info(`Get symbols skip ${skip} limit ${limit}`);
            const responseSymbols = await SymbolService.GetSymbols(info);
            if (responseSymbols) {
                setTimeout(() => {
                    res.send({ results: responseSymbols, info: info });
                }, 300);
            }
            else {
                LoggerService.logger.error(`Symbol Controller - no records found ${req.body}`);
                res.status(500);
                res.send('NO RECORDS FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Symbol Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_GET_ITEMS', error);
        }
    }

    // ------------------------------------------------------------------------------------------
    /** http://localhost:3002/symbol/63aa37ebd94c08c748fdd748 */
    export const getSymbol = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const responseSymbol = await SymbolService.GetSymbol(id);
            if (responseSymbol) {
                setTimeout(() => {
                    res.send({ results: [responseSymbol], info: { seed: "", results: 1, version: "0.1" } });
                }, 300);
            }
            else {
                LoggerService.logger.error(`Symbol Controller - symbol not found ${req.body}`);
                res.status(500);
                res.send('NOT FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Symbol Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_GET_ITEM', error);
        }
    }

    // ------------------------------------------------------------------------------------------
    export const postSymbol = async (req: Request, res: Response) => {
        try {
            const responseSymbol = await SymbolService.InsertSymbol(req.body);
            if (responseSymbol) {
                res.send(responseSymbol);
            }
            else {
                LoggerService.logger.error(`Symbol Controller - symbol not inserted ${req.body}`);
                res.status(500);
                res.send('NOT INSERTED');
            }
        } catch (error) {
            LoggerService.logger.error(`Symbol Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_POST_ITEM', error);
        }
    }

    // ------------------------------------------------------------------------------------------
    export const updateSymbol = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const responseSymbol = await SymbolService.UpdateSymbol(id, req.body);
            if (responseSymbol) {
                res.send(responseSymbol);
            }
            else {
                LoggerService.logger.error(`Symbol Controller - symbol not updated ${req.body}`);
                res.status(500);
                res.send('NOT FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Symbol Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_UPDATE_ITEM', error);
        }
    }

    // ------------------------------------------------------------------------------------------
    export const deleteSymbol = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const responseSymbol = await SymbolService.DeleteSymbol(id);
            if (responseSymbol) {
                res.send(responseSymbol);
            }
            else {
                LoggerService.logger.error(`Symbol Controller - symbol not deleted ${req.body}`);
                res.status(500);
                res.send('NOT FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Symbol Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_DELETE_ITEM ' + error);
        }
    }
}
