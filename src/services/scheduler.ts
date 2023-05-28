import "dotenv/config";

import { ExchangeService } from "./exchange";
import { LoggerService } from "./logger";
import { MarketService } from "./market";
import { OpportunitiesServices } from "./opportunities";
import { SymbolService } from "./symbol";
import Agenda from "agenda";
import AgendaModel from "../models/agenda";
import { IAgendaJob } from '../interfaces/agenda.interface';

// Services 

export namespace SchedulerService {
    
    const DB_URI = <string>process.env.DB_URI;
    
    export const agenda = new Agenda({ db: { address: DB_URI } });

    // ---------------------------------
    export const GetJobs = async (info: any) => {        
        const responseInsert = await AgendaModel.find({}).skip(info.skip).limit(info.limit);
        info.total = await AgendaModel.find({}).countDocuments();
        info.results = responseInsert.length;
        return responseInsert;
    }

    // ---------------------------------
    export const GetJob = async (id: string) => {
        const responseInsert = await AgendaModel.findOne({ _id: id });
        return responseInsert;
    }

    // ---------------------------------
    export const UpsertJob = async (AgendaJob: IAgendaJob) => {
        try {
            // insert only if document not found        
            const responseInsert = await AgendaModel.findOneAndUpdate(
                { name: AgendaJob.name },
                { $setOnInsert: AgendaJob },
                { new: true, upsert: true });
            return responseInsert;
        } catch (error) {
            LoggerService.logger.error(`UpdateAgenda ${AgendaJob.name} ${error}`);
        }
        return null ;        
    }

    // ---------------------------------
    export const UpdateJob = async (id: string, AgendaJob: IAgendaJob) => {
        const responseInsert = await AgendaModel.findOneAndUpdate({ _id: id }, AgendaJob, { upsert: true, new: true, });
        return responseInsert;
    }

    // ---------------------------------
    export const DeleteJob = async (id: string) => {
        const responseInsert = await AgendaModel.findOneAndDelete({ _id: id });
        return responseInsert;
    }

    // ---------------------------------
    export const TryProgramJob = async (repeatInterval: string, name: string) => {
        const jobs = await SchedulerService.agenda.jobs({ name });
        if (!jobs.length) {
            LoggerService.logger.info(`Scheduler::Run - Scheduling ${name} at ${repeatInterval}`);
            await SchedulerService.agenda.every(repeatInterval, name, { shouldSaveResult: true });
            return true;
        }
        return false;
    };

    /* ********************************************
       * Run - scheduler service function process *
       ******************************************** */

    export const Run = async () => {

        LoggerService.logger.info("Scheduler::Run - Initializing Service");

        SchedulerService.agenda.define("RefreshCCXTExchanges", async (job, done) => {
            LoggerService.logger.info("Scheduler::Job - RefreshCCXTExchanges");
            const num_exchanges = await ExchangeService.RefreshCCXTExchanges();
            await SchedulerService.agenda.now('RefreshCCXTSymbolsFromExchanges', {});
            done();
            return num_exchanges; // save results to db for further monitoring
        });

        SchedulerService.agenda.define("RefreshCCXTSymbolsFromExchanges", async (job, done) => {
            LoggerService.logger.info("Scheduler::Job - RefreshCCXTSymbolsFromExchanges");
            const num_symbols = await SymbolService.RefreshCCXTSymbolsFromExchanges();
            await SchedulerService.agenda.now('InitializeMarkets', {});
            done();
            return num_symbols; // save results to db for further monitoring
        });

        SchedulerService.agenda.define("InitializeMarkets", async (job, done) => {
            LoggerService.logger.info("Scheduler::Job - InitializeMarkets");
            const num_markets = await MarketService.InitializeMarkets();
            await SchedulerService.agenda.now('RefreshCalculations', {});
            done();
            return num_markets; // save results to db for further monitoring
        });

        SchedulerService.agenda.define("RefreshCalculations", async (job, done) => {
            LoggerService.logger.info("Scheduler::Job - RefreshCalculations");
            const num_calculations = await OpportunitiesServices.RefreshCalculations();
            done();
            return num_calculations; // save results to db for further monitoring
        });

        await SchedulerService.agenda.start();

        
        // field          allowed values
        // -----          --------------
        // minute         0-59
        // hour           0-23
        // day of month   1-31
        // month          1-12 (or names, see below)
        // day of week    0-7 (0 or 7 is Sunday, or use names)

        // Refresh from CCXT and Initialize (Agenda will remember from persistance layer, but this works in the case those are lost or init)
        SchedulerService.TryProgramJob("0 0 * * mon-fri", "RefreshCCXTExchanges"); // run it once a day
        SchedulerService.TryProgramJob("0 1 * * mon-fri", "RefreshCCXTSymbolsFromExchanges"); // depends on the previous but we run it again (twice)
        SchedulerService.TryProgramJob("0 2 * * mon-fri", "InitializeMarkets"); // depends on the previous but we run it again (thrice)

        // opportunity calculations must be performed repeatedly, but this is not ideal
        SchedulerService.TryProgramJob("*/15 * * * mon-fri", "RefreshCalculations"); // depends on the previous but we run it again (thrice)

    };

}
