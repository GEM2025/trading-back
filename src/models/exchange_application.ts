import { Exchange } from 'ccxt';
import { CollectionsUtils } from '../utils/collections';
import { Dictionary, Market } from 'ccxt/js/src/base/types';
import { IExchange } from '../interfaces/exchange.interfaces';

export namespace ExchangeApplicationModel {

    export class ExchangeApplication {
        PendingRequestsQueue = new CollectionsUtils.Queue<Market>();
        markets?: Dictionary<Market>;

        constructor(
            public id: string,
            public db_exchange: IExchange,
            public exchange: Exchange
        ) { }
    }
    
}