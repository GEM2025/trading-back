import { Interfaces } from "../interfaces/app.interfaces";
import { GlobalsServices } from "./globals";
import { LoggerService } from "./logger";

export namespace OpportunitiesServices {

    // -----------------------------------------------------------------------------------
    // here the duets or triplets are stored in a Set
    // markey_key vs theoretical raw trade opportunity (positive or negative)
    export const opportunities = new Map<string, number>();

    // Long Gemini BTC/USD, Short Kraken LTC/USD, Long Kraken LTC/BTC
    // Long
    // Short
    // you'll always have one name

    // LONG AAPL/MXN -> SHORT AAPL/USD -> SHORT USD/MXN
    //     +1 / -1000         -1 / +50      -50 / +1000

    // SHORT AAPL/MXN -> LONG AAPL/USD -> LONG USD/MXN
    //     -1 / +1000         -1 / +50     -50 / +1000

    // Long -> Buy at the ask -> In the base ,  out the term
    // Short -> Sell at the bid -> Out the base ,  in the term

    // ------------------------------------------------------------------------------------------------------------------------------
    const Long = (symbol: Interfaces.Symbol, position: Record<string, number>) => {

        const existing_base = position[symbol.pair.base] || 0; // if we don't have, we must long, so we assume we are short
        const existing_term = position[symbol.pair.term] || 0; // if we don't have, we must short, so we assume we are long

        if (existing_term) {
            position[symbol.pair.base] = existing_base + existing_term / symbol.ask.px;
            position[symbol.pair.term] = 0;
        }
        else if (existing_base) {
            position[symbol.pair.term] = existing_term + existing_base * symbol.ask.px;
            position[symbol.pair.base] = 0;
        }
        else {
            position[symbol.pair.base] = +1;
            position[symbol.pair.term] = -1 * symbol.ask.px;
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------------
    const Short = (symbol: Interfaces.Symbol, position: Record<string, number>) => {

        const existing_base = position[symbol.pair.base] || 0; // if we don't have, we must short, so we assume we are long
        const existing_term = position[symbol.pair.term] || 0; // if we don't have, we must long, so we assume we are short

        if (existing_term) {
            position[symbol.pair.base] = existing_base + existing_term / symbol.bid.px;
            position[symbol.pair.term] = 0;
        }
        else if (existing_base) {
            position[symbol.pair.term] = existing_term + existing_base * symbol.bid.px;
            position[symbol.pair.base] = 0;
        }
        else {
            position[symbol.pair.base] = -1 * symbol.bid.px;
            position[symbol.pair.term] = +1;
        }
    }

    // ------------------------------------------------------------------------------------
    export const CalculateMarket = (market: Array<GlobalsServices.KeyValuePair<string, Interfaces.Symbol>>): number => {

        let profit = 0;

        const first = market[0];
        const second = market[1];
        const third = market.length > 2 ? market[2] : undefined;

        const prices = {
            first: first.key === 'Long' ? first.value.ask.px : first.value.bid.px,
            second: second.key === 'Long' ? second.value.ask.px : second.value.bid.px,
            third: third?.key === 'Long' ? third?.value.ask.px : third?.value.bid.px,
        };

        if (first.key === "Long") {

            if (second.key === first.key) {

                profit = prices.first * prices.second; // long-long                

                if (third && prices.third) {

                    if (third.key === first.key) {

                        profit *= prices.third; // long-long-long 
                    }
                    else {

                        profit /= prices.third; // long-long-short

                    }
                }

            }
            else {

                profit = prices.first / prices.second;

                if (third && prices.third) {

                    if (third.key === first.key) {

                        profit *= prices.third; // long-short-long
                    }
                    else if (third.key !== first.key) {

                        profit /= prices.third; // long-short-short

                    }
                }

            }

            profit = 1 - profit;

        } else { // -- first.key === "Short"

            if (second.key === first.key) {

                profit = prices.first * prices.second;

                if (third && prices.third) {

                    if (third.key === first.key) {

                        profit *= prices.third; // short-short-short
                    }
                    else if (third.key !== first.key) {

                        profit /= prices.third; // short-short-long
                    }
                }

            }
            else {

                profit = prices.first / prices.second;

                if (third && prices.third) {

                    if (third.key === first.key) {

                        profit *= prices.third; // short-long-short
                    }
                    else if (third.key !== first.key) {

                        profit /= prices.third; // short-long-long

                    }
                }

            }

            profit = profit - 1;

        }
        return profit;
    }

    // ------------------------------------------------------------------------------------
    export const Calculate = (symbol: Interfaces.Symbol) => {

        const MarketsPerSymbol = GlobalsServices.MarketsIndexPerSymbol.get(symbol.name);
        if (MarketsPerSymbol) {
            for (const market_hashkey of MarketsPerSymbol) {
                const market = GlobalsServices.Markets.get(market_hashkey);
                if (market) {

                    if (market.length >= 2 && market.length <= 3) {

                        // lets assume the spread is based on buying/selling one unit of the first leg                        
                        const profit = CalculateMarket(market);
                        profit > 0 && LoggerService.logger.info(`OpportunitiesServices::Calculate - ${market_hashkey} - ${GlobalsServices.TextualizeMarket(market)} profit ${profit} ${market[0].value.pair.base}`);
                    }
                    else {
                        LoggerService.logger.error(`Market is neither a duplet nor a triplet - ${market_hashkey}`);
                    }

                }
                else {
                    LoggerService.logger.warn(`Market exists on index but not on main container - ${market_hashkey}`);
                }
            }
        }
    }

    export const InitializeCalculations = async () => {

        // we'll perform the statis calculations
        for (const symbol of GlobalsServices.SymbolsSet()) {
            // LoggerService.logger.info(`Calculating opportunity for - ${symbol.name}`);
            Calculate(symbol);
        }
    }

} // namespace GlobalsServices