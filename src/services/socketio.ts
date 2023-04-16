// Services 

import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ExchangeService } from "./exchange";
import { Interfaces } from "../interfaces/app.interfaces";
import { JWTHandleUtils } from "../utils/jwt.handle";
import { LoggerService } from "./logger";
import { MarketService } from "./market";
import { OpportunitiesServices } from "./opportunities";
import { Socket } from "socket.io";
import { SymbolService } from "./symbol";

export namespace SocketIOService {

    export const setCallbacks = (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {

        const idHandShake = socket.id;
        const { nameRoom } = socket.handshake.query;
        const origin = socket.handshake.headers.origin;
        const jwt = socket.handshake.headers.authorization;
        
        const isValidToken = JWTHandleUtils.verifyToken(`${jwt}`) as { id: string };        
        if (!isValidToken) {
            LoggerService.logger.warn(`SocketIOService::setCallbacks - Incorrect token for socketio - ${jwt}`);
            socket.disconnect(true);
            return;
        }

        LoggerService.logger.info(`SocketIOService::setCallbacks - Connection origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom} authorization ${isValidToken.id}`);

        // for admin and interac purposes,  notify the rest of the users who accessed
        socket.broadcast.emit('Connection', `origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);

        socket.on('disconnect', () => {
            // for admin and interac purposes,  notify the rest of the users who accessed
            LoggerService.logger.info(`SocketIOService::setCallbacks - Disconnect ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);
            socket.broadcast.emit('Disconnect', `origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);
        });

        socket.on('SymbolService_InitializeSymbolsFromDB', async (data) => {
            await SymbolService.RefreshCCXTSymbolsFromExchanges();
            socket.emit('SymbolService_InitializeSymbolsFromDB-response', { response: "Ok" });
        });

        socket.on('MarketService_InitializeMarketsFromDB', async (data) => {
            await MarketService.InitializeMarketsFromDB();
            socket.emit('MarketService_InitializeMarketsFromDB-response', { response: "Ok" });
        });

        socket.on('OpportunitiesServices_InitializeCalculations', async (data) => {
            await OpportunitiesServices.InitializeCalculations();
            socket.emit('OpportunitiesServices_InitializeCalculations-response', { response: "Ok" });
        });

        // ----------------------------------------------------------------------------------------

        socket.on('UpdateExchange', async (id: string, data: Interfaces.Exchange) => {
            console.log(`UpdateExchange ${id}`);
            const ex: Interfaces.Exchange = data;
            const update_result = await ExchangeService.UpdateExchange(id, ex);
            socket.emit('UpsertExchange-response', { response: update_result ? "Ok" : "Error" });            
        });

        socket.on('Currency_Enabled', async (data) => {
            console.log(`Currency_Enabled {data}`);
            socket.emit('Currency_Enabled-response', { response: "Ok" });
        });

        socket.on('Symbol_Enabled', async (data) => {
            console.log(`Symbol_Enabled {data}`);
            socket.emit('Symbol_Enabled-response', { response: "Ok" });
        });

        socket.on('Market_Enabled', async (data) => {
            console.log(`Market_Enabled {data}`);
            socket.emit('Market_Enabled-response', { response: "Ok" });
        });
        
    };


}
