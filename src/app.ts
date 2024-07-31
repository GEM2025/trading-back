import "dotenv/config";

import express from "express";
import cors from "cors";
import http from 'http';
import db from "./config/mongo";

import { BehaviorSubject, combineLatest, first, interval } from 'rxjs';
import { router } from "./routes";

import { LoggerService } from "./services/logger";
import { Server } from 'socket.io';
import { SocketIOService } from "./services/socketio";
import { MainService as MainService } from "./services/main";
import { SchedulerService } from "./services/scheduler";
import { TestService } from "./services/test";
import { LlamaIndex } from "./services/llama_index";


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

    // Declare the boolean observables to initialize application up until all server objects are ready
    const socketReadyObservable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    const httpServerReadyObservable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    const dbServerReadyObservable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    // Socket.IO - Define the connection handler
    io.on('connection', (socket) => {
        SocketIOService.setCallbacks(io, socket);
        socketReadyObservable$.next(true);        
    });

    const hearbeat = interval(1000); // RxJS heartbeat timer
    hearbeat.subscribe(i => {        
        // This method io.emit broadcasts the message to every client connected to the server (different from socket.broadcast.emit which excludes the sender)
        return io.emit('Heartbeat', new Date);
    });
    
    // REST (sobre el mismo httpServer puerto del SocketIO)
    httpServer.listen(PORT, () => {
        LoggerService.logger.info(`HttpServer Using Port ${PORT}`);
    });

    httpServer.on('listening', async () => {
        LoggerService.logger.info(`HttpServer Listening Port ${PORT}`);
        httpServerReadyObservable$.next(true);
    });
    
    // MongoDB
    db().then(async () => {
        LoggerService.logger.info("MongoDB Connection Ready");
        dbServerReadyObservable$.next(true);
    });

    // Wait both for Http and Db to be ready (let's use RxJS api)
    const dependenciesReady = ([httpReady, dbReady]: [boolean, boolean]) => httpReady && dbReady;
    combineLatest([httpServerReadyObservable$, dbServerReadyObservable$])
        .pipe(first(dependenciesReady))
        .subscribe(async () => {
            TestService.Run();
            LlamaIndex.Run();
            SchedulerService.Run();
            MainService.Run();
        }); 


} // namespace Main
