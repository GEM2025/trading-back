import { LoggerService } from "./logger";
import { MarketService } from "./market";
import { GlobalsServices } from "./globals";

export namespace LlamaIndex {

    const LLAMA_INDEX_TEST = Number.parseInt(process.env.LLAMA_INDEX_TEST || '0'); // buscar el puerto en .env variable de entorno de lo contrario false

    export const Run = async () => {
        
        if (LLAMA_INDEX_TEST > 0) {
            await LlamaIndex.Test();            
        }

        LoggerService.logger.info("LlamaIndex::Run - Initializing");


    }

    export const Test = async () => {

        LoggerService.logger.info("LlamaIndex::Test -------------------- Test LlamaIndex begin");


        LoggerService.logger.info("LlamaIndex::Test -------------------- Test LlamaIndex end");

    }
}
