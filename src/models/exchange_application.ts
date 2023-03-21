import ccxt from 'ccxt';
import { CollectionsUtils } from '../utils/collections';
import { Interfaces } from '../interfaces/app.interfaces';

export namespace ExchangeApplicationModel {

    export class ExchangeApplication {
        db_exchange: Interfaces.Exchange;
        exchange: ccxt.Exchange;
        PendingRequestsQueue: CollectionsUtils.Queue<ccxt.Market>;
        markets?: ccxt.Dictionary<ccxt.Market>;
        
        // ------------------------------------------------------------------------------------
        constructor(db_exchange: Interfaces.Exchange, exchange: ccxt.Exchange) {
            this.db_exchange = db_exchange;
            this.exchange = exchange;
            this.PendingRequestsQueue = new CollectionsUtils.Queue<ccxt.Market>;
        }      

    };

}