import { Exchange } from 'ccxt';
import { CollectionsUtils } from '../utils/collections';
import { Interfaces } from '../interfaces/app.interfaces';
import { Market } from 'ccxt/js/src/base/types';

export namespace ExchangeApplicationModel {

    export class ExchangeApplication {
        db_exchange: Interfaces.Exchange;
        exchange: Exchange;
        PendingRequestsQueue: CollectionsUtils.Queue<Market>;
        markets?: Array<Market>;
        
        // ------------------------------------------------------------------------------------
        constructor(db_exchange: Interfaces.Exchange, exchange: Exchange) {
            this.db_exchange = db_exchange;
            this.exchange = exchange;
            this.PendingRequestsQueue = new CollectionsUtils.Queue<Market>;            
        }      

    };

}