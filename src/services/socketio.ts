// Services 

import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ExchangeService } from "./exchange";
import { JWTHandleUtils } from "../utils/jwt.handle";
import { LoggerService } from "./logger";
import { MarketService } from "./market";
import { OpportunitiesServices } from "./opportunities";
import { Server, Socket } from "socket.io";
import { SymbolService } from "./symbol";
import { IExchange } from "../interfaces/exchange.interfaces";

export namespace SocketIOService {

    export const setCallbacks = (io: Server, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {

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
        // socket.broadcast.emit sends a message to all connected clients, except the sender (the client who initiated the event). 
        // It is useful when you want to notify other clients about an event but don't want to send the message back to the client that triggered it.
        socket.broadcast.emit('Connection', `origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);

        socket.on('disconnect', () => {
            // for admin and interac purposes,  notify the rest of the users who accessed
            LoggerService.logger.info(`SocketIOService::setCallbacks - Disconnect ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);
            socket.broadcast.emit('Disconnect', `origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);
        });

        socket.on('SymbolService_InitializeSymbolsFromDB', async (data) => {
            await SymbolService.RefreshCCXTSymbolsFromExchanges();
            // socket.emit (no broadcast) sends the message to the connected client that emitted the event.
            socket.emit('SymbolService_InitializeSymbolsFromDB-response', { response: "Ok" });
        });

        socket.on('MarketService_InitializeMarketsFromDB', async (data) => {
            await MarketService.InitializeMarketsFromDB();
            // socket.emit (no broadcast) sends the message to the connected client that emitted the event.
            socket.emit('MarketService_InitializeMarketsFromDB-response', { response: "Ok" });
        });

        socket.on('OpportunitiesServices_InitializeCalculations', async (data) => {
            await OpportunitiesServices.RefreshCalculations();
            // socket.emit (no broadcast) sends the message to the connected client that emitted the event.
            socket.emit('OpportunitiesServices_InitializeCalculations-response', { response: "Ok" });
        });

        // ----------------------------------------------------------------------------------------

        socket.on('UpdateExchange', async (id: string, data: IExchange) => {
            console.log(`UpdateExchange ${id}`);
            const ex: IExchange = data;
            const update_result = await ExchangeService.UpdateExchange(id, ex);
            // socket.emit (no broadcast) sends the message to the connected client that emitted the event.
            socket.emit('UpsertExchange-response', { response: update_result ? "Ok" : "Error" });            
        });

        socket.on('Currency_Enabled', async (data) => {
            console.log(`Currency_Enabled {data}`);
            // socket.emit (no broadcast) sends the message to the connected client that emitted the event.
            socket.emit('Currency_Enabled-response', { response: "Ok" });
        });

        socket.on('Symbol_Enabled', async (data) => {
            console.log(`Symbol_Enabled {data}`);
            // socket.emit (no broadcast) sends the message to the connected client that emitted the event.
            socket.emit('Symbol_Enabled-response', { response: "Ok" });
        });

        socket.on('Market_Enabled', async (data) => {
            console.log(`Market_Enabled {data}`);
            // socket.emit (no broadcast) sends the message to the connected client that emitted the event.
            socket.emit('Market_Enabled-response', { response: "Ok" });
        });
        
    };


}
