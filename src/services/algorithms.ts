
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
    const OppositeSide = (Side: string): string => {
        return Side.toLowerCase() === "long" ? "Short" : (Side.toLocaleLowerCase() === "short" ? "Long" : "N/A");
    }

    // -----------------------------------------------------------------------------------
    const OppositeName = (symbol: CondorInterface.Symbol): string => {
        return `${symbol.pair[1]}/${symbol.pair[0]}`;
    }


    // Duet -----------------------------------------------------------------------------------
    export const InitializeDuets3rd = (first_symbol: CondorInterface.Symbol, second_symbol: CondorInterface.Symbol, open: string, hedge: string) => {

        const key_prev = `${open} ${first_symbol.exchange} ${first_symbol.name} ${hedge} ${second_symbol.exchange} ${second_symbol.name}`;
        if (!AlgorithmsService.Markets.has(key_prev)) {

            // ask side - the arb will start selling the first name
            const duet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
            const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>(OppositeSide(open), first_symbol);
            const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>(OppositeSide(hedge), second_symbol);
            duet.add(side_symbol_1);
            duet.add(side_symbol_2);
            AlgorithmsService.Markets.set(key_prev, duet);
        }
        else {
            LoggerService.logger.error(`Cannot add duet ${key_prev}`);
        }

    }


    // Duet -----------------------------------------------------------------------------------
    export const InitializeDuets2nd = (first_symbol: CondorInterface.Symbol, open: string, base: string, hedge: string, term: string) => {

        const second_symbols = GlobalsServices.SymbolsDict.get(term + '/' + base) || [];
        if (second_symbols) {

            for (const second_symbol of second_symbols) {

                // 3. Look for full circle names (duets cannot appear in the same exchange)
                if (first_symbol.exchange !== second_symbol.exchange) {

                    if (open !== hedge && first_symbol.name === second_symbol.name || open === hedge && first_symbol.name === OppositeName(second_symbol)) {

                        AlgorithmsService.InitializeDuets3rd(first_symbol, second_symbol, open, hedge);

                        // 3.1 Long/Long Duplets
                        // const key = `${open} ${second_symbol.exchange} ${second_symbol.name} ${hedge} ${first_symbol.exchange} ${first_symbol.name}`;
                        // if (AlgorithmsService.Markets.has(key)) {
                        //     AlgorithmsService.InitializeDuets3rd(first_symbol, second_symbol, OppositeSide(open), OppositeSide(hedge));
                        // }
                        // else {
                        //     AlgorithmsService.InitializeDuets3rd(first_symbol, second_symbol, open, hedge);
                        // }
                    }
                }
            }
        }
    }

    // Duet -----------------------------------------------------------------------------------
    export const InitializeDuets = (first_symbol: CondorInterface.Symbol) => {

        // 2. From right hand (term) lookp names on secon exchanges with the same value on any hand
        const base = first_symbol.pair[0];
        const term = first_symbol.pair[1];

        // Long USD/MXN vs Long MXN/USD - Left side
        // Short USD/MXN vs Short MXN/USD - Right side
        AlgorithmsService.InitializeDuets2nd(first_symbol, "Long", base, "Long", term);

        // Long USD/MXN vs Short USD/MXN - Left Side
        // Short USD/MXN vs Long USD/MXN - Right Side
        AlgorithmsService.InitializeDuets2nd(first_symbol, "Long", term, "Short", base);

    }


    // Triplet -----------------------------------------------------------------------------------
    export const InitializeTriplets3rd = (first_symbol: CondorInterface.Symbol, second_symbol: CondorInterface.Symbol, third_symbol: CondorInterface.Symbol, open: string, base: string, hedge: string, term: string) => {

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

    // Triplet -----------------------------------------------------------------------------------
    export const InitializeTriplets2nd = (first_symbol: CondorInterface.Symbol, second_symbol: CondorInterface.Symbol, open: string, base: string, hedge: string, term: string) => {

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

    // Triplet -----------------------------------------------------------------------------------
    export const InitializeTriplets1st = (first_symbol: CondorInterface.Symbol, open: string, base: string, hedge: string, term: string) => {

        // take right-hand termn and look for name with that term at the left hand base
        const second_symbols = GlobalsServices.BaseDict.get(term) || [];
        for (const second_symbol of second_symbols) {

            InitializeTriplets2nd(first_symbol, second_symbol, open, base, hedge, term);


            // {

            // const third_symbols = GlobalsServices.SymbolsDict.get(second_symbol.pair[1] + '/' + first_symbol.pair[0]) || [];
            // for (const third_symbol of third_symbols.values()) {

            // // 4.1.1 Long/Long/Long Triplets

            // const key = `Long ${second_symbol.exchange} ${second_symbol.name} Long ${first_symbol.exchange} ${first_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
            // if (Markets.has(key)) {

            //     const key_short = `Short ${first_symbol.exchange} ${first_symbol.name} Short ${second_symbol.exchange} ${second_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
            //     if (!Markets.has(key_short)) {

            //         const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
            //         const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Short", first_symbol);
            //         const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Short", second_symbol);
            //         const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Short", third_symbol);
            //         triplet.add(side_symbol_1);
            //         triplet.add(side_symbol_2);
            //         triplet.add(side_symbol_3);
            //         Markets.set(key_short, triplet);

            //     }
            //     else {
            //         LoggerService.logger.error(`Cannot add triplet ${key_short}`);
            //     }

            // }
            // else {

            //     const key_long = `Long ${first_symbol.exchange} ${first_symbol.name} Long ${second_symbol.exchange} ${second_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
            //     if (!Markets.has(key_long)) {

            //         const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
            //         const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Long", first_symbol);
            //         const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Long", second_symbol);
            //         const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Long", third_symbol);
            //         triplet.add(side_symbol_1);
            //         triplet.add(side_symbol_2);
            //         triplet.add(side_symbol_3);
            //         Markets.set(key_long, triplet);

            //     }
            //     else {
            //         LoggerService.logger.error(`Cannot add triplet ${key_long}`);
            //     }
            // }

            // }

            // }

            InitializeTriplets2nd(first_symbol, second_symbol, open, base, OppositeSide(hedge), term);

            //     {
            //         const third_symbols = GlobalsServices.SymbolsDict.get(first_symbol.pair[0] + '/' + second_symbol.pair[1]) || [];
            //         for (const third_symbol of third_symbols.values()) {

            //             // 4.1.2 Long/Long/Short Triplets

            //             const key = `Long ${second_symbol.exchange} ${second_symbol.name} Long ${first_symbol.exchange} ${first_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
            //             if (!Markets.has(key)) {

            //                 const key_short = `Short ${first_symbol.exchange} ${first_symbol.name} Short ${second_symbol.exchange} ${second_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
            //                 if (!Markets.has(key_short)) {

            //                     const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
            //                     const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Short", first_symbol);
            //                     const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Short", second_symbol);
            //                     const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Long", third_symbol);
            //                     triplet.add(side_symbol_1);
            //                     triplet.add(side_symbol_2);
            //                     triplet.add(side_symbol_3);
            //                     Markets.set(key_short, triplet);

            //                 }
            //                 else {
            //                     LoggerService.logger.error(`Cannot add triplet ${key_short}`);
            //                 }
            //             }
            //             else {

            //                 const key_long = `Long ${first_symbol.exchange} ${first_symbol.name} Long ${second_symbol.exchange} ${second_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
            //                 if (!Markets.has(key_long)) {

            //                     const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
            //                     const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Long", first_symbol);
            //                     const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Long", second_symbol);
            //                     const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Short", third_symbol);
            //                     triplet.add(side_symbol_1);
            //                     triplet.add(side_symbol_2);
            //                     triplet.add(side_symbol_3);
            //                     Markets.set(key_long, triplet);

            //                 }
            //                 else {
            //                     LoggerService.logger.error(`Cannot add triplet ${key_long}`);
            //                 }
            //             }
            //         }
            //     }
        }
    }

    // Triplet -----------------------------------------------------------------------------------
    export const InitializeTriplets = (first_symbol: CondorInterface.Symbol) => {

        // 2. From right hand (term) lookp names on secon exchanges with the same value on any hand

        {
            const second_symbols = GlobalsServices.BaseDict.get(first_symbol.pair[1]) || [];
            for (const second_symbol of second_symbols) {

                if (second_symbol.pair[1] === first_symbol.pair[0]) {

                    const long = `Long ${first_symbol.exchange} ${first_symbol.name} Long ${second_symbol.exchange} ${second_symbol.name}`;
                    LoggerService.logger.info(long);
                }
                else {

                    // Long USD/MXN vs Long MXN/EUR vs Long EUR/USD - Left side
                    // Short USD/MXN vs Short MXN/EUR vs Short EUR/USD - Left side
                    for (const third_symbol of GlobalsServices.SymbolsDict.get(second_symbol.pair[1] + '/' + first_symbol.pair[0]) || []) {

                        const long = `Long ${first_symbol.exchange} ${first_symbol.name} Long ${second_symbol.exchange} ${second_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
                        LoggerService.logger.info(long);

                        const short = `Short ${first_symbol.exchange} ${first_symbol.name} Short ${second_symbol.exchange} ${second_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
                        LoggerService.logger.info(short);
                    }

                    // Long USD/MXN vs Long MXN/EUR vs Short USD/EUR - Left side
                    // Short USD/MXN vs Short MXN/EUR vs Long USD/EUR - Right Side        
                    for (const third_symbol of GlobalsServices.SymbolsDict.get(first_symbol.pair[0] + '/' + second_symbol.pair[1]) || []) {

                        const long = `Long ${first_symbol.exchange} ${first_symbol.name} Long ${second_symbol.exchange} ${second_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
                        LoggerService.logger.info(long);

                        const short = `Short ${first_symbol.exchange} ${first_symbol.name} Short ${second_symbol.exchange} ${second_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
                        LoggerService.logger.info(short);
                    }
                }

            }
        }

        // 1. L L L  ok
        // 2. L L S  ok
        // 3. L S L  ok
        // 4. L S S
        // 5. S L L
        // 6. S L S  ok
        // 7. S S L  ok
        // 8. S S S  ok

        {

            const second_symbols = GlobalsServices.TermDict.get(first_symbol.pair[1]) || [];
            for (const second_symbol of second_symbols) {

                if (second_symbol.pair[0] === first_symbol.pair[0]) {

                    const long = `Long ${first_symbol.exchange} ${first_symbol.name} Short ${second_symbol.exchange} ${second_symbol.name}`;
                    LoggerService.logger.info(long);
                }
                else {

                    // Long USD/MXN vs Short EUR/MXN vs Long EUR/USD - Left side
                    // Short USD/MXN vs Long EUR/MXN vs Short EUR/USD - Right Side
                    for (const third_symbol of GlobalsServices.SymbolsDict.get(second_symbol.pair[0] + '/' + first_symbol.pair[0]) || []) {

                        const long = `Long ${first_symbol.exchange} ${first_symbol.name} Short ${second_symbol.exchange} ${second_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
                        LoggerService.logger.info(long);

                        const short = `Short ${first_symbol.exchange} ${first_symbol.name} Long ${second_symbol.exchange} ${second_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
                        LoggerService.logger.info(short);
                    }

                    // Long USD/MXN vs Short EUR/MXN vs Short USD/EUR - Left side
                    // Short USD/MXN vs Long EUR/MXN vs Long USD/EUR - Right Side    
                    for (const third_symbol of GlobalsServices.SymbolsDict.get(first_symbol.pair[0] + '/' + second_symbol.pair[0]) || []) {

                        const long = `Long ${first_symbol.exchange} ${first_symbol.name} Short ${second_symbol.exchange} ${second_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
                        LoggerService.logger.info(long);

                        const short = `Short ${first_symbol.exchange} ${first_symbol.name} Long ${second_symbol.exchange} ${second_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
                        LoggerService.logger.info(short);
                    }
                }
            }
        }
    }


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

        // 0. Validate the first rule: No arbitrage withing the same exchange
        for (const [exchange, symbols] of GlobalsServices.ExchangesSymbolsDict) {
            for (const [name, condor_symbol] of symbols) {
                const opposite_name = `${condor_symbol.pair[1]}/${condor_symbol.pair[0]}`;
                const opposite_symbol = symbols.get(opposite_name);
                if (opposite_symbol) {
                    LoggerService.logger.info(`${exchange} - ${name} ${condor_symbol.bid[0]}/${condor_symbol.ask[0]} vs ${opposite_name}  ${opposite_symbol.bid[0]}/${opposite_symbol.ask[0]}`);
                }
            }
        }

        // 1. let's obtain the base/term of all symbols            
        const size = GlobalsServices.SymbolsSet.size;
        let count = 0, prev = 0;
        for (const first_symbol of GlobalsServices.SymbolsSet) {

            let current = ++count / size;
            if (Math.round(100 * current) - prev > 10) {
                prev = Math.round(100 * current);
                LoggerService.logger.info(`Status ${prev}%`);
            }

            // AlgorithmsService.InitializeDuets(first_symbol);
            AlgorithmsService.InitializeTriplets(first_symbol);
        }

        // // 4.1 Long/Long/* Triplets
        // if (false) {
        //     const second_symbols = GlobalsServices.BaseDict.get(first_symbol.pair[1]) || [];
        //     for (const second_symbol of second_symbols.values()) {

        //         {
        //             const third_symbols = GlobalsServices.SymbolsDict.get(second_symbol.pair[1] + '/' + first_symbol.pair[0]) || [];
        //             for (const third_symbol of third_symbols.values()) {

        //                 // 4.1.1 Long/Long/Long Triplets

        //                 const key = `Long ${second_symbol.exchange} ${second_symbol.name} Long ${first_symbol.exchange} ${first_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
        //                 if (Markets.has(key)) {

        //                     const key_short = `Short ${first_symbol.exchange} ${first_symbol.name} Short ${second_symbol.exchange} ${second_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
        //                     if (!Markets.has(key_short)) {

        //                         const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
        //                         const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Short", first_symbol);
        //                         const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Short", second_symbol);
        //                         const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Short", third_symbol);
        //                         triplet.add(side_symbol_1);
        //                         triplet.add(side_symbol_2);
        //                         triplet.add(side_symbol_3);
        //                         Markets.set(key_short, triplet);

        //                     }
        //                     else {
        //                         LoggerService.logger.error(`Cannot add triplet ${key_short}`);
        //                     }

        //                 }
        //                 else {

        //                     const key_long = `Long ${first_symbol.exchange} ${first_symbol.name} Long ${second_symbol.exchange} ${second_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
        //                     if (!Markets.has(key_long)) {

        //                         const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
        //                         const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Long", first_symbol);
        //                         const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Long", second_symbol);
        //                         const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Long", third_symbol);
        //                         triplet.add(side_symbol_1);
        //                         triplet.add(side_symbol_2);
        //                         triplet.add(side_symbol_3);
        //                         Markets.set(key_long, triplet);

        //                     }
        //                     else {
        //                         LoggerService.logger.error(`Cannot add triplet ${key_long}`);
        //                     }
        //                 }

        //             }
        //         }

        //         {
        //             const third_symbols = GlobalsServices.SymbolsDict.get(first_symbol.pair[0] + '/' + second_symbol.pair[1]) || [];
        //             for (const third_symbol of third_symbols.values()) {

        //                 // 4.1.2 Long/Long/Short Triplets

        //                 const key = `Long ${second_symbol.exchange} ${second_symbol.name} Long ${first_symbol.exchange} ${first_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
        //                 if (!Markets.has(key)) {

        //                     const key_short = `Short ${first_symbol.exchange} ${first_symbol.name} Short ${second_symbol.exchange} ${second_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
        //                     if (!Markets.has(key_short)) {

        //                         const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
        //                         const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Short", first_symbol);
        //                         const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Short", second_symbol);
        //                         const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Long", third_symbol);
        //                         triplet.add(side_symbol_1);
        //                         triplet.add(side_symbol_2);
        //                         triplet.add(side_symbol_3);
        //                         Markets.set(key_short, triplet);

        //                     }
        //                     else {
        //                         LoggerService.logger.error(`Cannot add triplet ${key_short}`);
        //                     }
        //                 }
        //                 else {

        //                     const key_long = `Long ${first_symbol.exchange} ${first_symbol.name} Long ${second_symbol.exchange} ${second_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
        //                     if (!Markets.has(key_long)) {

        //                         const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
        //                         const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Long", first_symbol);
        //                         const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Long", second_symbol);
        //                         const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Short", third_symbol);
        //                         triplet.add(side_symbol_1);
        //                         triplet.add(side_symbol_2);
        //                         triplet.add(side_symbol_3);
        //                         Markets.set(key_long, triplet);

        //                     }
        //                     else {
        //                         LoggerService.logger.error(`Cannot add triplet ${key_long}`);
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }


        // // 4.2 Long/Short/* Triplets
        // if (false) {
        //     const second_symbols = GlobalsServices.TermDict.get(first_symbol.pair[1]) || [];
        //     for (const second_symbol of second_symbols.values()) {

        //         {
        //             const third_symbols = GlobalsServices.SymbolsDict.get(second_symbol.pair[0] + '/' + first_symbol.pair[0]) || [];
        //             for (const third_symbol of third_symbols.values()) {

        //                 // 4.2.1 Long/Short/Long Triplets

        //                 const key = `Long ${second_symbol.exchange} ${second_symbol.name} Short ${first_symbol.exchange} ${first_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
        //                 if (!Markets.has(key)) {

        //                     const key_long = `Short ${first_symbol.exchange} ${first_symbol.name} Long ${second_symbol.exchange} ${second_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
        //                     if (!Markets.has(key_long)) {

        //                         const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
        //                         const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Short", first_symbol);
        //                         const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Long", second_symbol);
        //                         const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Short", third_symbol);
        //                         triplet.add(side_symbol_1);
        //                         triplet.add(side_symbol_2);
        //                         triplet.add(side_symbol_3);
        //                         Markets.set(key_long, triplet);

        //                     }
        //                     else {
        //                         LoggerService.logger.error(`Cannot add triplet ${key_long}`);
        //                     }

        //                 }
        //                 else {

        //                     const key_long = `Long ${first_symbol.exchange} ${first_symbol.name} Short ${second_symbol.exchange} ${second_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
        //                     if (!Markets.has(key_long)) {

        //                         const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
        //                         const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Long", first_symbol);
        //                         const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Short", second_symbol);
        //                         const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Long", third_symbol);
        //                         triplet.add(side_symbol_1);
        //                         triplet.add(side_symbol_2);
        //                         triplet.add(side_symbol_3);
        //                         Markets.set(key_long, triplet);

        //                     }
        //                     else {
        //                         LoggerService.logger.error(`Cannot add triplet ${key_long}`);
        //                     }
        //                 }
        //             }
        //         }

        //         {
        //             const third_symbols = GlobalsServices.SymbolsDict.get(first_symbol.pair[0] + '/' + second_symbol.pair[0]) || [];
        //             for (const third_symbol of third_symbols.values()) {

        //                 // 4.2.2 Long/Short/Short Triplets

        //                 const key = `Long ${second_symbol.exchange} ${second_symbol.name} Short ${first_symbol.exchange} ${first_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
        //                 if (!Markets.has(key)) {

        //                     const key_long = `Short ${first_symbol.exchange} ${first_symbol.name} Long ${second_symbol.exchange} ${second_symbol.name} Long ${third_symbol.exchange} ${third_symbol.name}`;
        //                     if (!Markets.has(key_long)) {

        //                         const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
        //                         const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Short", first_symbol);
        //                         const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Long", second_symbol);
        //                         const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Long", third_symbol);
        //                         triplet.add(side_symbol_1);
        //                         triplet.add(side_symbol_2);
        //                         triplet.add(side_symbol_3);
        //                         Markets.set(key_long, triplet);

        //                     }
        //                     else {
        //                         LoggerService.logger.error(`Cannot add triplet ${key_long}`);
        //                     }

        //                 }
        //                 else {

        //                     const key_long = `Long ${first_symbol.exchange} ${first_symbol.name} Short ${second_symbol.exchange} ${second_symbol.name} Short ${third_symbol.exchange} ${third_symbol.name}`;
        //                     if (!Markets.has(key_long)) {

        //                         const triplet = new Set<KeyValuePair<string, CondorInterface.Symbol>>();
        //                         const side_symbol_1 = new KeyValuePair<string, CondorInterface.Symbol>("Long", first_symbol);
        //                         const side_symbol_2 = new KeyValuePair<string, CondorInterface.Symbol>("Short", second_symbol);
        //                         const side_symbol_3 = new KeyValuePair<string, CondorInterface.Symbol>("Short", third_symbol);
        //                         triplet.add(side_symbol_1);
        //                         triplet.add(side_symbol_2);
        //                         triplet.add(side_symbol_3);
        //                         Markets.set(key_long, triplet);

        //                     }
        //                     else {
        //                         LoggerService.logger.error(`Cannot add triplet ${key_long}`);
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }

        for (let [key, value] of AlgorithmsService.Markets) {
            LoggerService.logger.info(key);
        }
        LoggerService.logger.info(`Markets size ${Markets.size}`);
    }
}
