import "dotenv/config";

import { ExchangeService } from "./exchange";
import { GlobalsServices } from "./globals";
import { LoggerService } from "./logger";
import { MarketService } from "./market";
import { SymbolService } from "./symbol";

// Services 

export namespace MainService {
    
    /**
     * Run - main service function process
     * */

    export const Run = async () => {

        LoggerService.logger.info("Service::Run - Initializing Service");
        
        await ExchangeService.InitializeExchangesFromDB();
        await SymbolService.InitializeSymbolsFromDB();
        await MarketService.InitializeMarketsFromDB();
                        
        LoggerService.logger.info(`Service::Run - ExchangesSymbolsDict ${GlobalsServices.ExchangesSymbolsDict.size}`);
        LoggerService.logger.info(`Service::Run - SymbolsDict ${GlobalsServices.SymbolsDict().size}`);
        LoggerService.logger.info(`Service::Run - SymbolsSet ${GlobalsServices.SymbolsSet().size}`);

        var sizes: Array<number> = [0, 0, 0, 0];
        GlobalsServices.Markets.forEach(i => sizes[i.length]++);
        LoggerService.logger.info(`Service::Run - Markets ${GlobalsServices.Markets.size} Duets ${sizes[2]} Triplets ${sizes[3]} Errors ${sizes[0] + sizes[1]}`);
        
    };

}
