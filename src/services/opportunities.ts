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
    export const Calculate = (symbol: Interfaces.Symbol) => {
        const MarketsPerSymbol = GlobalsServices.MarketsIndexPerSymbol.get(symbol.name);
        if (MarketsPerSymbol) {
            for (const market_hashkey of MarketsPerSymbol) {
                const market = GlobalsServices.Markets.get(market_hashkey);
                if (market) {
                    // lets assume the spread is based on buying/selling one unit of the first leg
                    const position: Record<string, number> = {};
                    // LoggerService.logger.info(GlobalsServices.TextualizeMarket(market));

                    var text: string = "";

                    for (const kvp of market) {

                        if (kvp.key === "Long") {

                            Long(kvp.value, position);

                            text += `${kvp.key} ${kvp.value.exchange} ${kvp.value.name} at ask ${kvp.value.ask.px}, `;

                        } else if (kvp.key === "Short") {

                            Short(kvp.value, position);

                            text += `${kvp.key} ${kvp.value.exchange} ${kvp.value.name} at bid ${kvp.value.bid.px}, `;

                        }

                    }

                    for (const [currency, profit] of Object.entries(position)) {
                        if (profit) {
                            LoggerService.logger.info(`${market_hashkey} ${text} profits ${profit} ${currency}`);
                            opportunities.set(market_hashkey, profit);
                        }
                    }

                    // LoggerService.logger.info(`OpportunitiesServices::Calculate - ${market_hashkey} - ${GlobalsServices.TextualizeMarket(market)}`);


                }
                else {
                    LoggerService.logger.info(`Market exists on index but not on main container - ${market_hashkey}}`);
                }
            }
        }
    }

} // namespace GlobalsServices