import { Exchange } from 'ccxt';
import { CollectionsUtils } from '../utils/collections';
import { Interfaces } from '../interfaces/app.interfaces';
import { Dictionary, Market } from 'ccxt/js/src/base/types';

export namespace ExchangeApplicationModel {

    export class ExchangeApplication {
        PendingRequestsQueue = new CollectionsUtils.Queue<Market>();
        markets?: Dictionary<Market>;

        constructor(
            public id: string,
            public db_exchange: Interfaces.Exchange,
            public exchange: Exchange
        ) { }
    }
    
}