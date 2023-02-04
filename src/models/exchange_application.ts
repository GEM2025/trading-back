import ccxt from 'ccxt';
import { CollectionsUtils } from '../utils/collections';

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

    };

}