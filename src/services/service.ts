import "dotenv/config";

import { ExchangeService } from "../services/exchange";
import { GlobalsServices } from "../services/globals";
import { LoggerService } from "./logger";
import { MarketService } from "../services/market";
import { OpportunitiesServices } from "../services/opportunities";
import { SymbolService } from "../services/symbol";
import { Test } from "../test"

// Services 

export namespace Service {

    const TEST = Number.parseInt(process.env.TEST || '0'); // buscar el puerto en .env variable de entorno de lo contrario false

    /**
     * Run - main service function process
     * */

    export const Run = async () => {

        LoggerService.logger.info("Service::Run - Initializing Service");
        
        if (TEST) {
            await Test.TestReactiveExtensions();
            await Test.TestAlgos();
        }
                
        await ExchangeService.InitializeExchangesFromDB();
        await SymbolService.InitializeSymbolsFromDB();
        await MarketService.InitializeMarketsFromDB();

        // await OpportunitiesServices.InitializeCalculations(); // opportunity calculations must be performed only once and then happen async (observable)
                
        LoggerService.logger.info(`Service::Run - ExchangesSymbolsDict ${GlobalsServices.ExchangesSymbolsDict.size}`);
        LoggerService.logger.info(`Service::Run - SymbolsDict ${GlobalsServices.SymbolsDict().size}`);
        LoggerService.logger.info(`Service::Run - SymbolsSet ${GlobalsServices.SymbolsSet().size}`);

        var sizes: Array<number> = [0, 0, 0, 0];
        GlobalsServices.Markets.forEach(i => sizes[i.length]++);
        LoggerService.logger.info(`Service::Run - Markets ${GlobalsServices.Markets.size} Duets ${sizes[2]} Triplets ${sizes[3]} Errors ${sizes[0] + sizes[1]}`);

        await ExchangeService.RefreshCCXTExchanges();
        await SymbolService.RefreshCCXTSymbolsFromExchanges(); // this equivalent must run realtime to keep on finding opportunities

        await MarketService.InitializeMarkets(); // this routine must run frequently to update pairs both in memory as in DB        
        await OpportunitiesServices.InitializeCalculations(); // opportunity calculations must be performed only once and then happen async (observable)

    };

}
