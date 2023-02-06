import ccxt from 'ccxt';
import { CollectionsUtils } from '../utils/collections';

export namespace ExchangeApplicationModel {

    export class ExchangeApplication {
        exchange!: ccxt.Exchange;
        PendingRequestsQueue: CollectionsUtils.Queue<ccxt.Market>;
        markets?: ccxt.Dictionary<ccxt.Market>;
        
        // ------------------------------------------------------------------------------------
        constructor(exchange: ccxt.Exchange) {
            this.exchange = exchange;
            this.PendingRequestsQueue = new CollectionsUtils.Queue<ccxt.Market>;
        }      

    };

}