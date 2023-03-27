import "dotenv/config";

import express from "express";
import cors from "cors";
import http from 'http';
import db from "./config/mongo";

import { Server } from 'socket.io';
import { Test } from "./test"

import { router } from "./routes";
import { LoggerService } from "./services/logger";
import { MarketService } from "./services/market";
import { SymbolService } from "./services/symbol";
import { GlobalsServices } from "./services/globals";
import { OpportunitiesServices } from "./services/opportunities";

import { BehaviorSubject, combineLatest, interval } from 'rxjs';
import { ExchangeService } from "./services/exchange";
import { Interfaces } from "./interfaces/app.interfaces";
import { JWTHandleUtils } from "./utils/jwt.handle";


namespace Main {

    // src
    const TEST = Number.parseInt(process.env.TEST || '0'); // buscar el puerto en .env variable de entorno de lo contrario false
    const PORT = process.env.PORT || 3001; // buscar el puerto en .env  variable de entorno de lo contrario 3001
    const app = express();
    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
        cors:
        {
            // handling CORS in socket.io v4.0 - https://socket.io/docs/v4/handling-cors/
            origin: process.env.CORS_REMOTE_HOST,
            allowedHeaders: ["authorization"],
            credentials: true,
        }
    });

    // REST - Enable CORS for all REST routes
    app.use(cors());
    app.use(express.json()); // para poder recibir datos REST en formato JSON por el Body
    app.use(router);

    // Socket.IO - Define the connection handler
    io.on('connection', (socket) => {
        
        const idHandShake = socket.id;
        const { nameRoom } = socket.handshake.query;
        const origin = socket.handshake.headers.origin;
        const jwt = socket.handshake.headers.authorization;
        
        const isValidToken = JWTHandleUtils.verifyToken(`${jwt}`) as { id: string };        
        if (!isValidToken) {
            LoggerService.logger.warn(`Incorrect token for socketio - ${jwt}`);
            socket.disconnect(true);
            return;
        }

        LoggerService.logger.info(`Connection origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom} authorization ${isValidToken.id}`);

        // for admin and interac purposes,  notify the rest of the users who accessed
        socket.broadcast.emit('Connection', `origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);

        socket.on('disconnect', () => {
            // for admin and interac purposes,  notify the rest of the users who accessed
            LoggerService.logger.info(`Disconnect ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);
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

    });

    const hearbeat = interval(1000); // let's do it with RxJS
    hearbeat.subscribe(i => io.emit('Heartbeat', new Date));

    // Declare the boolean observables to initialize application up until all server objects are ready
    const httpServerReadyObservable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    const dbServerReadyObservable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    // REST + SOCKETIO sobre el mismo httpServer
    httpServer.listen(PORT, () => LoggerService.logger.info(`Port ready ${PORT}`));
    httpServer.on('listening', async () => {
        console.log('Http Server is listening on port 3000');
        httpServerReadyObservable$.next(true);
    });

    // MongoDB
    db().then(async () => {
        LoggerService.logger.info("MongoDB Connection Ready");
        dbServerReadyObservable$.next(true);
    });

    // Combine the two boolean observables using combineLatest
    const combined$ = combineLatest([httpServerReadyObservable$, dbServerReadyObservable$]);

    const combinedSuscription = combined$.subscribe(async ([httpReady, dbReady]) => {

        if (httpReady && dbReady) {

            LoggerService.logger.info("Initializing Application");
            
            combinedSuscription.unsubscribe();
            httpServerReadyObservable$.unsubscribe();
            dbServerReadyObservable$.unsubscribe();

            if (TEST) {
                await Test.TestReactiveExtensions();
                await Test.TestAlgos();
            }
            
            await SymbolService.InitializeSymbolsFromDB();
            await MarketService.InitializeMarketsFromDB();

            // await OpportunitiesServices.InitializeCalculations(); // opportunity calculations must be performed only once and then happen async (observable)

            // Being this a full server, we may run directly from CCXT and no Database from intialization needed

            LoggerService.logger.info("+----------------------------------------+");
            LoggerService.logger.info("| Application loaded from DB persistance |");
            LoggerService.logger.info("+----------------------------------------+");
            LoggerService.logger.info(`ExchangesSymbolsDict ${GlobalsServices.ExchangesSymbolsDict.size}`);
            LoggerService.logger.info(`SymbolsDict ${GlobalsServices.SymbolsDict().size}`);
            LoggerService.logger.info(`SymbolsSet ${GlobalsServices.SymbolsSet().size}`);

            var sizes: Array<number> = [0, 0, 0, 0];
            GlobalsServices.Markets.forEach(i => sizes[i.length]++);
            LoggerService.logger.info(`Markets ${GlobalsServices.Markets.size} Duets ${sizes[2]} Triplets ${sizes[3]} Errors ${sizes[0] + sizes[1]}`);

            await ExchangeService.RefreshCCXTExchanges();
            await SymbolService.RefreshCCXTSymbolsFromExchanges(); // this equivalent must run realtime to keep on finding opportunities

            await MarketService.InitializeMarkets(); // this routine must run frequently to update pairs both in memory as in DB        
            await OpportunitiesServices.InitializeCalculations(); // opportunity calculations must be performed only once and then happen async (observable)
        }

    }); // -- db().then


} // namespace Main
