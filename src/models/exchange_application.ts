import ccxt from 'ccxt';
import { CondorInterface } from '../interfaces/condor.interfaces';
import { CollectionsUtils } from '../utils/collections';
import { ExchangeService } from '../services/exchange';
import { LoggerService } from '../services/logger';
import { SymbolService } from '../services/symbol';
import { GlobalsServices } from '../services/globals';

export namespace ExchangeApplicationModel {

    export class ExchangeApplication {
        exchange!: ccxt.Exchange;
        symbolsQueue: CollectionsUtils.Queue<string>;
        markets?: ccxt.Dictionary<ccxt.Market>;
        openRequests: number = 0;

        // ------------------------------------------------------------------------------------
        constructor(exchange: ccxt.Exchange) {
            this.exchange = exchange;
            this.symbolsQueue = new CollectionsUtils.Queue<string>;
        }

        // ------------------------------------------------------------------------------------
        fetchOrderBook = async () => {

            const limit = Math.min(this.exchange.rateLimit, this.symbolsQueue.length());
            if (limit) {
                LoggerService.logger.debug(`OrderBook Fetching ${this.exchange.name} keys ${limit}/${this.symbolsQueue.length()}`);

                for (this.openRequests = 0; this.openRequests < limit; this.openRequests++) {
                    const symbol = this.symbolsQueue.dequeue();
                    if (symbol) {
                        const limit = this.exchange.name === "KuCoin" ? 20 : 1; //only get the top of book
                        const orderBook = this.exchange.fetchOrderBook(symbol, limit)
                            .then((value: ccxt.OrderBook) => {

                                const [base, term] = symbol.split('/');
                                const [bid_px, bid_size] = value.bids.length > 0 && value.bids[0].length > 0 ? [value.bids[0][0], value.bids[0][1]] : [0, 0];
                                const [ask_px, ask_size] = value.asks.length > 0 && value.asks[0].length > 0 ? [value.asks[0][0], value.asks[0][1]] : [0, 0];

                                const upsertSymbol: CondorInterface.Symbol = {
                                    name: symbol,
                                    exchange: this.exchange.name,
                                    pair: [base, term],
                                    bid: [bid_px, bid_size],
                                    ask: [ask_px, ask_size],
                                };

                                GlobalsServices.InsertSymbol(upsertSymbol);

                                SymbolService.InsertSymbol(upsertSymbol);

                                LoggerService.logger.debug(`Exchange ${this.exchange.name} symbol ${symbol} bbo ${bid_px}/${ask_px}`);
                            })
                            .catch((reason) => {
                                LoggerService.logger.warn(`Exchange ${this.exchange.name} symbol ${symbol} reason ${reason}`);
                            })
                            .finally(() => {
                                this.openRequests--;
                                if (!this.openRequests) {
                                    // recurse the next-package request
                                    LoggerService.logger.debug(`Exchange ${this.exchange.name} requests finalized`);
                                    this.fetchOrderBook();
                                }
                            });
                    }
                }
            }
            else {
                LoggerService.logger.info(`OrderBook Complete ${this.exchange.name}`);
            }
        }

    };

}