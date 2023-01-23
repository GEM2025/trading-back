
import { LoggerService } from "./logger";
import { GlobalsServices } from "./globals";
import { CondorInterface } from "../interfaces/condor.interfaces";

export namespace AlgorithmsService {

    // -----------------------------------------------------------------------------------
    export class KeyValuePair<K, V> {
        constructor(public key: K, public value: V) { }
    }

    // -----------------------------------------------------------------------------------
    // here the duets or triplets are stored Side vs
    export const Markets = new Map<string, Set<KeyValuePair<string, CondorInterface.Symbol>>>();

    // -----------------------------------------------------------------------------------
    export const InitializeAlgorithms = async () => {

        LoggerService.logger.info("Initializing Algorithms");
        LoggerService.logger.info(`Algorithms - ExchangesDict ${GlobalsServices.ExchangesSymbolsDict.size}`);
        LoggerService.logger.info(`Algorithms - SymbolsDict ${GlobalsServices.SymbolsExchangesDict.size}`);
        LoggerService.logger.info(`Algorithms - SymbolsDict ${GlobalsServices.SymbolsDict.size}`);
        LoggerService.logger.info(`Algorithms - BaseDict ${GlobalsServices.BaseDict.size}`);
        LoggerService.logger.info(`Algorithms - TermDict ${GlobalsServices.TermDict.size}`);
        LoggerService.logger.info(`Algorithms - SymbolsSet ${GlobalsServices.SymbolsSet.size}`);

        const exchanges = Array.from(GlobalsServices.ExchangesSymbolsDict.keys());
        // 1. let's obtain the base/term of all symbols            
        const size = GlobalsServices.SymbolsSet.size;
        let count = 0, prev = 0;
        for (const first_symbol of GlobalsServices.SymbolsSet) {

            let current = ++count / size;
            if (Math.round(100 * current) - prev > 10) {
                prev = Math.round(100 * current);
                LoggerService.logger.info(`Status ${prev}%`);
            }

            // 2. From right hand (term) lookp names on second exchanges with the same value on any hand

            {
                const second_symbols = GlobalsServices.SymbolsDict.get(first_symbol.pair[1] + '/' + first_symbol.pair[0]) || [];
                for (const second_symbol of second_symbols.values()) {

                    // 4. Look for full circle names (duets cannot appear in the same exchange)

                    if (first_symbol.exchange !== second_symbol.exchange) {

                        // 3.1 Long/Long Duplets

                        const key = `Long ${second_symbol.exchange} ${second_symbol.name} Long ${first_symbol.exchange} ${first_symbol.name}`;
                        if (Markets.has(key)) {

                            const key_short = `Short ${first_symbol.exchange} ${first_symbol.name} Short ${second_symbol.exchange} ${second_symbol.name}`;
                            if (!Markets.has(key_short)) {

                                // ask side - the arb will start selling the first name
                                const duet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
                                const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Short", first_symbol);
                                const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Short", second_symbol);
                                duet.add(side_symbol_1);
                                duet.add(side_symbol_2);
                                Markets.set(key_short, duet);
                            }
                            else {
                                LoggerService.logger.error(`Cannot add duet ${key_short}`);
                            }
                        }
                        else {

                            const key_long = `Long ${first_symbol.exchange} ${first_symbol.name} Long ${second_symbol.exchange} ${second_symbol.name}`;
                            if (!Markets.has(key_long)) {

                                // bid side - the arb will start buying the first name
                                const duet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
                                const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Long", first_symbol);
                                const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Long", second_symbol);
                                duet.add(side_symbol_1);
                                duet.add(side_symbol_2);
                                Markets.set(key_long, duet);
                            }
                            else {
                                LoggerService.logger.error(`Cannot add duet ${key_long}`);
                            }
                        }
                    }
                }
            }

            {
                const second_symbols = GlobalsServices.SymbolsDict.get(first_symbol.pair[0] + '/' + first_symbol.pair[1]) || [];
                for (const second_symbol of second_symbols.values()) {

                    if (first_symbol.exchange !== second_symbol.exchange) {

                        // 3.1 Long/Short Duplets

                        const key = `Long ${second_symbol.exchange} ${second_symbol.name} Short ${first_symbol.exchange} ${first_symbol.name}`;
                        if (Markets.has(key)) {

                            const key_short = `Short ${first_symbol.exchange} ${first_symbol.name} Long ${second_symbol.exchange} ${second_symbol.name}`;
                            if (!Markets.has(key_short)) {

                                // ask side - the arb will start selling the first name
                                const duet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
                                const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Short", first_symbol);
                                const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Long", second_symbol);
                                duet.add(side_symbol_1);
                                duet.add(side_symbol_2);
                                Markets.set(key_short, duet);
                            }
                            else {
                                LoggerService.logger.error(`Cannot add duet ${key_short}`);
                            }

                        }
                        else {

                            const key_long = `Long ${first_symbol.exchange} ${first_symbol.name} Short ${second_symbol.exchange} ${second_symbol.name}`;
                            if (!Markets.has(key_long)) {

                                // bid side - the arb will start buying the first name
                                const duet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
                                const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Long", first_symbol);
                                const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Short", second_symbol);
                                duet.add(side_symbol_1);
                                duet.add(side_symbol_2);
                                Markets.set(key_long, duet);
                            }
                            else {
                                LoggerService.logger.error(`Cannot add duet ${key_long}`);
                            }
                        }
                    }
                }
            }

            // 4.1 Long/Long/* Triplets
            {
                const second_symbols = GlobalsServices.BaseDict.get(first_symbol.pair[1]) || [];
                for (const second_symbol of second_symbols.values()) {

                    {
                        const third_symbols = GlobalsServices.SymbolsDict.get(second_symbol.pair[1] + '/' + first_symbol.pair[0]) || [];
                        for (const third_symbol of third_symbols.values()) {

                            // 4.1.1 Long/Long/Long Triplets

                            const key = `Long ${second_symbol.exchange} ${second_symbol.name} Long ${first_symbol.exchange} ${first_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
                            if (Markets.has(key)) {

                                const key_short = `Short ${first_symbol.exchange} ${first_symbol.name} Short ${second_symbol.exchange} ${second_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
                                if (!Markets.has(key_short)) {

                                    const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
                                    const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Short", first_symbol);
                                    const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Short", second_symbol);
                                    const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Short", third_symbol);
                                    triplet.add(side_symbol_1);
                                    triplet.add(side_symbol_2);
                                    triplet.add(side_symbol_3);
                                    Markets.set(key_short, triplet);

                                }
                                else {
                                    LoggerService.logger.error(`Cannot add triplet ${key_short}`);
                                }

                            }
                            else {

                                const key_long = `Long ${first_symbol.exchange} ${first_symbol.name} Long ${second_symbol.exchange} ${second_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
                                if (!Markets.has(key_long)) {

                                    const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
                                    const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Long", first_symbol);
                                    const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Long", second_symbol);
                                    const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Long", third_symbol);
                                    triplet.add(side_symbol_1);
                                    triplet.add(side_symbol_2);
                                    triplet.add(side_symbol_3);
                                    Markets.set(key_long, triplet);

                                }
                                else {
                                    LoggerService.logger.error(`Cannot add triplet ${key_long}`);
                                }
                            }

                        }
                    }

                    {
                        const third_symbols = GlobalsServices.SymbolsDict.get(first_symbol.pair[0] + '/' + second_symbol.pair[1]) || [];
                        for (const third_symbol of third_symbols.values()) {

                            // 4.1.2 Long/Long/Short Triplets

                            const key = `Long ${second_symbol.exchange} ${second_symbol.name} Long ${first_symbol.exchange} ${first_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
                            if (!Markets.has(key)) {

                                const key_short = `Short ${first_symbol.exchange} ${first_symbol.name} Short ${second_symbol.exchange} ${second_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
                                if (!Markets.has(key_short)) {

                                    const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
                                    const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Short", first_symbol);
                                    const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Short", second_symbol);
                                    const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Long", third_symbol);
                                    triplet.add(side_symbol_1);
                                    triplet.add(side_symbol_2);
                                    triplet.add(side_symbol_3);
                                    Markets.set(key_short, triplet);

                                }
                                else {
                                    LoggerService.logger.error(`Cannot add triplet ${key_short}`);
                                }
                            }
                            else {

                                const key_long = `Long ${first_symbol.exchange} ${first_symbol.name} Long ${second_symbol.exchange} ${second_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
                                if (!Markets.has(key_long)) {

                                    const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
                                    const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Long", first_symbol);
                                    const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Long", second_symbol);
                                    const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Short", third_symbol);
                                    triplet.add(side_symbol_1);
                                    triplet.add(side_symbol_2);
                                    triplet.add(side_symbol_3);
                                    Markets.set(key_long, triplet);

                                }
                                else {
                                    LoggerService.logger.error(`Cannot add triplet ${key_long}`);
                                }
                            }
                        }
                    }
                }
            }


            // 4.2 Long/Short/* Triplets
            {
                const second_symbols = GlobalsServices.TermDict.get(first_symbol.pair[1]) || [];
                for (const second_symbol of second_symbols.values()) {

                    {   
                        const third_symbols = GlobalsServices.SymbolsDict.get(second_symbol.pair[0] + '/' + first_symbol.pair[0]) || [];
                        for (const third_symbol of third_symbols.values()) {

                            // 4.2.1 Long/Short/Long Triplets

                            const key = `Long ${second_symbol.exchange} ${second_symbol.name} Short ${first_symbol.exchange} ${first_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
                            if (!Markets.has(key)) {

                                const key_long = `Short ${first_symbol.exchange} ${first_symbol.name} Long ${second_symbol.exchange} ${second_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
                                if (!Markets.has(key_long)) {

                                    const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
                                    const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Short", first_symbol);
                                    const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Long", second_symbol);
                                    const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Short", third_symbol);
                                    triplet.add(side_symbol_1);
                                    triplet.add(side_symbol_2);
                                    triplet.add(side_symbol_3);
                                    Markets.set(key_long, triplet);

                                }
                                else {
                                    LoggerService.logger.error(`Cannot add triplet ${key_long}`);
                                }

                            }
                            else {

                                const key_long = `Long ${first_symbol.exchange} ${first_symbol.name} Short ${second_symbol.exchange} ${second_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
                                if (!Markets.has(key_long)) {

                                    const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
                                    const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Long", first_symbol);
                                    const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Short", second_symbol);
                                    const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Long", third_symbol);
                                    triplet.add(side_symbol_1);
                                    triplet.add(side_symbol_2);
                                    triplet.add(side_symbol_3);
                                    Markets.set(key_long, triplet);

                                }
                                else {
                                    LoggerService.logger.error(`Cannot add triplet ${key_long}`);
                                }
                            }
                        }
                    }

                    {
                        const third_symbols = GlobalsServices.SymbolsDict.get(first_symbol.pair[0] + '/' + second_symbol.pair[0]) || [];
                        for (const third_symbol of third_symbols.values()) {

                            // 4.2.2 Long/Short/Short Triplets

                            const key = `Long ${second_symbol.exchange} ${second_symbol.name} Short ${first_symbol.exchange} ${first_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
                            if (!Markets.has(key)) {

                                const key_long = `Short ${first_symbol.exchange} ${first_symbol.name} Long ${second_symbol.exchange} ${second_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
                                if (!Markets.has(key_long)) {

                                    const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
                                    const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Short", first_symbol);
                                    const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Long", second_symbol);
                                    const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Long", third_symbol);
                                    triplet.add(side_symbol_1);
                                    triplet.add(side_symbol_2);
                                    triplet.add(side_symbol_3);
                                    Markets.set(key_long, triplet);

                                }
                                else {
                                    LoggerService.logger.error(`Cannot add triplet ${key_long}`);
                                }

                            }
                            else {

                                const key_long = `Long ${first_symbol.exchange} ${first_symbol.name} Short ${second_symbol.exchange} ${second_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
                                if (!Markets.has(key_long)) {

                                    const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
                                    const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Long", first_symbol);
                                    const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Short", second_symbol);
                                    const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Short", third_symbol);
                                    triplet.add(side_symbol_1);
                                    triplet.add(side_symbol_2);
                                    triplet.add(side_symbol_3);
                                    Markets.set(key_long, triplet);

                                }
                                else {
                                    LoggerService.logger.error(`Cannot add triplet ${key_long}`);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        LoggerService.logger.info(`Markets size ${Markets.size}`);
        // for (let [key, value] of Markets) {
        //     LoggerService.logger.info(key);
        // }
    }
}
