
import { Request, Response } from "express";
import { ErrorHandlerUtils } from "../utils/error.handler";
import { SchedulerService } from "../services/scheduler";
import { LoggerService } from "../services/logger";

export namespace SchedulerController {

    // ------------------------------------------------------------------------------------------
    /** http://localhost:3002/scheduler */
    export const getJobs = async (req: Request, res: Response) => {

        try {

            const skip = Number.parseInt(req.query.skip?.toString() || "0") || 0;
            const limit = Number.parseInt(req.query.limit?.toString() || "999") || 999;
            let info = { seed: "", skip: skip, limit: limit, total: undefined, results: undefined, version: "0.1" };

            LoggerService.logger.info(`Get currencies skip ${skip} limit ${limit}`);
            const responseJobs = await SchedulerService.GetJobs(info);
            if (responseJobs) {
                setTimeout(() => {
                    res.send({ results: responseJobs, info: info });
                }, 300);
            }
            else {
                LoggerService.logger.error(`Scheduler Controller - no records found ${req.body}`);
                res.status(500);
                res.send('NO RECORDS FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Scheduler Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_GET_ITEMS', error);
        }
    }

    // ------------------------------------------------------------------------------------------
    /** http://localhost:3002/scheduler/63aa37ebd94c08c748fdd748 */
    export const getJob = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const responseScheduler = await SchedulerService.GetJob(id);
            if (responseScheduler) {
                setTimeout(() => {
                    res.send({ results: [responseScheduler], info: { seed: "", results: 1, version: "0.1" } });
                }, 300);
            }
            else {
                LoggerService.logger.error(`Scheduler Controller - scheduler not found ${req.body}`);
                res.status(500);
                res.send('NOT FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Scheduler Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_GET_ITEM', error);
        }
    }

    // ------------------------------------------------------------------------------------------
    export const postJob = async (req: Request, res: Response) => {
        try {
            const responseScheduler = await SchedulerService.UpsertJob(req.body);
            if (responseScheduler) {
                res.send(responseScheduler);
            }
            else {
                LoggerService.logger.error(`Scheduler Controller - scheduler not inserted ${req.body}`);
                res.status(500);
                res.send('NOT INSERTED');
            }
        } catch (error) {
            LoggerService.logger.error(`Scheduler Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_POST_ITEM', error);
        }
    }

    // ------------------------------------------------------------------------------------------
    export const updateJob = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const responseScheduler = await SchedulerService.UpdateJob(id, req.body);
            if (responseScheduler) {
                res.send(responseScheduler);
            }
            else {
                LoggerService.logger.error(`Scheduler Controller - scheduler not updated ${req.body}`);
                res.status(500);
                res.send('NOT FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Scheduler Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_UPDATE_ITEM', error);
        }
    }

    // ------------------------------------------------------------------------------------------
    export const deleteJob = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const responseScheduler = await SchedulerService.DeleteJob(id);
            if (responseScheduler) {
                res.send(responseScheduler);
            }
            else {
                LoggerService.logger.error(`Scheduler Controller - scheduler not deleted ${req.body}`);
                res.status(500);
                res.send('NOT FOUND');
            }
        } catch (error) {
            LoggerService.logger.error(`Scheduler Controller - ${error}`);
            ErrorHandlerUtils.handlerHttp(res, 'ERROR_DELETE_ITEM ' + error);
        }
    }
}
