import "dotenv/config";

import express from "express";
import cors from "cors";
import http from 'http';
import db from "./config/mongo";

import { Server } from 'socket.io';

import { router } from "./routes";
import { LoggerService } from "./services/logger";
import { MarketsService } from "./services/market";
import { SymbolService } from "./services/symbol";
import { GlobalsServices } from "./services/globals";

namespace Main {

    // src
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
        const authorization = socket.handshake.headers.authorization;

        LoggerService.logger.info(`Connection origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom} authorization ${authorization}`);

        // for admin and interac purposes,  notify the rest of the users who accessed
        socket.broadcast.emit('Connection', `origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);

        socket.on('disconnect', () => {
            // for admin and interac purposes,  notify the rest of the users who accessed
            LoggerService.logger.info(`Disconnect ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);
            socket.broadcast.emit('Disconnect', `origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);
        });

    });

    // Socket.IO - Send the heartbeat message to all connected clients
    setInterval(() => {
        io.emit('Heartbeat', new Date);
    }, 1000);

    // Puro REST: app.listen(PORT, () => LoggerService.logger.info(`Port ready ${PORT}`)); pero para REST + SOCKETIO
    httpServer.listen(PORT, () => LoggerService.logger.info(`Port ready ${PORT}`));

    // MongoDB
    db().then(async () => {

        LoggerService.logger.info("MongoDB Connection Ready");

        // await SymbolService.InitializeSymbolsFromDB();
        // await MarketsService.InitializeMarketsFromDB();

        LoggerService.logger.info("+----------------------------------------+");
        LoggerService.logger.info("| Application loaded from DB persistance |");
        LoggerService.logger.info("+----------------------------------------+");
        LoggerService.logger.info(`ExchangesSymbolsDict ${GlobalsServices.ExchangesSymbolsDict.size}`);
        LoggerService.logger.info(`SymbolsExchangesDict ${GlobalsServices.SymbolsExchangesDict.size}`);
        LoggerService.logger.info(`SymbolsDict ${GlobalsServices.SymbolsDict().size}`);
        LoggerService.logger.info(`SymbolsSet ${GlobalsServices.SymbolsSet().size}`);

        // var sizes: Array<number> = [0, 0, 0, 0];
        // GlobalsServices.Markets.forEach(i => sizes[i.length]++);
        // LoggerService.logger.info(`Markets ${GlobalsServices.Markets.size} Duets ${sizes[2]} Triplets ${sizes[3]} Errors ${sizes[0] + sizes[1]}`);

        // await SymbolService.RefreshSymbolsFromCCXT(); // this equivalent must run realtime to keep on finding opportunities
        // await MarketsService.InitializeMarkets(); // this routine must run frequently to update pairs both in memory as in DB

    }); // db().then

} // namespace Main
